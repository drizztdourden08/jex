import type { Game } from '@shared/library'
import type { FilterSpec } from '@shared/filter'
import { Box } from '@ds/primitives/layout/Box'
import { TextInput } from '@ds/primitives/form/TextInput'
import { Select } from '@ds/primitives/form/Select'
import { Tag } from '@ds/primitives/feedback/Tag'
import { FeatureIcon } from '@ui/compounds/FeatureIcon'
import { META_STEPS, REVIEW_STEPS } from '../../GameFilters.constants'
import type { ExplicitFacets, Facet, FilterToggle } from '../../GameFilters.type'
import { useNormalFilters } from './behavior/useNormalFilters'
import { FacetField } from './sub-components/FacetField'
import './NormalFilters.css'

/** Normal (curated) filters — a name search, then a uniform wrapping grid of labeled
 *  fields: Status (toggle tags), the score selects, and the Features/Genres/Categories/
 *  Tags facet pickers. Every field shares the same `facet-field` shape. */
const NormalFilters = ({
  games,
  value,
  onChange,
  omit = [],
  facets,
  hideScores,
}: {
  games: Game[]
  value: FilterSpec
  onChange: (s: FilterSpec) => void
  omit?: FilterToggle[]
  facets?: ExplicitFacets
  hideScores?: boolean
}) => {
  const { hide, visibleFlags, genres, categories, tags, features, set } = useNormalFilters({
    games,
    value,
    onChange,
    omit,
    facets,
    hideScores,
  })

  const featureOptions = features.map((f) => ({
    value: f.key,
    label: f.label,
    icon: <FeatureIcon name={f.icon} size={13} />,
  }))
  const toOptions = (vals: string[]) => vals.map((v) => ({ value: v, label: v }))
  const setFacet = (key: Facet) => (next: string[]) => set({ [key]: next.length ? next : undefined })

  return (
    <>
      <Box className="nf-controls">
        <TextInput
          className="filter-text nf-name"
          placeholder="Filter by name…"
          value={value.text ?? ''}
          onChange={(e) => set({ text: e.currentTarget.value || undefined })}
        />
      </Box>

      <Box className="nf-facets">
        {visibleFlags.length > 0 && (
          <Box className="facet-field">
            <Box className="facet-field-head">
              <Box as="span" className="facet-field-label">Status</Box>
            </Box>
            <Box className="facet-field-body">
              {!hide.has('installed') && (
                <Tag label="Installed" selected={!!value.installedOnly} onSelect={() => set({ installedOnly: !value.installedOnly || undefined })} />
              )}
              {!hide.has('unplayed') && (
                <Tag label="Unplayed" selected={!!value.unplayedOnly} onSelect={() => set({ unplayedOnly: !value.unplayedOnly || undefined })} />
              )}
              {!hide.has('free') && (
                <Tag label="Free" selected={!!value.freeOnly} onSelect={() => set({ freeOnly: !value.freeOnly || undefined })} />
              )}
            </Box>
          </Box>
        )}

        {!hideScores && (
          <>
            <Box className="facet-field">
              <Box className="facet-field-head">
                <Box as="span" className="facet-field-label">Min Metacritic</Box>
              </Box>
              <Box className="facet-field-body">
                <Select
                  variant="field"
                  value={String(value.metacriticMin ?? 0)}
                  onChange={(v) => set({ metacriticMin: Number(v) || undefined })}
                  options={META_STEPS.map((n) => ({ value: String(n), label: n === 0 ? 'Any' : `${n}/100` }))}
                />
              </Box>
            </Box>
            <Box className="facet-field">
              <Box className="facet-field-head">
                <Box as="span" className="facet-field-label">Min review %</Box>
              </Box>
              <Box className="facet-field-body">
                <Select
                  variant="field"
                  value={String(value.reviewPercentMin ?? 0)}
                  onChange={(v) => set({ reviewPercentMin: Number(v) || undefined })}
                  options={REVIEW_STEPS.map((n) => ({ value: String(n), label: n === 0 ? 'Any' : `${n}%+` }))}
                />
              </Box>
            </Box>
          </>
        )}

        {features.length > 0 && (
          <FacetField
            label="Features"
            options={featureOptions}
            selected={value.features ?? []}
            onChange={(next) => set({ features: next.length ? next : undefined })}
          />
        )}
        {genres.length > 0 && (
          <FacetField label="Genres" options={toOptions(genres)} selected={value.genres ?? []} onChange={setFacet('genres')} />
        )}
        {categories.length > 0 && (
          <FacetField label="Categories" options={toOptions(categories)} selected={value.categories ?? []} onChange={setFacet('categories')} />
        )}
        {tags.length > 0 && (
          <FacetField label="Tags" options={toOptions(tags)} selected={value.tags ?? []} onChange={setFacet('tags')} />
        )}
      </Box>
    </>
  )
}

export { NormalFilters }
