import { SignJWT, jwtVerify } from "jose";

export const MEMBER_COOKIE = "kumpark_member_token";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export interface MemberPayload {
  id: number;
  email: string;
  name: string;
}

export async function signMemberToken(payload: MemberPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyMemberToken(token: string): Promise<MemberPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as MemberPayload;
  } catch {
    return null;
  }
}
