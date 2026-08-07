import dotenv from "dotenv";

dotenv.config();

// make JWT_SECRET required
function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `${name} is not set. Copy server/.env.example to server/.env and set it. ` +
      "The JWT secret is a credential - never hard-code it and never commit it."
    )
  }
  return value;
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  databaseUrl: process.env.DATABASE_URL || "",

  jwtSecret: requireEnv("JWT_SECRET"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
};

export default config;
