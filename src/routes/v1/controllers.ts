import { Request, Response } from "express";
import { PairFinder } from "../../core/PairFinder.js";

export interface StatusResponse
{
    isRunning: boolean;
}

export function statusHandler(pairFinder: PairFinder, req: Request, res: Response<StatusResponse>)
{
    return res.json({
        isRunning: pairFinder.IsRunning,
    });
}

export function startHandler(pairFinder: PairFinder, req: Request, res: Response<StatusResponse>)
{
    pairFinder.run();

    return res.json({
        isRunning: true,
    });
}

export function stopHandler(pairFinder: PairFinder, req: Request, res: Response<StatusResponse>)
{
    pairFinder.shutdown();

    return res.json({
        isRunning: pairFinder.IsRunning,
    });
}