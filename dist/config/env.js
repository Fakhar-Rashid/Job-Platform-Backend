import 'dotenv/config';
function required(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing environment variable: ${name}`);
    return value;
}
export const env = {
    databaseUrl: required('DATABASE_URL'),
    jwtSecret: required('JWT_SECRET'),
    port: Number(process.env.PORT ?? 4000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};
export const STARTING_CONNECTS = 50;
export const BID_CONNECT_COST = 5;
export const TOPUP_AMOUNT = 20;
//# sourceMappingURL=env.js.map