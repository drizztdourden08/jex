import { useEffect, useRef } from 'react'
import { useAgentFilter } from '@/store/agentFilter'
import { applyAgentAction, type FilterState } from '@/lib/query/applyAgentAction'

// When an AI tool drives the Library (apply_filter / set_sort / clear_filter).
const useAgentLibraryActions = (flt: FilterState) => {
  const agentAction = useAgentFilter((s) => s.action)
  const agentNonce = useAgentFilter((s) => s.nonce)
  const specRef = useRef(flt.spec)
  specRef.current = flt.spec
  useEffect(() => {
    if (!agentAction) return
    applyAgentAction(flt, agentAction, specRef.current)

  }, [agentNonce])
}

export { useAgentLibraryActions }
