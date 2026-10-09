# Annvea's Web

My personal site, live at **[annvea.com](https://annvea.com)**.

Built with Next.js, React, Prisma (PostgreSQL) and Auth.js, with an admin
panel for managing the gallery, travel map and skills.

## Development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, ...
npm run db:migrate
npm run db:seed
npm run dev
```

## Deployment

Every push to `main` deploys automatically via GitHub Actions
(`.github/workflows/deploy.yml`): the app is built on the runner, synced to
the server, and reloaded under pm2 behind Nginx.
