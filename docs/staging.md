# Portfolio staging

The website has one repository and two deployment branches. `main` owns the
public production site at `yaschet.com`; `staging` owns the review site at
`staging.yaschet.com`. Private Office has independent deployments.

## Git workflow

Work on a scoped conventional branch in GitButler. Open a pull request into
`staging` and pass the Quality workflow before merging. Vercel's Git integration
builds branch pushes automatically. Do not deploy a local checkout with the
Vercel CLI, force-push `staging`, or push to `main` to refresh the review site.

A staging deployment is a review checkpoint, not production acceptance. After
design and content approval, open a separate release pull request from `staging`
into `main`; verify the checks, production commit and domain. Preserve published
history and an identifiable rollback commit.

## Access and indexing

Use Vercel Authentication with Standard Protection
(`prod_deployment_urls_and_all_previews`). An anonymous visitor to the custom
staging domain must sign in; production domains remain public. Do not create
public bypass links as a substitute for access control.

All Vercel Preview builds send `X-Robots-Tag: noindex, nofollow, noarchive` on
pages and assets, render `noindex, nofollow` metadata, disallow crawling in
`robots.txt`, and return an empty sitemap. Canonicals remain production URLs.
Explicit headers matter because Vercel omits its default `noindex` header on
custom preview domains. Indexing rules are not access controls or a guarantee
that a hostname cannot be discovered.

Do not link staging from production or include it in a public sitemap. The
source repository remains public even when the review website is protected;
review commits for private content and credentials before pushing.

## Services and verification

Preview deployments have no production Redis credentials or contact hashing
secret. Contact delivery fails closed; review form states with isolated
Storybook transports. Real email tests require explicit authorization. See
[Contact form](contact-form.md) for service configuration and rate-limit policy.

After each update, verify the Git commit, successful Quality run, READY Git
deployment, domain assignment, anonymous authentication challenge, and
authenticated preview indexing headers. Review changed pages in both themes
and at a mobile width before promoting anything to production.

Staging runs on Vercel. Viewing it does not require local Next.js or Storybook
servers. Use CI for the full browser and Storybook suite when local resources
are constrained.
