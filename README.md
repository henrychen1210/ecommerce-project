# e-com

A fashion ecommerce portfolio site with product browsing, user auth, and favourites.

**Live:** https://ecommerce-project-woad-ten.vercel.app/

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JS |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | MongoDB Atlas (free tier) |
| Auth | JWT (Authorization header + httpOnly cookie) |
| Password hashing | Argon2 |
| Hosting | Vercel |

---

## Architecture

```
public/               ← Static files served by Vercel CDN
  index.html          ← Home (product listing)
  login/              ← Login page
  register/           ← Register page
  admin/              ← Admin dashboard
  products/details/   ← Product detail page (data fetched client-side)
  image/              ← Product images
  js/product.js       ← Product detail page logic

api/                  ← Vercel Serverless Functions (auto-detected)
  login.js            ← POST /api/login
  register.js         ← POST /api/register
  logout.js           ← GET  /api/logout
  favorite.js         ← PUT  /api/favorite
  unfavorite.js       ← DELETE /api/unfavorite
  favlist.js          ← GET  /api/favlist
  products/
    index.js          ← GET /api/products
    image.js          ← GET /api/products/image
    details/
      [productId].js  ← GET /api/products/details/:productId
  admin/
    user.js           ← GET /api/admin/user

lib/                  ← Shared server logic (used by all api/ functions)
  mongoServer.js      ← DB connection + all route handlers
  middleware.js       ← JWT auth, input validation
  createHandler.js    ← Creates Vercel-compatible Express mini-apps

models/               ← Mongoose schemas (Product, Brand, Type, User)
```

---

## Features

- Product listing with brand/category filtering and pagination
- Product detail pages
- User registration and login
- JWT authentication
- Add/remove favourites
- Admin dashboard (user list + favourite products)

---

## Local Development

```bash
npm install
npm start        # Express server at http://localhost:3000
npm run dev      # With auto-reload (nodemon)
```

Create a `.env` file:
```
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
PORT=3000
```

---

## Deployment (Vercel)

Pushes to `main` auto-deploy. One-time setup:

1. In Vercel dashboard → **Settings → Environment Variables**, add:
   - `MONGO_URL`
   - `ACCESS_TOKEN_SECRET`
2. In MongoDB Atlas → **Network Access** → Add `0.0.0.0/0` (allow all IPs)

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/login` | — | Login, returns JWT |
| POST | `/api/register` | — | Register new user |
| GET | `/api/logout` | JWT | Clear auth |
| GET | `/api/products` | — | List products (paginated, filterable) |
| GET | `/api/products/details/:id` | — | Product details (JSON) |
| GET | `/api/products/image?productId=` | — | Product image URL |
| PUT | `/api/favorite` | JWT | Add to favourites |
| DELETE | `/api/unfavorite` | JWT | Remove from favourites |
| GET | `/api/favlist` | JWT | Get user's favourites |
| GET | `/api/admin/user` | JWT (admin) | List all users |

Query params for `/api/products`: `page`, `brand` (repeatable), `type` (repeatable).
