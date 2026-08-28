import Link from "next/link"

/*
  Shared AustinGolf wordmark.

  This is consistency cleanup, not a new logo. It lifts the exact Experiment 04
  header treatment — a single uppercase, letterspaced serif unit in ink — into
  one place so the header and the footer stop disagreeing (the footer previously
  carried an older two-tone "Austin" + "Golf" split). No new type, colour, or
  mark is introduced; only the existing header identity is reused.

  `size` exists only so the footer can render the same mark a touch smaller than
  the header without redefining the treatment. `href` defaults to "/" so the
  brand mark routes to the homepage (it previously pointed at /courses).
*/
export function Wordmark({
  href = "/",
  size = "md",
  className = "",
}: {
  href?: string
  size?: "md" | "sm"
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label="AustinGolf home"
      className={`inline-flex shrink-0 items-center rounded-sm ${className}`}
    >
      <span
        className={
          size === "sm"
            ? "ag-display uppercase leading-none tracking-[0.3em] text-ink text-[0.8125rem]"
            : "ag-display uppercase leading-none tracking-[0.3em] text-ink text-[0.9375rem] sm:text-base"
        }
      >
        Austin Golf
      </span>
    </Link>
  )
}
