import { Box } from '@ds/primitives/layout/Box'
import type { SelectItemProps } from '../../Select.type'

/** One option row in the Select menu. Selected state reads in the secondary
 *  (purple) accent; a custom `renderOption` can replace the default layout. */
const SelectItem = <T extends string>({
  option,
  selected,
  highlighted,
  index,
  onSelect,
  renderOption,
}: SelectItemProps<T>) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    data-index={index}
    className={['ds-select-item', selected && 'is-selected', highlighted && 'is-highlight']
      .filter(Boolean)
      .join(' ')}
    onClick={() => onSelect(option.value)}
  >
    {renderOption ? (
      renderOption(option, selected)
    ) : (
      <>
        {option.icon != null && <Box as="span" className="ds-select-item-icon">{option.icon}</Box>}
        <Box as="span" className="ds-select-item-label">{option.label}</Box>
        {selected && <Box as="span" className="ds-select-item-check">✓</Box>}
      </>
    )}
  </button>
)

export { SelectItem }
