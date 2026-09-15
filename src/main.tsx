import "@fontsource/rajdhani/500.css"
import "@fontsource/rajdhani/600.css"
import "@fontsource/rajdhani/700.css"
import "@fontsource/sora/400.css"
import "@fontsource/sora/500.css"
import "@fontsource/sora/600.css"
import "@fontsource/space-mono/400.css"
import "@fontsource/space-mono/700.css"
import "@/styles/tokens.css"

import { IconContext } from "@phosphor-icons/react"
import { MotionConfig } from "motion/react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconContext.Provider value={{ weight: "regular" }}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MotionConfig>
    </IconContext.Provider>
  </StrictMode>,
)
