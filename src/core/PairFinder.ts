import { KlineIntervalV3, RestClientV5 } from "bybit-api";
import * as mathjs from "mathjs";
import { klineInterval } from "../types/KlineInterval.js";
import { InstrumentsInfoProvider } from "./InstrumentsInfoProvider.js";
import { adfuller, ar_halfLife, OLS } from "./statistics.js";
import config from "../config.js";
import { Pair } from "../models/Pair.js";

export class PairFinder
{
    private instInfoProvider: InstrumentsInfoProvider;
    private restClient: RestClientV5;
    private isRunning: boolean;

    private allowedKlineIntervals: KlineIntervalV3[];

    constructor(instInfoProvider: InstrumentsInfoProvider, restClient: RestClientV5)
    {
        this.instInfoProvider = instInfoProvider;
        this.restClient = restClient;
        this.isRunning = false;
        this.allowedKlineIntervals = this.getAllowedKlineIntervalsFromConfig();
    }

    public async run()
    {
        if(this.isRunning)
            return;

        this.isRunning = true;

        while(this.isRunning)
        {
            try
            {
                const [symbol1, symbol2] = await this.getTwoRandomSymbols();
                const interval = this.getRandomKlineInterval();
                const symbol1Prices = await this.getPrices(symbol1, interval, +config.PRICE_SAMPLE_SIZE);
                const symbol2Prices = await this.getPrices(symbol2, interval, +config.PRICE_SAMPLE_SIZE);

                if(symbol1Prices.length !== symbol2Prices.length)
                    continue;

                const priceRegressionResults = OLS(symbol1Prices, symbol2Prices);
                const residualsArray = priceRegressionResults.residuals.toArray().map(value => value.valueOf() as number);
                const halfLife = Math.abs(ar_halfLife(residualsArray));

                if(config.PAIR_FINDER_MAX_HALF_LIFE && halfLife > +config.PAIR_FINDER_MAX_HALF_LIFE)
                    continue;

                const adfullerResults = adfuller(residualsArray, config.ADFULLER_MAX_LAG ? +config.ADFULLER_MAX_LAG : undefined, config.ADFULLER_MODEL);
                const slope = priceRegressionResults.params as number;
                const tstat = +(adfullerResults.result.tstat.valueOf() as string);
                const lagUsed = adfullerResults.lagUsed;

                if(config.ADFULLER_SIGNIFICANCE_LEVEL && mathjs.larger(adfullerResults.result.tstat, adfullerResults.criticalValues[config.ADFULLER_SIGNIFICANCE_LEVEL]))
                    continue;

                if(config.PAIR_FINDER_MAX_TSTAT && tstat > +config.PAIR_FINDER_MAX_TSTAT)
                    continue;

                const pair = new Pair({
                    symbol1,
                    symbol2,
                    interval,
                    slope: slope.toString(),
                    tstat: tstat.toString(),
                    lag: lagUsed.toString(),
                    half_life: halfLife.toString(),
                });

                console.log(pair);

                await pair.save();
            }
            catch(error)
            {
                continue;
            }
        }
    }

    public shutdown()
    {
        this.isRunning = false;
    }

    public get IsRunning()
    {
        return this.isRunning;
    }

    private getAllowedKlineIntervalsFromConfig()
    {
        if(config.PAIR_FINDER_ALLOWED_KLINE_INTERVALS === "*")
            return klineInterval as unknown as KlineIntervalV3[];

        const extractedConfigValues = config.PAIR_FINDER_ALLOWED_KLINE_INTERVALS.split(",").map(val => val.trim());
        const klineIntervals = new Set(klineInterval);
        for(const value of extractedConfigValues)
        {
            if(!klineIntervals.has(value as KlineIntervalV3))
                throw new Error(`${value} is not an allowed kline interval. Please check your config.`);
        }

        return extractedConfigValues as KlineIntervalV3[];
    }

    private async getTwoRandomSymbols()
    {
        const symbols = Array.from(await this.instInfoProvider.getSymbols());
        if(symbols.length < 2)
            throw new Error("PairFinder: Less than two symbols available but we need at least two");

        for(let i = symbols.length-1; i > 0; --i)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
        }

        return [symbols[0], symbols[1]];
    }

    private getRandomKlineInterval()
    {
        const randomIndex = Math.floor(Math.random() * this.allowedKlineIntervals.length);
        return this.allowedKlineIntervals[randomIndex];
    }

    private async getPrices(symbol: string, interval: KlineIntervalV3, sampleSize: number)
    {
        let prices = new Array<number>();

        const klineResponse = await this.restClient.getKline({
            category: "linear",
            symbol,
            interval,
            limit: sampleSize < 1000 ? sampleSize : 1000,
        });

        if(klineResponse.result?.list)
            prices = klineResponse.result.list.map(kline => +kline[4]);

        return prices;
    }
}