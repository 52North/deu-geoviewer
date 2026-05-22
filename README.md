# DEU GeoViewer

An Angular-based map viewer application built with [OpenLayers](https://openlayers.org/) and [Angular](https://angular.io/) (v20).

## Prerequisites

- Node.js 22+
- npm

## Installation

```bash
npm install
```

## Local Development

This workspace contains two Angular projects:

- **`deu-viewer`** — the main application
- **`ngx-guided-tour`** — a local Angular library bundled in `projects/ngx-guided-tour/`

Because `ngx-guided-tour` is a local library, it must be built before the main app. The npm scripts handle this automatically.

### Development server

```bash
npm start
```

This builds `ngx-guided-tour` first, then starts the dev server. Navigate to `http://localhost:4200/`. The app reloads automatically on source file changes.

> **Do not use `ng serve` directly** — it skips the library build and will fail.

### Build

```bash
npm run build
```

Builds `ngx-guided-tour` and then the main application. Build artifacts are written to `dist/deu-viewer/browser/`.

### Linting

```bash
npm run lint
```

### License report

```bash
npm run license-report
```

Generates a license report for all dependencies in `license/license-report.md`.

## Docker

A multi-stage `Dockerfile` is included. The image builds the app and serves it via nginx.

```bash
docker build -t deu-geoviewer .
docker run -p 8080:80 deu-geoviewer
```

Environment variables available at runtime:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `80` | Port nginx listens on |
| `BASE_HREF` | `/` | Base href for the Angular app |
| `PROXY_URL` | `https://www.europeandataportal.eu/mapapps-proxy?` | Map proxy URL |
| `DEPLOY_URL` | `https://ppe.data.europa.eu/` | Deployment URL |

