import { KlineIntervalV3 } from "bybit-api";
import mongoose from "mongoose";
import config from "../config.js";
import { KlineInterval } from "../types/KlineInterval.js";

export interface IPair extends mongoose.Document
{
    created_at: Date;
    symbol1: string;
    symbol2: string;
    interval: KlineIntervalV3;
    slope: number;
    tstat: number;
    lag: number;
    half_life: number;
}

const pairSchema = new mongoose.Schema<IPair>({
    created_at: { type: Date, expires: +config.PAIR_EXPIRATION_HOURS * 60 * 60, default: Date.now },
    symbol1: { type: String, required: true },
    symbol2: { type: String, required: true },
    interval: { type: KlineInterval, required: true },
    slope: { type: Number, required: true },
    tstat: { type: Number, required: true },
    lag: { type: Number, required: true },
    half_life: { type: Number, required: true },
});

export const Pair = mongoose.model<IPair>("Pair", pairSchema);
export type Pair = InstanceType<typeof Pair>;