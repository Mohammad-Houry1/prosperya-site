# Work and Expertise listing designs

The Work and Expertise index pages have been simplified. Detail page designs
and their current data sources are unchanged by this change.

## Work → Case Studies

Create or edit one Case Study for each project:

- Properties: name, slug, status, project/country/language scope; reorder records
  in the CMS to set listing order.
- Case Study Content: Title, Summary, Industry and Client.
- Images: main Case Study Image. There is no mandatory placeholder image.
- Relationships: Related Expertise determines the capability filter.
- Detailed metrics, architecture and implementation content belong to the detail
  page, not the new listing card.

The listing has a simple introduction, industry/expertise filters, a two-column
image grid, optional CMS Testimonials and a compact contact link. It becomes one
column on mobile. Industry options come from the translated published records.

## Expertise → Expertise

- Properties: name, slug, status and scope; CMS reorder sets display order.
- Expertise Content: Title, Tagline, Summary and Capabilities.
- Images: Expertise Image, including an uploaded SVG.
- Detail Sections, Delivery and Metrics stay available for detail-page content.

The listing uses numbered editorial rows with optional imagery, followed by a
compact contact link. There is no fixed four-record limit or four-state diagram.

## Shared copy, permissions and deployment

Fixed headings, captions and buttons use existing Translations keys. Normal
route SEO comes from SEO Pages (`work` and `expertise`). No new CMS module or
field is needed. The exported label file preserves the current source defaults;
the CMS import command upserts labels and does not delete old records.

The site backend now has list endpoints `/api/case-studies` and `/api/expertise`.
They enforce website-key module grants, tenant/owner restrictions and published
project/country/language scopes, exclude deleted/future/inactive records, order
by CMS `order`, paginate, and return only explicit public card fields.
The frontend follows all API pages and never substitutes local record data.
Grant Case Studies and Expertise to the existing website key in API Keys, and
deploy both the site backend and frontend to activate the connections.

**Remaining:** Work and Expertise detail routes still read their previous local
datasets. Existing matching slugs continue to resolve there; arbitrary new CMS
slugs require a separate detail API/adapter integration. Their designs were
deliberately left unchanged. Home's featured-record connections, Solutions and
Approach integration are also separate remaining work.
