import "dotenv/config"
import path from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"
import { app } from "./app.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 4000)
const isProduction = process.env.NODE_ENV === "production"

if (isProduction) {
  const clientDist = path.resolve(__dirname, "../../dist")
  app.use(express.static(clientDist))
  app.use((_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(clientDist, "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`AWAKEN server listening on http://localhost:${PORT}`)
})
