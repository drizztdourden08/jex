interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  value: string
  onChange: (id: string) => void
  'aria-label'?: string
}

export type { TabItem, TabsProps }
