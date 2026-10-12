/** @type {import('next').NextConfig} */
const nextConfig = {
  // No floating framework badge on the page, not even in dev (demo is screen-recorded).
  devIndicators: false,
  // Data lives in data/cases/*.json and content/legal/*.md and is read with fs at
  // build/request time, so make sure those files ship with the server bundle.
  outputFileTracingIncludes: {
    "/**": ["./data/**/*", "./content/**/*"],
  },
};

export default nextConfig;
