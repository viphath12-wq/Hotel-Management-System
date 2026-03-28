# Assignment-Vue (Vue 3 + Vite)

Frontend admin/dashboard for the Hotel / Reservation project.

## Requirements

- Node.js (LTS recommended)
- npm

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure API base URL

This project calls the Laravel API defined in `src/util/configurl.js`.

By default it is set to:

- API: `http://localhost:8000/api`
- Image base path: `http://localhost:8000/storage/`

If your API runs on a different host/port, update `src/util/configurl.js`.

> Note: There is a commented-out version in `configurl.js` showing how to use Vite env variables (`import.meta.env.VITE_BASEURL`, `import.meta.env.VITE_IMAGE_PATH`) if you prefer.

3) Start dev server

```bash
npm run dev
```

4) Build for production

```bash
npm run build
```

5) Preview production build

```bash
npm run preview
```

## Features

- JWT authentication (login/logout)
- User management
- Roles & permissions management
- Rooms / Guests / Reservations management
- Profile page with avatar upload/remove

## Image handling (Cloudinary)

The backend can store either:

- A full URL (example: Cloudinary `https://res.cloudinary.com/...`)
- A relative storage path

This frontend uses a shared helper `resolveImageUrl()` (`src/util/image.js`) so Cloudinary URLs render correctly and relative paths still work.

## Notes

- Make sure the Laravel API is running before using this frontend.
- If you see CORS errors, configure CORS on the API side.
