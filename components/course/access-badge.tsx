/**
 * Access badge (module 1).
 *
 * Access has to be legible at a glance and must never be buried, so restricted
 * access gets a visible marker rather than sitting as one clause in a run of
 * metadata. The label is always the verified `accessType` from the projection —
 * this component chooses emphasis, never wording.
 *
 * Emphasis rises as access narrows (`Page_Module_Model_v1`: "More prominent as
 * access becomes restricted"). Public play needs no warning treatment, so it
 * stays quiet; private and semi-private do not.
 */

import type { AccessProfile } from "@/lib/domain"
import { cn } from "@/lib/utils"

/**
 * Colour carries no independent meaning here — the text is the message — so this
 * remains readable to anyone who cannot distinguish the tones.
 */
const TONE: Record<AccessProfile, string> = {
  public: "border-green/30 bg-green-wash text-green-deep",
  resort: "border-sand bg-sand-soft text-ink",
  conditional: "border-sand bg-sand-soft text-ink",
  private: "border-ink-soft/25 bg-cream text-ink",
}

export function AccessBadge({
  profile,
  label,
  className,
}: {
  profile: AccessProfile
  /** Verified `accessType`. Never synthesized. */
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        TONE[profile],
        className,
      )}
    >
      {label}
    </span>
  )
}
