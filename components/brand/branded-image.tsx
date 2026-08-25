/**
 * Branded image fallback.
 *
 * The prototype dataset ships no photography (QA_Notes: "PENDING VISUAL PACKAGE —
 * no image URLs fabricated here"), and both source documents forbid using generic
 * stock golf photography as if it depicted a named Austin course. So every image
 * surface renders this elegant branded treatment instead: a deterministic
 * contour field in the AustinGolf palette plus the wordmark.
 *
 * It is deliberately abstract. It does not imply terrain, condition or character
 * for any specific course, and its alt text never claims to depict one.
 */

import { cn } from "@/lib/utils"

/** FNV-1a — stable across server and client so there is no hydration mismatch. */
function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const TONES = [
  { field: "var(--cream)", line: "var(--sand)", accent: "var(--green)" },
  { field: "var(--green-wash)", line: "var(--green)", accent: "var(--green-deep)" },
  { field: "var(--sand-soft)", line: "var(--sand)", accent: "var(--green-deep)" },
]

/** Builds a smooth contour polyline from a seeded sum of sines. */
function contourPath(seed: number, index: number, width: number, height: number) {
  const base = height * (0.18 + index * 0.135)
  const a1 = 6 + ((seed >> (index * 3)) % 11)
  const a2 = 3 + ((seed >> (index * 2 + 5)) % 7)
  const p1 = ((seed >> index) % 100) / 100
  const p2 = ((seed >> (index + 7)) % 100) / 100
  const f1 = 1.1 + (((seed >> (index + 3)) % 5) * 0.22)

  const pts: string[] = []
  const steps = 28
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = t * width
    const y =
      base +
      Math.sin(t * Math.PI * f1 + p1 * Math.PI * 2) * a1 +
      Math.sin(t * Math.PI * 3.4 + p2 * Math.PI * 2) * a2
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join(" L")}`
}

type Props = {
  /** Stable key (entity id) so a given course always renders the same treatment. */
  seedKey: string
  /** Accessible description. Should describe the graphic, never a fictional photo. */
  alt: string
  className?: string
  variant?: "card" | "hero"
  /** Shows a quiet note that real photography is still pending. */
  showPendingNote?: boolean
}

export function BrandedImage({
  seedKey,
  alt,
  className,
  variant = "card",
  showPendingNote = false,
}: Props) {
  const seed = hashSeed(seedKey)
  const tone = TONES[seed % TONES.length]
  const width = 400
  const height = variant === "hero" ? 150 : 300
  const lineCount = variant === "hero" ? 5 : 6

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{ backgroundColor: tone.field }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={alt}
      >
        <g fill="none" strokeLinecap="round">
          {Array.from({ length: lineCount }).map((_, i) => (
            <path
              key={i}
              d={contourPath(seed, i, width, height)}
              stroke={i % 3 === 1 ? tone.accent : tone.line}
              strokeOpacity={i % 3 === 1 ? 0.34 : 0.5}
              strokeWidth={i % 3 === 1 ? 1.4 : 0.9}
            />
          ))}
        </g>
      </svg>

      {/* Wordmark: the fallback reads as AustinGolf, not as a missing asset. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          aria-hidden="true"
          className={cn(
            "ag-label select-none text-ink/45",
            variant === "hero" ? "text-xs tracking-[0.34em]" : "tracking-[0.28em]",
          )}
        >
          AUSTINGOLF
        </span>
      </div>

      {showPendingNote ? (
        <p className="absolute bottom-0 left-0 right-0 bg-background/80 px-3 py-1.5 text-[0.6875rem] leading-tight text-ink-soft">
          Course photography pending. This is an AustinGolf placeholder, not an
          image of the course.
        </p>
      ) : null}
    </div>
  )
}
