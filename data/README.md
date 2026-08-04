# data/

## legislators-current.json

This file lives in `public/legislators-current.json`, not in this directory.
It moved out of `data/` because Vite inlines anything statically `import`ed
into the page's JS bundle, and at 1.4 MB that meant every visitor to
`/congress.html` downloaded, parsed, and evaluated all 537 members as
JavaScript before the page could render, even though a single lookup only
ever needs one state's entries. Living in `public/` instead makes it a plain
static asset that `src/congress/legislators.js` fetches lazily on first use
and caches in memory for the rest of the session.

Source: [unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators),
published at
`https://unitedstates.github.io/congress-legislators/legislators-current.json`.

Public domain. Maintained by a volunteer community, drawing on official
congressional sources (Clerk of the House, Secretary of the Senate, and others).

This is a **point-in-time snapshot**, not a live feed. It was current as of the
date it was downloaded and is committed to this repo so the Congress tool works
fully client-side without a runtime API call to fetch member data. It goes stale
as members leave office, change committee assignments, update contact
information, or a special election replaces someone mid-term.

To refresh it, run:

```
curl -sSL -o public/legislators-current.json \
  https://unitedstates.github.io/congress-legislators/legislators-current.json
```

Then commit the updated file. There is no build step tied to this: Vite copies
everything in `public/` to the site root as-is, and `src/congress/legislators.js`
fetches `/legislators-current.json` at lookup time.
