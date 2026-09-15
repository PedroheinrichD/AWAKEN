import { Coins } from "@phosphor-icons/react"
import { RarityBadge } from "@/components/rpg/RarityBadge"
import { SystemPanel } from "@/components/system/SystemPanel"
import { ICON_MAP } from "@/lib/icons"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

const EVENT_CURRENCY_NAME = "Fragmentos de Evento"

export function EventShopScreen() {
  const utils = trpc.useUtils()
  const { data: character } = trpc.character.getActive.useQuery()
  const { data: listings } = trpc.shop.listings.useQuery()
  const purchase = trpc.shop.purchase.useMutation({
    onSuccess: () => {
      utils.character.getActive.invalidate()
      utils.shop.listings.invalidate()
      utils.items.inventory.invalidate()
    },
  })

  const currency = character?.eventCurrency ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Event Shop</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Loja de Eventos</h1>
        </div>
        <div className="flex items-center gap-2 border border-gold/40 bg-surface-1 px-4 py-2">
          <Coins size={18} className="text-gold" />
          <span className="font-mono text-sm text-ink-primary">{currency.toLocaleString("pt-BR")}</span>
          <span className="text-xs text-ink-tertiary">{EVENT_CURRENCY_NAME}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {listings?.map((listing) => {
          const Icon = ICON_MAP[listing.icon]
          const affordable = currency >= listing.price
          const pending = purchase.isPending && purchase.variables?.listingId === listing.id

          return (
            <SystemPanel key={listing.id} className="flex flex-col gap-3 p-5">
              {listing.exclusive ? (
                <span className="font-display text-[9px] font-bold tracking-[0.2em] text-gold uppercase">
                  Event Exclusive
                </span>
              ) : null}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/40 bg-surface-2">
                  <Icon size={22} weight="regular" className="text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-ink-primary">{listing.name}</p>
                  <RarityBadge rarity={listing.rarity} />
                </div>
              </div>
              <p className="flex-1 text-xs leading-relaxed text-ink-secondary">{listing.description}</p>
              <button
                type="button"
                disabled={listing.owned || !affordable || pending}
                onClick={() => purchase.mutate({ listingId: listing.id })}
                className={cn(
                  "flex items-center justify-center gap-2 border py-2.5 font-display text-xs font-semibold tracking-[0.15em] uppercase transition-colors",
                  listing.owned
                    ? "border-system/40 text-system"
                    : affordable
                      ? "border-gold bg-gold/10 text-gold hover:bg-gold/20"
                      : "cursor-not-allowed border-surface-border text-ink-disabled",
                )}
              >
                {listing.owned ? (
                  "Adquirido"
                ) : (
                  <>
                    <Coins size={14} />
                    {listing.price.toLocaleString("pt-BR")}
                  </>
                )}
              </button>
            </SystemPanel>
          )
        })}
      </div>
    </div>
  )
}
