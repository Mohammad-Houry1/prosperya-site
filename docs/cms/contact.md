# Contact page

The introduction reads only `description` from `GET /api/corporate-pages/contact-form?locale=en` (or `fr`). No category parameter is sent. Create/publish the `contact-form` corporate page in the site's CMS scope and author its localized description as rich text. Its title and other sections are not rendered on Contact.

Contact choices still come from `/api/contact/options?locale=…`. The entire form shows a Mantine skeleton while these choices load; the introduction and FAQ load independently. The header and footer remain mounted, with skeletons only for their pending CMS text/list content.

## Google reCAPTCHA

Register Google reCAPTCHA **v2 checkbox** for the website host (also `localhost` for local testing). Set these in the backend environment:

```
RECAPTCHA_SITE_KEY=your-public-site-key
RECAPTCHA_SECRET_KEY=your-private-server-secret
```

`WEBSITE_PUBLIC_URL` must identify the actual website host: verification checks the hostname returned by Google against it. The options API exposes only the public site key, and only when a secret is configured. The private secret and verification token are never saved in the CMS submission.

The form sends `captcha_token` with its normal submission. The backend verifies it with Google's `siteverify` endpoint before saving. Missing/invalid/expired/reused tokens and mismatched hosts block submission. A Google outage fails closed with a bounded request timeout. Tokens reset after every attempted submission. Missing keys leave submissions disabled rather than bypassing verification.

Deployment must allow Google's reCAPTCHA scripts and challenge frames if a Content Security Policy is configured. See the [display guide](https://developers.google.com/recaptcha/docs/display) and [verification guide](https://developers.google.com/recaptcha/docs/verify).
