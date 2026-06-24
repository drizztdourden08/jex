import { Box } from '@ds/primitives/layout/Box'
import { Portal } from '@ds/primitives/util/Portal'
import { useExpand } from '@ds/primitives/overlay/useExpand'
import { useSelect } from './behavior/useSelect'
import { SelectItem } from './sub-components/SelectItem'
import { SelectMenu } from './sub-components/SelectMenu'
import type { SelectProps, SelectOption } from './Select.type'
import './Select.css'

const HIDDEN = { visibility: 'hidden' as const }

/**
 * The single dropdown primitive. Reads as ONE element that expands from the trigger:
 * closed, the in-flow trigger shows its idle state; open, the trigger stays as a same-
 * size spacer and the full surface is PORTALLED over it, then grows its own height
 * (grid-template-rows 0fr→1fr, like the assistant morph) to reveal the options. The
 * portal re-anchors to the trigger on scroll/resize and dies if it leaves the viewport.
 */
const Select = <T extends string>({
  value,
  onChange,
  options,
  groups,
  placeholder = 'Select…',
  disabled = false,
  searchable = false,
  size = 'md',
  title,
  className,
  triggerClass,
  block = false,
  triggerBare = false,
  renderOption,
  renderTrigger,
}: SelectProps<T>) => {
  const all: SelectOption<T>[] = groups ? groups.flatMap((g) => g.options) : options ?? []
  const selected = all.find((o) => o.value === value)
  const d = useSelect(all, onChange, searchable)
  const x = useExpand(d.open, d.close)

  const head = (
    <>
      <Box as="span" className="ds-select-trigger-content">
        {renderTrigger ? (
          renderTrigger(selected)
        ) : (
          <>
            {selected?.icon != null && <Box as="span" className="ds-select-trigger-icon">{selected.icon}</Box>}
            <Box as="span" className={`ds-select-trigger-label${selected ? '' : ' is-placeholder'}`}>
              {selected?.label ?? placeholder}
            </Box>
          </>
        )}
      </Box>
      <Box as="span" className="ds-select-chevron" aria-hidden>▾</Box>
    </>
  )

  return (
    <Box className={['ds-select', block && 'ds-select--block', className].filter(Boolean).join(' ')}>
      <button
        ref={x.triggerRef}
        type="button"
        className={['ds-select-trigger', `ds-select-trigger--${size}`, !triggerBare && 'ds-select-box', triggerClass]
          .filter(Boolean)
          .join(' ')}
        style={x.mounted ? HIDDEN : undefined}
        disabled={disabled}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={d.open}
        onClick={d.toggle}
        onKeyDown={d.onKeyDown}
      >
        {head}
      </button>

      {x.mounted && (
        <Portal>
          <Box
            ref={x.surfaceRef}
            className={['ds-select-surface', x.expanded && 'is-open', x.grown && 'is-grown'].filter(Boolean).join(' ')}
            style={x.style ?? undefined}
          >
            <button type="button" className={`ds-select-trigger ds-select-trigger--${size}`} onClick={d.toggle}>
              {head}
            </button>

            <Box className="ds-select-grow">
              <Box className="ds-select-scroll" role="listbox">
                {searchable && (
                  <Box className="ds-select-search">
                    <input
                      ref={d.searchRef}
                      className="ds-select-search-input"
                      type="text"
                      placeholder="Search…"
                      value={d.search}
                      onChange={(e) => {
                        d.setSearch(e.target.value)
                        d.setHighlight(0)
                      }}
                      onKeyDown={d.onKeyDown}
                    />
                  </Box>
                )}

                {d.search ? (
                  d.filtered.length === 0 ? (
                    <Box className="ds-select-empty">No matches</Box>
                  ) : (
                    d.filtered.map((opt, i) => (
                      <SelectItem key={opt.value} option={opt} index={i} selected={opt.value === value}
                        highlighted={i === d.highlight} onSelect={d.choose} renderOption={renderOption} />
                    ))
                  )
                ) : groups ? (
                  groups.map((g, gi) => (
                    <Box key={g.label}>
                      {gi > 0 && <Box className="ds-select-separator" />}
                      <Box className="ds-select-group-label">{g.label}</Box>
                      {g.options.map((opt) => {
                        const idx = all.indexOf(opt)
                        return (
                          <SelectItem key={opt.value} option={opt} index={idx} selected={opt.value === value}
                            highlighted={idx === d.highlight} onSelect={d.choose} renderOption={renderOption} />
                        )
                      })}
                    </Box>
                  ))
                ) : (
                  all.map((opt, i) => (
                    <SelectItem key={opt.value} option={opt} index={i} selected={opt.value === value}
                      highlighted={i === d.highlight} onSelect={d.choose} renderOption={renderOption} />
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  )
}

export { Select, SelectMenu }
export type { SelectOption, SelectProps } from './Select.type'
export type { SelectGroup, SelectVariant, SelectMenuProps } from './Select.type'
