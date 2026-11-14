import './LibraryGameList.css'
import { useCallback, useMemo } from 'react'
import type { Game } from '@shared/library'
import { VirtualList } from '@ds/composites/VirtualList'
import { LibraryGameRow } from './sub-components/LibraryGameRow'
import { ROW_HEIGHT } from './LibraryGameList.constants'
import type { LibraryGameListProps } from './LibraryGameList.type'

const keyOf = (g: Game) => g.appid
const renderRow = (g: Game) => <LibraryGameRow game={g} />

/** The Library's compact, windowed game list: art thumbnail, name, installed marker. */
const LibraryGameList = ({ games, selectedAppid, onSelect, className }: LibraryGameListProps) => {
  const selectedIndex = useMemo(
    () => (selectedAppid == null ? -1 : games.findIndex((g) => g.appid === selectedAppid)),
    [games, selectedAppid],
  )
  const handleSelect = useCallback((i: number) => {
    const g = games[i]
    if (g) onSelect(g.appid)
  }, [games, onSelect])

  return (
    <VirtualList
      className={className ? `lib-list ${className}` : 'lib-list'}
      items={games}
      rowHeight={ROW_HEIGHT}
      getKey={keyOf}
      renderRow={renderRow}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
      label="Games"
    />
  )
}

export { LibraryGameList }
