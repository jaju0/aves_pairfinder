import "dotenv/config.js";

declare global
{
    namespace NodeJS
    {
        export interface ProcessEnv
        {
            PORT?: string;
            PRICE_SAMPLE_SIZE?: string;
            MONGODB_PORT: string;
            MONGODB_DB_NAME: string;
            MONGOOSE_USER?: string;
            MONGOOSE_PASS?: string;
            MONGOOSE_AUTH_SOURCE?: string;
            BYBIT_INSTRUMENTS_INFO_REFETCH_INTERVAL_HOURS: string;
            ADFULLER_MAX_LAG?: string;
            ADFULLER_MODEL?: "no_constant_no_trend" | "constant_no_trend" | "constant_trend";
            ADFULLER_SIGNIFICANCE_LEVEL?: "1%" | "2.5%" | "5%" | "10%";
            PAIR_FINDER_MAX_TSTAT?: string;
            PAIR_FINDER_MAX_HALF_LIFE?: string;
            PAIR_FINDER_ALLOWED_KLINE_INTERVALS?: string;
            PAIR_EXPIRATION_HOURS?: string;
        }
    }
}

const config = {
    PORT: process.env.PORT ?? "4001",
    PRICE_SAMPLE_SIZE: process.env.PRICE_SAMPLE_SIZE ?? "1000",
    MONGODB_PORT: process.env.MONGODB_PORT ?? "27017",
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME ?? "aves",
    MONGOOSE_USER: process.env.MONGOOSE_USER,
    MONGOOSE_PASS: process.env.MONGOOSE_PASS,
    MONGOOSE_AUTH_SOURCE: process.env.MONGOOSE_AUTH_SOURCE,
    BYBIT_INSTRUMENTS_INFO_REFETCH_INTERVAL_HOURS: process.env.BYBIT_INSTRUMENTS_INFO_REFETCH_INTERVAL_HOURS ?? "24",
    ADFULLER_MAX_LAG: process.env.ADFULLER_MAX_LAG,
    ADFULLER_MODEL: process.env.ADFULLER_MODEL,
    ADFULLER_SIGNIFICANCE_LEVEL: process.env.ADFULLER_SIGNIFICANCE_LEVEL,
    PAIR_FINDER_MAX_TSTAT: process.env.PAIR_FINDER_MAX_TSTAT,
    PAIR_FINDER_MAX_HALF_LIFE: process.env.PAIR_FINDER_MAX_HALF_LIFE,
    PAIR_FINDER_ALLOWED_KLINE_INTERVALS: process.env.PAIR_FINDER_ALLOWED_KLINE_INTERVALS ?? "*",
    PAIR_EXPIRATION_HOURS: process.env.PAIR_EXPIRATION_HOURS ?? "24",
};

export default config;