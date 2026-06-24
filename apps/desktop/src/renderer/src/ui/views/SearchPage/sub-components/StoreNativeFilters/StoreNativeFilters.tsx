import type { FilterSpec } from '@shared/filter'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { Select } from '@ds/primitives/form/Select'
import { PRICE_TIERS } from '../../SearchPage.constants'

type StoreNativeFiltersProps = {
  spec: FilterSpec
  setSpec: (spec: FilterSpec) => void
}

const StoreNativeFilters = ({ spec, setSpec }: StoreNativeFiltersProps) => (
  <Box className="row" style={{ gap: 12, margin: '10px 2px' }}>
    <Select
      title="Max price"
      value={String(spec.maxPrice ?? '')}
      onChange={(v) => setSpec({ ...spec, maxPrice: v === '' ? undefined : Number(v) })}
      options={PRICE_TIERS.map((t) => ({ value: String(t.value ?? ''), label: t.label }))}
      variant="field"
    />
    <Button
      variant="ghost"
      className="pill chip-btn"
      data-on={spec.onSaleOnly || undefined}
      onClick={() => setSpec({ ...spec, onSaleOnly: !spec.onSaleOnly || undefined })}
    >
      On sale
    </Button>
    <Button
      variant="ghost"
      className="pill chip-btn"
      data-on={spec.hideFreeToPlay || undefined}
      onClick={() => setSpec({ ...spec, hideFreeToPlay: !spec.hideFreeToPlay || undefined })}
    >
      Hide free-to-play
    </Button>
  </Box>
)

export { StoreNativeFilters }
export type { StoreNativeFiltersProps }
