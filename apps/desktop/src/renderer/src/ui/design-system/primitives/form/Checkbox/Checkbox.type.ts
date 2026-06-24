import type { ButtonHTMLAttributes } from 'react'

// shadcn/Radix-style: a real <button role="checkbox">, not a hidden native input — so
// nothing depends on input rendering quirks. State is explicit via `checked` +
// `onCheckedChange`.
type CheckboxProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type' | 'checked'> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export type { CheckboxProps }
