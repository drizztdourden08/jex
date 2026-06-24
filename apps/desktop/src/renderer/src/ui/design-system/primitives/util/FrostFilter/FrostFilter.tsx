import { useEffect, useRef } from 'react'

/**
 * Defines the #frost-blur SVG filter referenced by glass surfaces via
 * `backdrop-filter: url("#frost-blur")`. Rendered once near the app root.
 *
 * Plain `blur()` (and a naive SVG blur) barely works in a transparent Electron window:
 * the backdrop's RGB is premultiplied against near-zero alpha, so there's nothing solid to
 * blur (the "glow"). Workaround from electron/electron#39529: un-premultiply alpha (force
 * RGB opaque), blur THAT, blur the alpha channel separately, then re-composite — so the
 * blur acts on real color and the soft edge comes from the blurred alpha mask.
 *
 * Blur radius is the two feGaussianBlur stdDeviations, driven from :root --frost-blur. SVG
 * filter primitives take XML attributes (var() can't reach them), so tweak live by editing
 * --frost-blur on :root and calling window.applyFrost(). --frost-sat (CSS saturate at the
 * use site) applies on its own.
 */
const readVar = (name: string, fallback: number): number => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

const FrostFilter = () => {
  const blurRgb = useRef<SVGFEGaussianBlurElement>(null)
  const blurAlpha = useRef<SVGFEGaussianBlurElement>(null)
  const alphaDilate = useRef<SVGFEMorphologyElement>(null)
  const boost = useRef<SVGFEFuncAElement>(null)

  useEffect(() => {
    const apply = () => {
      const dev = String(readVar('--frost-blur', 10))
      blurRgb.current?.setAttribute('stdDeviation', dev)
      blurAlpha.current?.setAttribute('stdDeviation', dev)
      alphaDilate.current?.setAttribute('radius', String(readVar('--frost-dilate', 12)))
      boost.current?.setAttribute('slope', String(readVar('--frost-boost', 1.25)))
      // Chromium caches the url(#frost-blur) filter, so editing its inner attributes doesn't
      // make consumers re-sample. Nudge --frost-sat (it's part of the backdrop-filter value)
      // to force every glass surface to re-evaluate the whole chain with the new attrs.
      const root = document.documentElement
      const sat = readVar('--frost-sat', 1.5)
      root.style.setProperty('--frost-sat', String(sat + 0.0001))
      requestAnimationFrame(() => root.style.setProperty('--frost-sat', String(sat)))
    }
    apply()
    ;(window as unknown as { applyFrost?: () => void }).applyFrost = apply
  }, [])

  return (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="frost-blur" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
        {/* 1: force RGB fully opaque (un-premultiply) so the blur has solid color to work on */}
        <feComponentTransfer in="SourceGraphic" result="unpremul">
          <feFuncA type="linear" slope="0" intercept="1" />
        </feComponentTransfer>
        {/* 2: thicken thin text strokes before blurring */}
        <feMorphology in="unpremul" operator="dilate" radius="0.7" result="thickened" />
        {/* 3: blur the opaque RGB copy */}
        <feGaussianBlur ref={blurRgb} in="thickened" stdDeviation="10" edgeMode="duplicate" result="blurred" />
        {/* 4: pull out the ORIGINAL alpha channel */}
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="alpha-only"
        />
        {/* 5: dilate the alpha to match the thickened RGB (lower radius = sharper outlines) */}
        <feMorphology ref={alphaDilate} in="alpha-only" operator="dilate" radius="12" result="alpha-dilated" />
        {/* 6: blur the alpha mask */}
        <feGaussianBlur ref={blurAlpha} in="alpha-dilated" stdDeviation="10" edgeMode="duplicate" result="alpha-blurred" />
        {/* 7: clip the blurred RGB to the soft alpha boundary */}
        <feComposite in="blurred" in2="alpha-blurred" operator="in" result="blurred-clipped" />
        {/* 8: opacity slope — lower keeps the blurred backdrop shapes visible (less milky) */}
        <feComponentTransfer in="blurred-clipped">
          <feFuncA ref={boost} type="linear" slope="1.25" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}

export { FrostFilter }
