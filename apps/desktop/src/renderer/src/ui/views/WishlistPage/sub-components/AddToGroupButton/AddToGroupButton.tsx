import type { MouseEvent } from 'react'
import type { WishlistGroup } from '@shared/wishlist'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { SelectMenu } from '@ds/primitives/form/Select'

type Props = {
  appid: number
  groups: WishlistGroup[]
  open: boolean
  onToggleOpen: () => void
  onToggle: (id: number, appid: number) => void | Promise<void>
}

/** Top-left card overlay: a portalled dropdown (SelectMenu) to pin/unpin the game
 *  across sub-wishlists. Built on the Select primitive so the menu portals out of
 *  the card and is never clipped. */
const AddToGroupButton = ({ appid, groups, onToggle }: Props) => {
  const stop = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  return (
    <Box className="wl-add" onClick={stop}>
      <SelectMenu
        title="Add to a sub-wishlist"
        triggerClass="wl-add-btn"
        menuClassName="wl-add-menu"
        hideChevron
        trigger="+"
      >
        {() =>
          groups.length === 0 ? (
            <Box as="span" className="muted wl-add-empty">No sub-wishlists yet</Box>
          ) : (
            <>
              {groups.map((g) => {
                const on = g.manualAppids.includes(appid)
                return (
                  <Button
                    variant="ghost"
                    key={g.id}
                    data-on={on || undefined}
                    onClick={(e) => {
                      stop(e)
                      void onToggle(g.id, appid)
                    }}
                  >
                    <Box as="span" className="wl-add-check">{on ? '✓' : ''}</Box>
                    {g.name}
                  </Button>
                )
              })}
            </>
          )
        }
      </SelectMenu>
    </Box>
  )
}

export { AddToGroupButton }
export type { Props as AddToGroupButtonProps }
