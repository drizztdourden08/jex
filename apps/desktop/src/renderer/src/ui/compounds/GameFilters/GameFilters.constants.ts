import type { FilterMode } from '@/hooks/useFilterState'

const META_STEPS = [0, 50, 60, 70, 80, 90]
const REVIEW_STEPS = [0, 50, 70, 80, 90, 95]
const ALL_MODES: FilterMode[] = ['basic', 'normal', 'advanced']
const MAX_SUMMARY_TAGS = 4

export { META_STEPS, REVIEW_STEPS, ALL_MODES, MAX_SUMMARY_TAGS }
