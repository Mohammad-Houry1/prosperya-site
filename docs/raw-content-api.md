# CMS records in the public API

Content APIs return full serialized CMS records under `data`. Controllers no longer select or rename authored fields, flatten translations, normalize media, or replace relationship IDs with mapped records. New authored fields are included automatically. Existing tenant, website-key/module, owner, project, publication, language, country and deletion query restrictions remain.

Lists use `get()` by default. Supplying `page` or `per_page` opts into pagination and its existing `meta` envelope. Selected relationships can be read through `ids[]` (up to 50 IDs per request); those reads apply the target module's public restrictions. `/api/industries` supports the case-study industry lookup and requires the Industry module.

The response `context` contains only public presentation information: locale, language ID, default locale and CMS media origin. It contains no API key or database credentials.

## Frontend

`websiteApi` preserves the original `response.data` and creates `response.view` in the frontend. `contentView(response)` returns the display view for page rendering. Inspect Network → `/api/...` → Response to see the complete original CMS field structure.

The display adapter resolves locale maps and language-ID sidecars, normalizes image URLs, derives existing layout aliases such as article title/body and testimonial quote, and looks up selected relationships through public endpoints. Selected order is preserved; unpublished/inaccessible targets are omitted from the display view. Optional denied modules leave the parent content available. Failed network/service lookups surface as errors. Requests inherit the caller's cancellation signal; no pagination fetch loop is used.

FAQ responses include the raw public `answers` collection separately from question records; the frontend joins and translates those answers. Contact options return complete option/reference records, with the public reCAPTCHA site key alongside them.

The `about-prosperya` Corporate Page response includes a raw `users` collection queried directly through the User model. Its display view uses these profiles for leadership without another users API request.

## Private fields and remaining protocols

Model serialization strips credentials, private contact fields and known internal fields recursively. Embedded selected-content snapshots become reference IDs, so unpublished target content cannot escape through a public parent. User profiles retain a strict public-field list, including only public profile translations. `$guarded` remains write protection, not response protection.

Search retains its cross-collection pagination, returning `{type, record}` entries with full matching records; the frontend derives result titles, summaries and links. SEO metadata/initial HTML and submission acknowledgments keep their existing specialized protocols. They are not raw CMS record endpoints.

## Verification

Backend verification uses a separate local MongoDB and disposable test databases. Raw contract tests cover extra/new fields, locale maps, unpaginated lists, nested privacy and scheduled user lookups. Frontend tests cover raw data preservation, frontend views, media origins, language-ID translations, selected relationships, split FAQs, and rendered French solution/article pages.
