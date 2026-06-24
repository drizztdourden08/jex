import type { TagProps } from './Tag.type'
import './Tag.css'

/**
 * The one tag-like chip used everywhere (filter pickers, selected values, detail-page
 * genres/tags/features). Identical styling in every mode; an optional leading icon
 * always reads in the secondary (purple) accent.
 *  - `onSelect` → a clickable picker chip (whole chip is the button).
 *  - `onRemove` → a selected chip with a trailing × (same look, plus the remove button).
 *  - neither → a static display chip.
 */
const Tag = ({ label, icon, onSelect, onRemove, selected, className }: TagProps) => {
  const cls = ['ds-tag', selected && 'is-selected', className].filter(Boolean).join(' ')
  const body = (
    <>
      {icon != null && <span className="ds-tag-icon">{icon}</span>}
      <span className="ds-tag-label">{label}</span>
    </>
  )
  if (onSelect) {
    return (
      <button type="button" className={cls} onClick={onSelect}>
        {body}
      </button>
    )
  }
  return (
    <span className={cls}>
      {body}
      {onRemove && (
        <button
          type="button"
          className="ds-tag-x"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}

export { Tag }
