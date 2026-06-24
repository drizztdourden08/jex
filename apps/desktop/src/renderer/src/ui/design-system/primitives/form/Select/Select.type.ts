import type { ReactNode } from 'react'
import type { Align, Placement } from '@ds/primitives/overlay/Popover'

interface SelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
  /** Optional leading glyph/icon shown in the trigger and the menu item. */
  icon?: ReactNode
  /** Optional class applied to the trigger when this option is selected (e.g. a tag color). */
  triggerClass?: string
}

interface SelectGroup<T extends string = string> {
  label: string
  options: SelectOption<T>[]
}

type SelectVariant = 'field' | 'ghost'

interface SelectProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options?: SelectOption<T>[]
  groups?: SelectGroup<T>[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  variant?: SelectVariant
  size?: 'sm' | 'md'
  align?: Align
  placement?: Placement
  title?: string
  className?: string
  menuClassName?: string
  triggerClass?: string
  /** Stretch the control to fill its container (full-width trigger). */
  block?: boolean
  /** Strip the idle trigger's glass box (for embedding in another field, e.g. the unit
   *  picker inside a value combo). The portalled open surface stays the standard glass. */
  triggerBare?: boolean
  /** Custom render for a menu item (e.g. the grouped field glyphs, the model grid). */
  renderOption?: (option: SelectOption<T>, selected: boolean) => ReactNode
  /** Custom trigger content (overrides the default selected-label rendering). */
  renderTrigger?: (selected: SelectOption<T> | undefined) => ReactNode
}

interface SelectMenuProps {
  /** Trigger content. */
  trigger: ReactNode
  /** Menu body; receives a `close` callback to dismiss after an action. */
  children: (close: () => void) => ReactNode
  disabled?: boolean
  title?: string
  variant?: SelectVariant
  align?: Align
  placement?: Placement
  className?: string
  menuClassName?: string
  /** Additive class on the standard trigger box (layout/size tweaks only — it never
   *  replaces the glass box or the chevron, which the base always owns). */
  triggerClass?: string
  /** Stretch the control to fill its container (full-width trigger). */
  block?: boolean
  /** Strip the idle trigger's glass box (for embedding in another field). The portalled
   *  open surface stays the standard glass. */
  triggerBare?: boolean
  /** Hide the ▾ caret — reserved for compact icon launchers (e.g. the card "+"). */
  hideChevron?: boolean
}

interface SelectItemProps<T extends string = string> {
  option: SelectOption<T>
  selected: boolean
  highlighted: boolean
  index: number
  onSelect: (value: T) => void
  renderOption?: (option: SelectOption<T>, selected: boolean) => ReactNode
}

export type { SelectOption, SelectGroup, SelectVariant, SelectProps, SelectMenuProps, SelectItemProps }
