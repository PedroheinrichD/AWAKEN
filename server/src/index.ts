import "dotenv/config"
import path from "node:path"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { createContext } from "./context"
import { appRouter } from "./trpc/root"

const app = express()
const PORT = Number(process.env.PORT ?? 4000)
const isProduction = process.env.NODE_ENV === "production"

app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())

app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }))

if (isProduction) {
  const clientDist = path.resolve(__dirname, "../../dist")
  app.use(express.static(clientDist))
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`AWAKEN server listening on http://localhost:${PORT}`)
})
