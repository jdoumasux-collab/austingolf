/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  /*
   * Permanent (308) redirects from superseded Area slugs to their canonical
   * destinations under the eleven-region Metro & Travel Corridors model. Each
   * old concept moved to exactly one new Area, so there is a single canonical
   * URL per Area and no duplicate indexable page. central-austin and
   * east-northeast kept their slugs and need no redirect.
   */
  async redirects() {
    return [
      { source: "/areas/resort-corridor", destination: "/areas/barton-creek", permanent: true },
      { source: "/areas/west-hill-country", destination: "/areas/lake-travis-bee-cave", permanent: true },
      { source: "/areas/round-rock", destination: "/areas/round-rock-georgetown", permanent: true },
      { source: "/areas/north-austin", destination: "/areas/north-austin-cedar-park", permanent: true },
      { source: "/areas/south-southwest", destination: "/areas/southwest-austin", permanent: true },
    ]
  },
}

export default nextConfig
