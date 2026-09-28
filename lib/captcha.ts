import { createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import pool from "./db";

const CODE_LENGTH = 5;
const TTL_SECONDS = 5 * 60;
const WIDTH = 170;
const HEIGHT = 56;

// Digit glyphs as polylines on a 10 x 16 grid. Drawn as paths (not <text>)
// so the answer cannot be read straight out of the SVG markup.
const GLYPHS: Record<string, number[][][]> = {
  "0": [[[2, 0], [8, 0], [10, 3], [10, 13], [8, 16], [2, 16], [0, 13], [0, 3], [2, 0]]],
  "1": [[[2, 4], [6, 0], [6, 16]], [[2, 16], [10, 16]]],
  "2": [[[0, 0], [10, 0], [10, 8], [0, 8], [0, 16], [10, 16]]],
  "3": [[[0, 0], [10, 0], [10, 16], [0, 16]], [[3, 8], [10, 8]]],
  "4": [[[7, 16], [7, 0], [0, 11], [10, 11]]],
  "5": [[[10, 0], [0, 0], [0, 8], [10, 8], [10, 16], [0, 16]]],
  "6": [[[10, 0], [0, 0], [0, 16], [10, 16], [10, 8], [0, 8]]],
  "7": [[[0, 0], [10, 0], [4, 16]]],
  "8": [[[0, 0], [10, 0], [10, 16], [0, 16], [0, 0]], [[0, 8], [10, 8]]],
  "9": [[[10, 8], [0, 8], [0, 0], [10, 0], [10, 16], [0, 16]]],
};

const key = () => createHmac("sha256", process.env.JWT_SECRET!).update("signup-captcha").digest();

const hashAnswer = (jti: string, answer: string) =>
  createHmac("sha256", key()).update(`${jti}:${answer}`).digest();

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const color = () => `rgb(${randomInt(20, 90)},${randomInt(20, 90)},${randomInt(20, 90)})`;

function renderSvg(code: string) {
  const parts: string[] = [];

  // Background noise lines
  for (let i = 0; i < 4; i++) {
    parts.push(
      `<path d="M${rand(0, WIDTH).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)} Q${rand(0, WIDTH).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)} ${rand(0, WIDTH).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)}" stroke="rgb(${randomInt(120, 200)},${randomInt(120, 200)},${randomInt(120, 200)})" stroke-width="${rand(1, 2).toFixed(1)}" fill="none"/>`
    );
  }

  const slot = WIDTH / code.length;
  code.split("").forEach((digit, i) => {
    const scale = rand(1.6, 1.9);
    const angle = rand(-12, 12);
    const cx = slot * i + slot / 2 + rand(-2, 2);
    const cy = HEIGHT / 2 + rand(-3, 3);
    const d = GLYPHS[digit]
      .map((line) =>
        line
          .map(([x, y], j) => {
            const px = (x - 5) * scale + rand(-1, 1);
            const py = (y - 8) * scale + rand(-1, 1);
            return `${j === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
          })
          .join(" ")
      )
      .join(" ");
    parts.push(
      `<path transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angle.toFixed(1)})" d="${d}" stroke="${color()}" stroke-width="${rand(2.5, 3.5).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    );
  });

  // Foreground noise lines crossing the digits
  for (let i = 0; i < 1; i++) {
    parts.push(
      `<path d="M0 ${rand(10, HEIGHT - 10).toFixed(1)} C${rand(30, 70).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)} ${rand(100, 140).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)} ${WIDTH} ${rand(10, HEIGHT - 10).toFixed(1)}" stroke="${color()}" stroke-width="1.5" fill="none"/>`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><rect width="100%" height="100%" fill="#f3f4f6"/>${parts.join("")}</svg>`;
}

export async function createCaptcha() {
  const code = Array.from({ length: CODE_LENGTH }, () => randomInt(0, 10)).join("");
  const jti = randomUUID();
  const token = await new SignJWT({ h: hashAnswer(jti, code).toString("hex") })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(key());
  const image = `data:image/svg+xml;base64,${Buffer.from(renderSvg(code)).toString("base64")}`;
  return { token, image };
}

// Checks the answer and consumes the challenge, so each image works only once
// (right or wrong). This blocks both replaying a solved token and brute force.
export async function verifyCaptcha(token: unknown, answer: unknown) {
  if (typeof token !== "string" || typeof answer !== "string") return false;

  let jti: string;
  let expected: Buffer;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.jti || typeof payload.h !== "string") return false;
    jti = payload.jti;
    expected = Buffer.from(payload.h, "hex");
  } catch {
    return false;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS captcha_used (
      jti     TEXT PRIMARY KEY,
      used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE captcha_used ENABLE ROW LEVEL SECURITY`);
  await pool.query(`DELETE FROM captcha_used WHERE used_at < NOW() - INTERVAL '1 hour'`);
  const { rowCount } = await pool.query(
    "INSERT INTO captcha_used (jti) VALUES ($1) ON CONFLICT DO NOTHING",
    [jti]
  );
  if (!rowCount) return false;

  const actual = hashAnswer(jti, answer.replace(/\s/g, ""));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
