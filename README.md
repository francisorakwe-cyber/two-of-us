# Two of Us

A private question game for couples — including the long-distance kind.

Two people answer the same question separately. Nothing is revealed until **both** have
submitted. Then the answers open side by side, with a gentle read on whether you matched,
came close, or simply saw it differently. No compatibility score, no streak shaming, and
skipping is always allowed.

---

## What is in the app

| Area | What it does |
| --- | --- |
| **Games** | Seven categories — Getting to Know You, How Well Do You Know Me, Love & Romance, Deep Conversations, Fun & Crazy, Would You Rather, Truth or Dare — plus a Random Mix. Choose 5 / 8 / 12 questions, a depth filter, and *answer together* or *take turns*. |
| **Reveal** | Server-enforced privacy: your partner's answer is not sent to your browser until you have submitted yours. Reveals show both answers, a tone read, and four reactions (Warm, Funny, Curious, Keep). |
| **Daily question** | One question a day, the same for both of you, plus an optional couple prompt you can mark done. |
| **Notes** | Private notes between the two of you. Not a group chat. |
| **Favourites** | Star any question, save any answer, and replay your saved questions as a round. |
| **Progress** | Counts, a 12-week activity heatmap, rounds by category, and eleven badges. |
| **Us** | Partner profile, shared memory timeline of finished rounds, and your latest notes. |
| **Profile** | Edit display name, username, bio, and photo. |
| **Settings** | Light / dark / system theme, per-type in-app alerts, password change. |
| **Privacy** | Gender visibility, 18+ confirmation, and mutual opt-in for intimate questions. |
| **Studio** | Admin-only question editor, report queue, and announcements. |

## Tech stack

- **React 19** + **TanStack Router / Start** (file-based routes, server functions)
- **Vite 8** with **Tailwind CSS 4** (design tokens in `src/styles.css`)
- **Better Auth** for email/password and OAuth
- **PostgreSQL** via `pg` (Neon) in production, with an embedded **PGlite** fallback for
  local development and preview — no database setup required to run it
- **Recharts** for the progress charts, **lucide-react** for icons

## Running it

```bash
npm install
npm run dev          # http://localhost:8080
```

With no `DATABASE_URL` set, the app boots on the embedded PGlite database and applies
`migrations/*.sql` automatically. To use a real Postgres:

```bash
export DATABASE_URL="postgres://..."
npm run build        # builds, then runs migrations
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build + migrations |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (needs Node 22+ for `--experimental-strip-types`) |
| `npm run format` | Prettier |

## Project layout

```
src/
  components/two/     UI: shell, screens, play view, auth views, primitives, toasts
  lib/two/            Server functions (api.ts), question bank, game logic, categories
  lib/auth/           Better Auth wiring, gates, session handling
  routes/             File-based routes (TanStack Router)
  styles.css          Design tokens, dark mode, motion
migrations/           SQL schema — the single source of truth
server/               Nitro middleware
```

## Design notes

The interface is built on a small set of tokens (`--color-rose`, `--color-lavender`,
`--color-cream`, …) defined once in `src/styles.css` and redefined under
`html[data-theme="dark"]`. Every surface, border, and text colour reads from those tokens,
so dark mode is a token swap rather than a second stylesheet.

Motion is deliberately restrained: a short rise on entry, a pop on reveal, and a shimmer
on skeletons — all disabled under `prefers-reduced-motion`.

## Privacy model

The reveal rule is enforced in the server function, not in the UI. `getPlay` and `getHome`
only include a partner's answer once the requesting user has submitted their own for that
position. Disconnecting ends the live space; deleting an account removes shared rounds.

---

Made for two people, including the long-distance kind.
