# TypeScript Migration Roadmap

**Date:** September 10, 2026  
**Target:** `frontend/` (Vite / React 19) and `backend/` (Express 5 / Sequelize / Node 22)

---

## 1. Architectural Strategy

The project consists of two independent packages (`frontend/` and `backend/`). To ensure zero downtime and smooth development during migration, the codebase will be converted **incrementally** using `allowJs: true` in `tsconfig.json`.

### Frontend Strategy (`frontend/`)
* **Tooling**: Vite natively parses TypeScript out of the box. Adding `typescript` and type declaration packages (`@types/react`, `@types/react-dom`) will enable type-checking alongside Vite's build pipeline.
* **Type-checking**: Adding `"typecheck": "tsc --noEmit"` script to `package.json` for CI / pre-commit validation.

### Backend Strategy (`backend/`)
* **Tooling**: Node 22 runtime supports TypeScript interop natively and via `tsx` (fast TypeScript execution engine). Using `tsx watch server.ts` replaces Node's built-in `--watch` for development without requiring pre-compilation steps.
* **Module Interop**: Preserves existing ESM/CJS interop patterns while typing Sequelize models and Express middleware.

---

## 2. Shared Domain Types

Creating a core set of interfaces will unify type safety across frontend API calls and backend route handlers:

```typescript
// Pin Domain Interface
export interface Pin {
  id: number;
  title: string;
  comment?: string;
  lat: number;
  lng: number;
  authorid?: number;
  authorName?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User Domain Interface
export interface User {
  id: number;
  username: string;
  email?: string;
  authLevel: number;
}

// Comment Domain Interface
export interface Comment {
  id: number;
  PinParent: number;
  CommentParent: number | null;
  replyLevel: number;
  comment: string;
  authorid?: number;
  authorName?: string;
  createdAt?: string;
}

// API Response Wrappers
export interface ApiResponse<T = any> {
  err?: boolean;
  message?: string | T;
  data?: T;
}
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Tooling & Environment Setup
- [ ] **Frontend**: Install `typescript`, `@types/react`, `@types/react-dom`, `@types/node`.
- [ ] **Frontend**: Create `tsconfig.json` tuned for Vite + React 19.
- [ ] **Backend**: Install `typescript`, `tsx`, `@types/express`, `@types/node`, `@types/bcrypt`, `@types/cors`, `@types/cookie-parser`.
- [ ] **Backend**: Create `tsconfig.json` tuned for Node 22 (`NodeNext` resolution).

### Phase 2: Core Utilities & Types
- [ ] **Frontend**: Create `src/types/index.ts` for domain interfaces and type `src/api.js` -> `src/api.ts`.
- [ ] **Backend**: Extend Express Request type (`req.user`) in `types/express.d.ts` and define Sequelize model attributes in `services/types.ts`.

### Phase 3: Incremental File Conversion
- [ ] **Frontend Components**:
  - `src/components/Maps.jsx` -> `Maps.tsx`
  - `src/components/Card.jsx` -> `Card.tsx`
  - `src/components/paginations.jsx` -> `paginations.tsx`
- [ ] **Frontend Pages & Routes**:
  - `src/pages/Pins.jsx` -> `Pins.tsx`
  - `src/pages/Comments.jsx` -> `Comments.tsx`
  - `src/pages/Auth.jsx` -> `Auth.tsx`
  - `src/pages/Profile.jsx` -> `Profile.tsx`
  - `src/routes/routes.jsx` -> `routes.tsx`
  - `src/main.jsx` -> `main.tsx`
- [ ] **Backend Models & Middleware**:
  - `models/*.js` -> `models/*.ts`
  - `middleware/*.js` -> `middleware/*.ts`
  - `services/*.js` -> `services/*.ts`
- [ ] **Backend API & Server Entry**:
  - `apis/*.js` -> `apis/*.ts`
  - `routes/api.js` -> `routes/api.ts`
  - `server.js` -> `server.ts`

### Phase 4: Verification & Strict Mode
- [ ] Run `tsc --noEmit` on both packages to ensure 0 type errors.
- [ ] Run backend tests (`vitest`).
- [ ] Enable `noImplicitAny` and strict null checks across both packages.
