import { APIResponseV3WithTime, InstrumentInfoResponseV5, LinearInverseInstrumentInfoV5, RestClientV5 } from "bybit-api";

export class InstrumentsInfoProvider
{
    private restClient: RestClientV5;
    private instrumentsInfoPromise: Promise<APIResponseV3WithTime<InstrumentInfoResponseV5<"linear">> | undefined>;
    private instrumentsInfo: Map<string, LinearInverseInstrumentInfoV5>;

    constructor(restClient: RestClientV5, refetchIntervalMs: number)
    {
        this.restClient = restClient;
        this.instrumentsInfoPromise = this.fetch();
        this.instrumentsInfo = new Map();

        setInterval(() => {
            this.instrumentsInfoPromise = this.fetch();
        }, refetchIntervalMs);
    }

    public async get(symbol: string)
    {
        await this.instrumentsInfoPromise;
        return this.instrumentsInfo.get(symbol);
    }

    public async getSymbols()
    {
        await this.instrumentsInfoPromise;
        return this.instrumentsInfo.keys();
    }

    private async fetch()
    {
        try
        {
            const instrumentsInfoResponse = await this.restClient.getInstrumentsInfo({ category: "linear" });
            this.instrumentsInfo = new Map();
            for(const instInfo of instrumentsInfoResponse.result.list)
            {
                if(instInfo.symbol.endsWith("USDT"))
                    this.instrumentsInfo.set(instInfo.symbol, instInfo);
            }

            return instrumentsInfoResponse;
        }
        catch(error)
        {
            console.error(error);
        }
    }
}