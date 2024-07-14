import mongoose from "mongoose";
import express from "express";
import { RestClientV5 } from "bybit-api";
import { InstrumentsInfoProvider } from "./core/InstrumentsInfoProvider.js";
import { PairFinder } from "./core/PairFinder.js";
import { v1Router } from "./routes/v1/index.js";
import config from "./config.js";

async function main()
{
    const restClient = new RestClientV5();

    const instrumentsInfoRefetchIntervalMs = +config.BYBIT_INSTRUMENTS_INFO_REFETCH_INTERVAL_HOURS * 60 * 60 * 1000;

    const instInfoProvider = new InstrumentsInfoProvider(restClient, instrumentsInfoRefetchIntervalMs);
    const pairFinder = new PairFinder(instInfoProvider, restClient);

    await mongoose.connect(`mongodb://mongodb:${config.MONGODB_PORT}/${config.MONGODB_DB_NAME}`, {
        auth: config.MONGOOSE_USER && config.MONGOOSE_PASS ? {
            username: config.MONGOOSE_USER,
            password: config.MONGOOSE_PASS,
        } : undefined,
        authSource: config.MONGOOSE_AUTH_SOURCE,
    });

    pairFinder.run();

    const app = express();

    app.use(express.json());
    app.use("/v1", v1Router(pairFinder));

    app.listen(config.PORT, () => {
        console.log(`pairfinder listening on port ${config.PORT}`);
    });
}

main();