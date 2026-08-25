/**
 * AustinGolf atmospheric contour field (Gen2 §12).
 *
 * The landing hero needs identity and a sense of place, but the prototype ships
 * no approved photography and both source documents forbid presenting generic
 * stock golf imagery as if it depicted a named Austin course.
 *
 * So the hero gets an elevated *branded* treatment instead: a topographic
 * contour field in the AustinGolf palette. It reads as Hill Country terrain
 * language without claiming to be any particular course, which is exactly the
 * licence §12 grants the landing hero and withholds from named-course heroes.
 *
 * Purely decorative, and marked as such for assistive technology.
 */

const WIDTH = 1200
const HEIGHT = 420

/** Deterministic ridge line built from a sum of sines. No randomness at render. */
function ridge(index: number, amplitude: number, offset: number) {
  const pts: string[] = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = t * WIDTH
    const y =
      offset +
      Math.sin(t * Math.PI * (1.15 + index * 0.16) + index * 0.9) * amplitude +
      Math.sin(t * Math.PI * (3.1 + index * 0.1) + index * 1.7) * (amplitude * 0.32)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join(" L")}`
}

export function ContourField({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <g fill="none" strokeLinecap="round">
        {Array.from({ length: 11 }).map((_, i) => (
          <path
            key={i}
            d={ridge(i, 16 + i * 2.4, 62 + i * 33)}
            stroke={i % 3 === 1 ? "var(--green)" : "var(--sand)"}
            strokeOpacity={i % 3 === 1 ? 0.34 : 0.16}
            strokeWidth={i % 4 === 0 ? 1.5 : 1}
          />
        ))}
      </g>
    </svg>
  )
}
