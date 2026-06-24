import type { ToolSupport } from '@jex/shared/ai'

/**
 * Catalog of selectable local models — Qwen reasoning models only.
 *
 * The agent needs reliable tool/function calling plus step-by-step reasoning, so
 * the catalog is the Qwen3.5 family (Small 0.8B–9B + Medium 27B/35B-A3B) and the
 * two Qwen3.6 open-weight variants (27B dense + 35B-A3B MoE, tuned for agentic
 * coding). node-llama-cpp/llama.cpp have native, grammar-constrained function
 * calling for the Qwen family, so tool calls stay well-formed.
 *
 * The catalog is capped at what a high-end gaming PC (64 GB RAM, RTX 5090 / 32 GB
 * VRAM) can run — the 122B-A10B and 397B-A17B Qwen3.5 mediums are intentionally
 * omitted. MoE rows ("A3B" = ~3B active params) generate much faster than their
 * total size suggests.
 *
 * Sizes are approximate Q4_K_M download sizes; ramGb is a rough "comfortable"
 * footprint (weights + KV cache). Everything downloads on demand to AppData (see
 * model.ts) — no model ships in the package. GGUF repos are Unsloth's dynamic
 * quants; if a repo lacks a plain `Q4_K_M`, swap the tag to its `UD-Q4_K_M`.
 */
type ModelArch = 'dense' | 'moe'
type ModelFamily = 'Qwen3.5' | 'Qwen3.6'

interface ModelDef {
  id: string
  label: string
  family: ModelFamily
  arch: ModelArch
  /** Human param descriptor, e.g. "9B" or "35B · 3B active". */
  params: string
  /** hf: URI consumed by node-llama-cpp's createModelDownloader. */
  uri: string
  sizeGb: number
  ramGb: number
  /** Context window we open for this model (tokens). */
  contextSize: number
  toolSupport: ToolSupport
  recommended?: boolean
  note?: string
}

const CONTEXT = 32768

const MODELS: ModelDef[] = [
  // ── Qwen3.5 Small (dense) ──────────────────────────────────────────────────
  {
    id: 'qwen3.5-0.8b',
    label: 'Qwen3.5 0.8B',
    family: 'Qwen3.5',
    arch: 'dense',
    params: '0.8B',
    uri: 'hf:unsloth/Qwen3.5-0.8B-GGUF:Q4_K_M',
    sizeGb: 0.7,
    ramGb: 2,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'Tiny — runs on almost anything; weakest at long multi-tool chains.',
  },
  {
    id: 'qwen3.5-2b',
    label: 'Qwen3.5 2B',
    family: 'Qwen3.5',
    arch: 'dense',
    params: '2B',
    uri: 'hf:unsloth/Qwen3.5-2B-GGUF:Q4_K_M',
    sizeGb: 1.6,
    ramGb: 4,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'Lightweight — fast on modest machines.',
  },
  {
    id: 'qwen3.5-4b',
    label: 'Qwen3.5 4B',
    family: 'Qwen3.5',
    arch: 'dense',
    params: '4B',
    uri: 'hf:unsloth/Qwen3.5-4B-GGUF:Q4_K_M',
    sizeGb: 2.6,
    ramGb: 6,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'Good small-machine balance of speed and reasoning.',
  },
  {
    id: 'qwen3.5-9b',
    label: 'Qwen3.5 9B',
    family: 'Qwen3.5',
    arch: 'dense',
    params: '9B',
    uri: 'hf:unsloth/Qwen3.5-9B-GGUF:Q4_K_M',
    sizeGb: 5.6,
    ramGb: 11,
    contextSize: CONTEXT,
    toolSupport: 'native',
    recommended: true,
    note: 'Best all-round balance — strong, reliable tool use. Needs ~11 GB.',
  },
  // ── Qwen3.5 Medium ───────────────────────────────────────────────────────────
  {
    id: 'qwen3.5-27b',
    label: 'Qwen3.5 27B',
    family: 'Qwen3.5',
    arch: 'dense',
    params: '27B',
    uri: 'hf:unsloth/Qwen3.5-27B-GGUF:Q4_K_M',
    sizeGb: 16.5,
    ramGb: 24,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'Very capable dense model — fits a 24 GB+ GPU. Slower than the MoE.',
  },
  {
    id: 'qwen3.5-35b-a3b',
    label: 'Qwen3.5 35B-A3B',
    family: 'Qwen3.5',
    arch: 'moe',
    params: '35B · 3B active',
    uri: 'hf:unsloth/Qwen3.5-35B-A3B-GGUF:Q4_K_M',
    sizeGb: 20,
    ramGb: 28,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'MoE — only ~3B active per token, so it runs fast for its smarts.',
  },
  // ── Qwen3.6 (latest open-weight, agentic-tuned) ──────────────────────────────
  {
    id: 'qwen3.6-27b',
    label: 'Qwen3.6 27B',
    family: 'Qwen3.6',
    arch: 'dense',
    params: '27B',
    uri: 'hf:unsloth/Qwen3.6-27B-GGUF:Q4_K_M',
    sizeGb: 16.5,
    ramGb: 24,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'Latest generation, tuned for agentic tool use. Fits a 24 GB+ GPU.',
  },
  {
    id: 'qwen3.6-35b-a3b',
    label: 'Qwen3.6 35B-A3B',
    family: 'Qwen3.6',
    arch: 'moe',
    params: '35B · 3B active',
    uri: 'hf:unsloth/Qwen3.6-35B-A3B-GGUF:Q4_K_M',
    sizeGb: 20,
    ramGb: 28,
    contextSize: CONTEXT,
    toolSupport: 'native',
    note: 'Most capable here — latest agentic MoE, ~3B active so still fast.',
  },
]

const DEFAULT_MODEL_ID = MODELS.find((m) => m.recommended)?.id ?? MODELS[0].id

const findModel = (id: string | null | undefined): ModelDef | undefined =>
  id ? MODELS.find((m) => m.id === id) : undefined

export { DEFAULT_MODEL_ID, findModel, MODELS }
export type { ModelArch, ModelFamily, ModelDef }
