# About and corporate page links

`/en|fr/about` reads the published Corporate Page with slug `about-prosperya` through `GET /api/corporate-pages/about-prosperya?locale=...`. It does not request a Static Page. The hero uses the authored `about_title`, then `title`, then the localized CMS `name`. Description, cover image, generic corporate sections, story, facts, focus, principles and steps remain dynamic. Leadership profiles come directly from Users.

The content API returns raw Corporate Page records and the frontend derives its display view. For `about-prosperya`, the controller directly queries `User::forWebsite()` with the site's publication, approval, tenant, ownership, project, language and country restrictions, then calls `get()` and includes the raw records in the response's `users` collection. The frontend displays these profiles without a separate `/api/users` request or dependence on the page's legacy `about_users` selection. The website key must grant the Users module; without that grant, About remains available with an empty users collection. No role slug is assumed. Private user fields and embedded relationship snapshots are excluded. Empty sections and missing media do not add placeholder business content. Users load and retry with the About response.

The platform category remains `good-company`. Home uses its separate `clients` category.

Corporate footer and sidebar links use the localized CMS `name`, falling back to the authored `title` for older responses. The CMS name is the short navigation label; a long page heading or empty title no longer hides a link. Legal page headings fall back to that same name when the display title is empty.

About and the corporate route share raw CMS data in the query cache. LegalPage applies its presentation mapping with `select`, so navigation between those routes does not exchange incompatible data shapes.

Local checks cover the correct endpoint, localized fields, all five named footer links, public leader filtering, rich descriptions, missing titles, navigation cache reuse and desktop/mobile overflow. No live CMS records or permissions were changed.
