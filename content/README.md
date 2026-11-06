# Case Study Content

`projects/` contains the active public MDX case studies. Each file owns its
article, metadata and media references. Internal plans, editorial snapshots
and private source links must stay outside the public repository.

Export `metadata` as a JSON-compatible object: quoted keys, literal values and
no trailing commas. Listing routes parse and validate that object without
evaluating JavaScript or loading the article's interactive components. Filenames
use a flat slug containing only letters, numbers, hyphens or underscores.

The article template renders the headline, role, project context, stack and
main film from MDX metadata. The ETL film remains inside Phoenix's article.
Playback IDs identify public Mux streams; they are not credentials. Posters
are selected frames from the corresponding films. Preserve the disclosures
about anonymized client identities, synthetic records and demonstration limits.

Phoenix's existing screenshots and Portal's five selected screenshots are
retained. ERP currently has text only, pending its screenshot selection.

Publication dates and project delivery periods are separate metadata. Changes
to an external writing source do not synchronize automatically. Update the MDX
and verify its rendered article, listing card and Markdown response together.

`archive/` is ignored local editorial storage. It is never a content-loader
input and must not be added to a commit. Git retains the history of published
articles.
