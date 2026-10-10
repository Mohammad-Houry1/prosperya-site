# Work and Expertise listing designs

The Work and Expertise index pages have been simplified. Their right-hand hero
cards are retained and populated from the CMS. Detail page designs are retained;
their content now comes from CMS records, including newly created slugs.

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

The site backend has list endpoints `/api/case-studies` and `/api/expertise`,
plus detail endpoints at the same paths followed by the record slug.
They enforce website-key module grants, tenant/owner restrictions and published
project/country/language scopes, exclude deleted/future/inactive records, order
by CMS `order`, paginate, and return only explicit public card fields.
The frontend follows all API pages and never substitutes local record data.
Grant Case Studies and Expertise to the existing website key in API Keys, and
deploy both the site backend and frontend to activate the connections.

## Detail pages

Work detail content comes from the selected Case Study's Description, Challenge,
Challenge Points, Solution, Results, Metrics, Metrics Note, Before/After titles
and compact system lists, Deliverables, Sections, Implementation Steps and Gallery.
The selected Platforms determine the technology stack in selection order: the
first published platform is the central platform. The selected Testimonial
supplies the quote. Client, Duration and Metrics populate the hero fact strip.
Hidden or ungranted related records are omitted. The next
project comes from published CMS records. Empty optional blocks are hidden.
Dense architecture lists switch to the existing compact list presentation so
adding more than seven source boxes cannot crash or discard CMS content.

Expertise detail content uses Expertise Title, Description and Detail Sections,
including each section's image. The existing hero animations and reading
navigation remain. Related expertise comes from other published Expertise rows.
Capabilities/tagline/summary/image populate the overview; Delivery/Metrics are
not extra slots in the existing Expertise detail template.

Detail SEO now reads the record's own SEO tab (CaseStudy or Expertise), including
new slugs, initial HTML metadata and sitemap entries. Overview SEO continues to
come from SEO Pages. Fixed captions use Translations; the label export includes
the Client/Duration captions. No new CMS fields are needed.

**Remaining:** Home's featured-record connections, Solutions and Approach
integration are separate remaining work. The site deployment and website key's
actual grants/content must be configured before the new sources can appear live.
