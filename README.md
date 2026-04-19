# Tabletop Hub

Tabletop Hub is a Vite + React web app for exploring personal board game data through charts, filters, and summary views.

## Features

- Overview dashboard for play history and trends
- Social, games, collection, challenges, and players views
- Filterable analytics built from the bundled `boardgame_data.json` export
- Static build output suitable for GitHub Pages

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Sanitize player names in `boardgame_data.json` before publishing:

```bash
npm run sanitize:data
```

The sanitizer shortens player names to `First L.` and clears embedded username fields that would otherwise ship in the client bundle.

## GitHub Pages

This project is configured to build for the `tabletop-hub` repository path and uses hash-based routing so page refreshes work on GitHub Pages.
