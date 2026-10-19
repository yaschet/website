# Contact Form

## Policy

The public Server Action accepts `unknown`, validates a strict envelope, trims
the four visible fields, bounds their lengths, and rejects multiline email
subjects. The sender and recipient are fixed on the server; user content is
plain text. Provider payloads and identifiers are not returned to the browser.
Server Action request bodies are capped at 16 KiB. Next's same-origin protection
remains enabled; this action also rejects absent or mismatched origins.

A hidden, unfocusable website field silently discards simple bot submissions.
It is a heuristic, not proof that the visitor is human. Shared Upstash sliding
windows bound validated attempts before any email request:

| Bucket | Limit |
| --- | --- |
| Client address | 5 attempts / 10 minutes |
| Reply email | 3 attempts / hour |
| Entire form | 30 attempts / hour |
| Entire form | 100 attempts / day |

All instances use Redis; there is no process-local quota fallback. Buckets are
checked in order, so a later rejection may still consume an earlier quota.
Rejected mail requests and manual retries also count as attempts. The global
budgets bound rotating-address abuse, although deliberate quota exhaustion can
temporarily prevent legitimate submissions. These are application controls,
not edge DDoS protection or a CAPTCHA. Review actual abuse before adding a
challenge provider or adjusting budgets.

IP and normalized email bucket identifiers use HMAC-SHA256 with a server-only
secret. Redis receives hashes and counters, not raw contact content. Only when
`VERCEL=1` do we use the platform's `x-vercel-forwarded-for` header, after address
validation and IPv6 canonicalization. Arbitrary forwarding headers are ignored.
Outside Vercel, or without a valid platform address, visitors share a conservative
unidentified-address quota. Another host needs its own reviewed trust boundary.
See [Vercel request headers](https://vercel.com/docs/headers/request-headers).

Missing configuration, Redis errors, and limiter timeouts stop delivery. Upstash
permits requests by default on timeout; our policy explicitly rejects that
result. Redis HTTP retries are disabled; the limiter SDK can make one full-script
fallback after a script-hash failure. Each Redis request has a 2-second abort
signal and each limit check has a 1.5-second timeout. No provider exception is
included in the action result. See [Upstash timeout behavior](https://upstash.com/docs/redis/sdks/ratelimit-ts/features).

The form disables submission while pending, makes no automatic write retry, and
retains values after failure. A draft's UUID and normalized content fingerprint
produce a stable email idempotency key. Exact manual retries use the same key;
changed content or a new successful draft produces a different key. Resend's
deduplication lasts 24 hours; reloads start a new draft identifier. Email requests
have a 10-second abort signal. An aborted request may already have been accepted,
so the same key is retained for retry. See [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Configuration Before Release

As reviewed on October 18, 2026, Upstash is the selected adapter because the
repository already has its SDKs and the form needs shared email/hour/day buckets.
Its [free plan](https://upstash.com/pricing/redis) includes 500,000 monthly commands
and 250 MB; ordinary portfolio volume should fit, but abuse consumes commands too.
Vercel's [native limiter](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
is a valid alternative for a simple edge rule. Its regional counters and Hobby
window/rule limits do not provide the same shared budgets as this policy.

Set these server-only variables for each environment that should deliver mail:

- `RESEND_API_KEY`: existing authorized email service key.
- `UPSTASH_REDIS_REST_URL`: HTTPS REST URL for the selected Redis database.
- `UPSTASH_REDIS_REST_TOKEN`: its server-side credential.
- `CONTACT_RATE_LIMIT_SALT`: stable random secret of at least 32 characters;
  generate with `openssl rand -hex 32` and store in environment settings.

Use a dedicated database or reviewed namespace and keep preview/production
quotas independent. The key prefix is `website:contact:v1:*`. Do not put any of
these values in `NEXT_PUBLIC_*`, screenshots, commit messages, or documentation.
Rotating the hashing secret resets address/email identities; it is not a routine
rate-limit reset. Shared global budgets remain in Redis until their windows expire.

The optional limiter variables allow builds and non-contact pages to work before
service setup. Omission leaves the form visible but returns a safe temporary
unavailability error on submission. Do not release without configuring and
verifying the shared service.

## Provisioned Environments

On October 19, 2026, a database was provisioned in the owner's Upstash account
with these settings:

| Setting | Value |
| --- | --- |
| Database | `yaschet-website-production` |
| Plan | Free; no payment method or paid add-on added |
| Primary region | AWS Northern Virginia (`us-east-1`) |
| Website functions | Existing Vercel region `iad1` |
| Eviction | Disabled, so memory pressure cannot discard active quotas |
| Credential scope | Vercel `website` project, Production only |

The database belongs to the website environment, rather than one form. Contact
limits own `website:contact:v1:*`; future features must own distinct prefixes and
policies, such as `website:comments:v1:*`. Adding a feature does not require
renaming the database.

The console enforces one Free database for this account. Preview and Development
therefore receive no production Redis credential or hashing secret. Their contact
submissions fail closed until a separate non-production datastore is configured.
Deterministic tests use intercepted transports. Do not share production access
with previews merely to make preview submissions succeed.

The Redis URL, token, and independently generated 256-bit hashing secret are saved
as Vercel Production secrets. They are absent from source control and public
configuration. Local `.vercel/` contains only the ignored project link; local
environment files remain ignored. A fresh clone can link the existing project
and copy `.env.example` to `.env.local`, leaving the limiter variables empty until
an isolated development datastore exists.

Live verification authenticated over TLS and alternated requests between two
independent SDK clients: five attempts succeeded and the sixth was rejected.
Verification used a separate `website:verification:contact:*` prefix with a
10-second window and confirmed key expiry within 60 seconds. Production contact
budgets were not consumed, and no email request was made.

Saving environment settings does not update an existing deployment. The contact
code must follow the reviewed Git release workflow before the public website uses
these controls. No website deployment was performed during provisioning.

Free-tier availability has operational limits: command exhaustion stops delivery,
and Upstash documents archival after at least 30 days of inactivity, with warning
emails. Review those notices and restore the database if archived; do not add
synthetic traffic merely to conceal this limitation. See the
[Upstash inactivity policy](https://upstash.com/docs/redis/help/faq#what-happens-if-my-database-is-not-used).

## Verification

`pnpm test:unit` runs deterministic policy and installed-adapter tests with no
browser or web server. Provider HTTP calls are intercepted with inert credentials;
there is no fallback to real network delivery. Tests cover input/origin rejection,
bot trapping, every quota, timeout/outage rejection, address trust, identifier
hashing, retry keys, fixed mail fields, provider failure, and bounded SDK fallback.
The tests use the already installed Playwright runner without browser fixtures.

Review the existing contact UI in both themes and at mobile/desktop sizes. Check
field error associations, keyboard navigation, pending duplicate prevention, and
draft preservation after rejection. Mock action transport for client states.
Never send a real contact email without explicit authorization. Local tests do
not prove production Redis connectivity, deployed headers, or email delivery.
