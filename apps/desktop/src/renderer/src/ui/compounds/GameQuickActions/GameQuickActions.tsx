import { useMemo } from 'react'
import { Button } from '@ds/primitives/actions/Button'
import { FactStrip } from '@ds/composites/FactStrip'
import { gameFacts } from './GameQuickActions.helpers'
import type { GameQuickActionsProps } from './GameQuickActions.type'

/** Play (installed) or Install (owned), then the game's at-a-glance facts. */
const GameQuickActions = ({ game, onOpen, extra }: GameQuickActionsProps) => {
  const facts = useMemo(() => gameFacts(game), [game])
  const actions = (
    <>
      {game.installed ? (
        <Button onClick={() => onOpen(`steam://run/${game.appid}`)}>▶ Play</Button>
      ) : (
        game.owned && <Button onClick={() => onOpen(`steam://install/${game.appid}`)}>⬇ Install</Button>
      )}
      {extra}
    </>
  )
  return <FactStrip className="game-quick" actions={actions} facts={facts} />
}

export { GameQuickActions }
