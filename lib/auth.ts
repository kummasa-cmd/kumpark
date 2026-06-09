import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "kumpark_admin_token";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export interface AdminPayload {
  id: number;
  email: string;
  role: string;
}

export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret());
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}
