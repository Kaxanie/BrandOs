import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().default("3000").transform((v)=>Number(v)),
	DATABASE_URL: z.string(),
	OPENAI_API_KEY: z.string().min(10),
	JWT_SECRET: z.string().min(16),
	APPLE_APP_SHARED_SECRET: z.string().optional(),
});

export const config = envSchema.parse(process.env);

