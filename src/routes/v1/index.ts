import express from "express";
import { PairFinder } from "../../core/PairFinder.js";
import { startHandler, statusHandler, stopHandler } from "./controllers.js";

export function v1Router(pairFinder: PairFinder)
{
    const router = express.Router();

    router.get("/status", statusHandler.bind(undefined, pairFinder));
    router.post("/start", startHandler.bind(undefined, pairFinder));
    router.post("/stop", stopHandler.bind(undefined, pairFinder));

    return router;
}