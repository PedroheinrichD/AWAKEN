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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { MotionConfig } from "motion/react"
import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import superjson from "superjson"
import { App } from "./App"
import { trpc } from "@/lib/trpc"

function Root() {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/trpc",
          transformer: superjson,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" })
          },
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <IconContext.Provider value={{ weight: "regular" }}>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </MotionConfig>
        </IconContext.Provider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
