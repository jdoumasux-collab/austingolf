/**
 * Module 6 — tees & playing options.
 *
 * Renders strictly what `teeView` authorizes, and does not re-derive the
 * publication gate. The projection already nulls suppressed rating/slope values,
 * so this component cannot leak them even if it tried; `showRatings` additionally
 * drops the columns so the table never advertises data it is withholding.
 *
 *   table   — verified tee rows (ratings only when the gate permits)
 *   summary — course-level yardage/par only, no tee table
 *   absent  — nothing publishable; the caller omits the module entirely
 *
 * Rows are grain (tee, audience): the same tee can carry different ratings for
 * different audiences, so rows are never merged and values are never inferred.
 */

import { VerifiedNote } from "@/components/course/course-section"
import { type TeeView } from "@/lib/course-page"

export function CourseTees({ view }: { view: TeeView }) {
  if (view.kind === "absent") return null

  if (view.kind === "summary") {
    return (
      <div>
        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          {view.maxYardage !== null ? (
            <div>
              <dt className="text-xs text-ink-muted">Yardage</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">
                {view.maxYardage.toLocaleString()} yds
              </dd>
            </div>
          ) : null}
          {view.par !== null ? (
            <div>
              <dt className="text-xs text-ink-muted">Par</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{view.par}</dd>
            </div>
          ) : null}
        </dl>
        <VerifiedNote>
          A full tee-by-tee scorecard for this course is not yet verified, so only
          course-level figures are shown.
        </VerifiedNote>
      </div>
    )
  }

  const { tees, showRatings } = view

  return (
    <div>
      {/* Horizontal scroll keeps the table honest on narrow screens instead of
          dropping columns or wrapping numbers into ambiguity. */}
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[22rem] border-collapse text-sm">
          <caption className="sr-only">
            Verified tee sets for this course
            {showRatings
              ? ", with yardage, par, course rating and slope"
              : ", with yardage and par"}
          </caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-ink">
                Tee
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-ink">
                Yards
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-ink">
                Par
              </th>
              {showRatings ? (
                <>
                  <th
                    scope="col"
                    className="py-2 pr-4 text-right font-semibold text-ink"
                  >
                    Rating
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold text-ink">
                    Slope
                  </th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {tees.map((t, i) => (
              <tr
                key={`${t.teeName}-${t.audienceRating ?? "any"}-${i}`}
                className="border-b border-border last:border-0"
              >
                <th scope="row" className="py-2.5 pr-4 text-left font-medium text-ink">
                  {t.teeName}
                  {/* Audience is what distinguishes two rows of the same tee. */}
                  {t.audienceRating ? (
                    <span className="ml-1.5 text-xs font-normal text-ink-muted">
                      {t.audienceRating}
                    </span>
                  ) : null}
                </th>
                <td className="py-2.5 pr-4 text-right tabular-nums text-ink-soft">
                  {t.totalYardage !== null ? t.totalYardage.toLocaleString() : "—"}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-ink-soft">
                  {t.par !== null ? t.par : "—"}
                </td>
                {showRatings ? (
                  <>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-ink-soft">
                      {t.courseRating !== null ? t.courseRating.toFixed(1) : "—"}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-ink-soft">
                      {t.slopeRating !== null ? t.slopeRating : "—"}
                    </td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showRatings ? (
        <VerifiedNote>
          Course rating and slope are pending first-party confirmation and are not
          shown.
        </VerifiedNote>
      ) : null}
    </div>
  )
}
