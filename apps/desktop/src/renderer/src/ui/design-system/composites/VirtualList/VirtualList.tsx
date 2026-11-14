import './VirtualList.css'
import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { useVirtualWindow } from './behavior/useVirtualWindow'
import { useListKeyboard } from './behavior/useListKeyboard'
import type { VirtualListProps } from './VirtualList.type'

/**
 * A single-select listbox that renders only the rows in view, so a list of
 * thousands scrolls as cheaply as a list of twenty. Rows have a fixed height.
 * Focus stays on the list itself; the selected row is announced through
 * aria-activedescendant and kept scrolled into view.
 */
const VirtualList = <T,>({
  items,
  rowHeight,
  getKey,
  renderRow,
  selectedIndex,
  onSelect,
  label,
  overscan = 6,
  className,
}: VirtualListProps<T>) => {
  const idBase = useId()
  const win = useVirtualWindow({ count: items.length, rowHeight, overscan })
  const { onKeyDown } = useListKeyboard({
    count: items.length,
    selectedIndex,
    pageSize: win.pageSize,
    onSelect,
  })

  useEffect(() => {
    win.scrollToIndex(selectedIndex)
  }, [selectedIndex, win.scrollToIndex])

  const rows: ReactNode[] = []
  for (let i = win.start; i < win.end; i++) {
    const item = items[i]
    const selected = i === selectedIndex
    rows.push(
      <Box
        key={getKey(item)}
        id={`${idBase}-${i}`}
        role="option"
        aria-selected={selected}
        className="ds-vlist-row"
        data-selected={selected || undefined}
        style={{ top: i * rowHeight, height: rowHeight }}
        onClick={() => onSelect(i)}
      >
        {renderRow(item, { index: i, selected })}
      </Box>,
    )
  }

  return (
    <Box
      ref={win.ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      aria-activedescendant={selectedIndex >= 0 ? `${idBase}-${selectedIndex}` : undefined}
      className={`ds-vlist${className ? ` ${className}` : ''}`}
      onScroll={win.onScroll}
      onKeyDown={onKeyDown}
    >
      <Box className="ds-vlist-track" style={{ height: win.totalHeight }}>
        {rows}
      </Box>
    </Box>
  )
}

export { VirtualList }
