/**
 * Rafi9i — JsonLd (Developer 1)
 * Server component emitting a JSON-LD script tag for structured data.
 * Data must reflect visible page content (see lib/structured-data.ts).
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is built from local constants, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
