// Copies the MediaPipe Pose Landmarker WASM runtime out of node_modules and downloads
// the pose model file into public/vendor/mediapipe so the app can serve both from its
// own origin at runtime (no third-party CDN request during actual gameplay). Safe to
// run repeatedly: it skips work that's already done. Runs automatically via
// `postinstall`; can also be run manually with `npm run setup:pose`.
import { existsSync } from "node:fs"
import { cp, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const WASM_SRC = path.join(root, "node_modules/@mediapipe/tasks-vision/wasm")
const VENDOR_DIR = path.join(root, "public/vendor/mediapipe")
const WASM_DEST = path.join(VENDOR_DIR, "wasm")
const MODEL_DEST = path.join(VENDOR_DIR, "models/pose_landmarker_lite.task")

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"

async function copyWasm() {
  if (!existsSync(WASM_SRC)) {
    console.warn("[pose-assets] @mediapipe/tasks-vision não encontrado em node_modules — rode `npm install` primeiro.")
    return
  }
  await mkdir(WASM_DEST, { recursive: true })
  await cp(WASM_SRC, WASM_DEST, { recursive: true })
  console.log("[pose-assets] Runtime WASM do Pose Landmarker copiado para public/vendor/mediapipe/wasm")
}

async function downloadModel() {
  if (existsSync(MODEL_DEST)) {
    console.log("[pose-assets] Modelo Pose Landmarker já presente em public/vendor/mediapipe/models — nada a baixar.")
    return
  }
  await mkdir(path.dirname(MODEL_DEST), { recursive: true })
  console.log("[pose-assets] Baixando modelo Pose Landmarker (lite, ~5.7MB, uma única vez)...")
  const response = await fetch(MODEL_URL)
  if (!response.ok) {
    console.warn(
      `[pose-assets] Falha ao baixar o modelo (HTTP ${response.status}). O app usará o fallback remoto (jsDelivr/Google Storage) em runtime.`,
    )
    return
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(MODEL_DEST, buffer)
  console.log("[pose-assets] Modelo salvo em public/vendor/mediapipe/models/pose_landmarker_lite.task")
}

await copyWasm()
try {
  await downloadModel()
} catch (error) {
  console.warn("[pose-assets] Não foi possível baixar o modelo automaticamente (sem rede?):", error instanceof Error ? error.message : error)
  console.warn("[pose-assets] O app tentará carregar o modelo a partir do fallback remoto em runtime.")
}
