import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    PORT: process.env.PORT ?? "3000",

    // AWS Cognito
    DB_HOST: requireEnv("DB_HOST"),
    DB_USER: requireEnv("DB_USER"),
    DB_PASS: requireEnv("DB_PASS"),
    DB_NAME: requireEnv("DB_NAME"),
    EMAIL_USER: requireEnv("EMAIL_USER"),
    EMAIL_PASS: requireEnv("EMAIL_PASS"),
    ACCESS_TOKEN_SECRET: requireEnv("ACCESS_TOKEN_SECRET"),
    REFRESH_TOKEN_SECRET: requireEnv("REFRESH_TOKEN_SECRET"),
    ACCESS_TOKEN_EXPIRES_IN: requireEnv("ACCESS_TOKEN_EXPIRES_IN"),
    REFRESH_TOKEN_EXPIRES_IN: requireEnv("REFRESH_TOKEN_EXPIRES_IN")

};
