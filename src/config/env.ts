import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

export const isProduction = env.nodeEnv === 'production';

export const STARTING_CONNECTS = 50;
export const TOPUP_AMOUNT = 20;
export const WALLET_TOPUP_AMOUNT = 500;
export const SERVICE_FEE_RATE = 0.1;
