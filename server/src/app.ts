import { createExpressMiddleware } from "@trpc/server/adapters/express"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { createContext } from "./context.js"
import { appRouter } from "./trpc/root.js"

export const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }))
