import { SignJWT } from "jose";
export const jwt_secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signAccessToken(
  info = {},
  protectedHeader = { alg: "HS256" },
  expiryTime = "15m",
) {
  if (Object.keys(info).length == 0) {
    return;
  }

  const token = await new SignJWT(info)
    .setProtectedHeader(protectedHeader)
    .setIssuedAt()
    .setExpirationTime(expiryTime)
    .sign(jwt_secret);

  console.log("Access Token:", token);
  return token;
}

export async function signRefreshToken(
  info = {},
  protectedHeader = { alg: "HS256" },
  expiryTime = "7d",
) {
  return await signAccessToken(info, protectedHeader, expiryTime);
}
