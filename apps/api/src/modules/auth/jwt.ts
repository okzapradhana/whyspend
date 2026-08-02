import { SignJWT, jwtVerify } from "jose";

const issuer = "whyspend-api";
const audience = "whyspend";

function getSecret() {
  const secret = process.env.JWT_SECRET ?? "local-development-secret-change-me";
  return new TextEncoder().encode(secret);
}

export interface AuthClaims {
  subjectUserId: string;
  householdIds: string[];
}

export async function signAccessToken(claims: AuthClaims) {
  return new SignJWT({ householdIds: claims.householdIds })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(claims.subjectUserId)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "2h")
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, getSecret(), { issuer, audience });
  const householdIds = Array.isArray(payload.householdIds) ? payload.householdIds.map(String) : [];
  if (!payload.sub) {
    throw new Error("Missing token subject");
  }
  return {
    subjectUserId: payload.sub,
    householdIds
  };
}
