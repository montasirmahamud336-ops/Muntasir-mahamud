# Local CMS Setup (No Supabase for CMS)

CMS এখন আলাদা localhost backend দিয়ে চলে।

## 1) Environment

`/.env` এ এগুলো রাখো:

```env
VITE_CMS_BACKEND_URL="http://localhost:4000"

CMS_ADMIN_USERNAME="admin"
CMS_ADMIN_PASSWORD="ChangeMe123!"
CMS_ADMIN_EMAIL="montasirmahamud336@gmail.com"
CMS_JWT_SECRET="change-this-local-cms-jwt-secret"
CMS_PORT="4000"
```

## 2) Run servers

টার্মিনাল 1:

```bash
npm run cms:server
```

টার্মিনাল 2:

```bash
npm run dev
```

## 3) Login

- URL: `/admin/login`
- Username: `CMS_ADMIN_USERNAME`
- Password: `CMS_ADMIN_PASSWORD`

## 4) Data location

- CMS data file: `cms-server/data/cms-db.json`
- Media uploads: `cms-server/uploads/`

## 5) Modules

- Dashboard
- Pages
- Page Builder
- Testimonials
- Media
- Settings

## 6) Publish behavior

- `Draft` content live site এ দেখাবে না
- `Published` content সাথে সাথে দেখাবে
- Testimonial delete করলে `Draft` এ যাবে (hard delete না)
