import mongoose from "mongoose";
import { KlineIntervalV3 } from "bybit-api";

declare module "mongoose"
{
    namespace Schema
    {
        namespace Types
        {
            class KlineInterval extends mongoose.SchemaTypes.String { }
        }
    }
}

export const klineInterval = ['1', '3', '5', '15' , '30' , '60' , '120' , '240' , '360' , '720' , 'D' , 'W' , 'M'] as const;

export class KlineInterval extends mongoose.SchemaTypes.String
{
    constructor(key: string, options: mongoose.AnyObject)
    {
        super(key, options, "KlineInterval");
    }

    public cast(val: any, doc: mongoose.Document<any>, init: boolean, prev?: any, options?: any)
    {
        for(const interval of klineInterval)
        {
            if(val === interval)
                return val as KlineIntervalV3;
        }

        throw new Error(`KlineInterval: ${val} is not a kline interval`);
    }
}

mongoose.Schema.Types.KlineInterval = KlineInterval;
mongoose.SchemaTypes.KlineInterval = KlineInterval;