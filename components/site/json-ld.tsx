import { serializeJsonLd, type JsonLd as Data } from "@/lib/structured-data";

/**
 * Search-engine data for the page — invisible, built in lib/structured-data.ts.
 * A plain <script>, not next/script: it is data, not code to execute.
 */
export function JsonLd({ data }: { data: Data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
