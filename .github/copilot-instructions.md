Welcome! These are concise, repository-specific instructions to help an AI coding agent become productive quickly.

Keep this file short and prescriptive — focus on concrete patterns found in this repo.

Overview
- This project is a two-part monorepo: a React + Vite frontend in `/frontend` and an Express + Prisma backend in `/sales-app-backend`.
- Frontend is client-rendered (Vite, React 18), uses Tailwind CSS, and keeps most data access via `src/api/axios.js` to the backend API.
- Backend is Express with Prisma ORM (Postgres). Database models live in `sales-app-backend/prisma/schema.prisma` and server controllers are under `sales-app-backend/src/controller`.

Quick commands
- Start frontend dev server: cd frontend ; npm install (if needed) ; npm run dev
- Start backend dev server: cd sales-app-backend ; npm install (if needed) ; npm run dev
- Prisma: from backend folder run `npx prisma generate` then `npx prisma migrate dev --name <name>` (dev) or `npx prisma migrate deploy` (deploy). The repo contains migrations under `sales-app-backend/prisma/migrations`.

What to read first (fast path)
- `frontend/src/Context/ShopContext.jsx` — central client state: cart mapping, queued-add/login flow, helpers like `Add_Cart`, `addToCartDirect`, `get_TotalCart`, `fetchCart`.
- `frontend/src/Pages/Cart.jsx`, `frontend/src/Components/CartProduct.jsx`, `frontend/src/Components/TotalCart.jsx` — cart UI and selection logic; these components compute subtotal using `variantPrice` stored in ShopContext.
- `frontend/src/Pages/Product.jsx` — product details + add-to-cart + direct checkout behavior; uses `addToCartDirect` and `Add_Cart` from ShopContext.
- `sales-app-backend/src/controller/cartController.js` — server-side cart handlers (create/update/delete) and the normalization logic for `size` vs DB NULL and variantId handling.
- `sales-app-backend/prisma/schema.prisma` — DB model shapes: Product, ProductVariant, Cart, Order. Useful for understanding foreign keys (Prisma errors like P2003 happen here).

Patterns & conventions you must follow
- Cart/variant sizing: frontend sends `size` only when not 'default' (otherwise omits to map to DB NULL). When matching cart rows in backend, code expects size to possibly be NULL — use explicit where: { size: null } when appropriate.
- IDs: products and variants sometimes come as numbers or strings. Normalize with `Number(id)` only when safe; many code paths compare with `==` or cast to Number, so preserve existing patterns unless refactoring globally.
- Queued flows: adding to cart when unauthenticated uses `queuedAdd` saved in sessionStorage. After login the app shows a confirm modal and performs the queued add or queued checkout. If modifying this flow, update `ShopContext.jsx`, `App.jsx` (modals), and `LoginModal.jsx` to keep behavior consistent.
- Server-side: prefer soft-delete patterns for Product/Variant (repo already uses `isActive` on variants). When modifying deletion, avoid hard DELETE if child relations exist; either cascade or soft-delete and create audit log entries (superadmin flow exists in middleware `src/middleware/audit.js`).

Files that change cross-cutting behavior
- Modifying cart behavior: update BOTH `frontend/src/Context/ShopContext.jsx` (client mapping) and `sales-app-backend/src/controller/cartController.js` (server validation & where-clauses) to avoid FK errors and mismatches.
- Changing product/variant model: update Prisma schema, generate migration, run `prisma generate`, and update backend controllers and frontend code that relies on `variant.price`, `variant.size`, and `variant.isActive`.

Common pitfalls to avoid (learned from repo)
- Sending a string 'default' for size to the backend breaks DB matching with NULL and causes update/delete to not find rows. Normalize to omit field or send null.
- Attempting to delete a product with existing product_variants causes Prisma P2003 FK errors — use updateMany to soft-delete variants first, or delete variants before deleting product.
- Many components expect `cartItems` shape: nested object keyed by productId then sizeKey. When changing shape, update all call sites (search for `.cartItems[` usage).

Searchable examples (use these to find canonical code)
- Cart create/update: `sales-app-backend/src/controller/cartController.js`
- Shop state & queued flows: `frontend/src/Context/ShopContext.jsx`
- Product detail & direct checkout: `frontend/src/Pages/Product.jsx`
- Placeorder summary wiring: `frontend/src/Pages/Placeorder.jsx` + `frontend/src/Components/TotalCart.jsx`

Testing & smoke tests (quick manual checks)
1. Start backend + frontend. 2. Login, add variant product to cart, verify cart shows variantPrice and subtotal. 3. Unauthenticated add: ensure queuedAdd modal appears and after login queued operation is applied. 4. Soft-delete a product (isActive=false) and verify cart UI shows "product tidak ada" message while allowing delete.

When creating patches
- Make minimal, local changes and run both dev servers. After edits to Prisma schema always run `npx prisma migrate dev` and `npx prisma generate`. Fix any runtime errors in controllers immediately — don't commit build-breakers.

If you are an AI agent asked to implement a feature
- Read the relevant controller + frontend context first. E.g. for any cart change: read `cartController.js` and `ShopContext.jsx`. Make changes in both places. Run quick smoke manually.
- When updating navigation state or modal flows, update both `App.jsx` (modals) and the context that triggers them.

Ask the human when unclear
- If a DB migration touches pricing or existing production data, ask whether you should create a migration or modify data in-place. The repo contains production-like migrations — confirm before changing them.

If any part of this document looks wrong or outdated, tell me which file(s) and I will update promptly.
