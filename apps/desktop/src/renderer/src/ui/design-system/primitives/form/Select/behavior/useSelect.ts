import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { SelectOption } from '../Select.type'

/** Open/search/highlight state + keyboard nav for the Select primitive. Positioning,
 *  single-open coordination, z-index, outside-click, and Escape are all the Popover's job. */
const useSelect = <T extends string>(
  allOptions: SelectOption<T>[],
  onChange: (value: T) => void,
  searchable: boolean,
) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!searchable || !search) return allOptions
    const q = search.toLowerCase()
    return allOptions.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.description ?? '').toLowerCase().includes(q),
    )
  }, [searchable, search, allOptions])

  const close = () => {
    setOpen(false)
    setSearch('')
    setHighlight(-1)
  }

  const toggle = () => {
    if (open) close()
    else {
      setOpen(true)
      setSearch('')
      setHighlight(-1)
    }
  }

  const choose = (value: T) => {
    onChange(value)
    close()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && highlight < filtered.length) choose(filtered[highlight].value)
    }
  }

  return { open, search, setSearch, highlight, setHighlight, filtered, triggerRef, searchRef, close, toggle, choose, onKeyDown }
}

export { useSelect }
