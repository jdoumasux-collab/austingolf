import { redirect } from "next/navigation"

/** The prototype's entry point is the COURSES landing page. */
export default function RootPage() {
  redirect("/courses")
}
