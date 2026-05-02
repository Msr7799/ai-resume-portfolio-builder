# AI Resume & Portfolio Builder

Production-minded MVP for building a professional CV, portfolio website, and public profile page for students, junior developers, freelancers, and software engineers.

## Description

This app helps users create career materials from one workspace:

- Resume builder with guided sections and print-friendly preview.
- Portfolio builder with public profile route.
- AI writing assistant with a safe mock fallback.
- GitHub public profile fetcher for repository/project suggestions.
- Local-first storage abstraction that can later be replaced by Firebase, Supabase, PostgreSQL, or an API backend.
- Arabic and English UI support with RTL direction switching.

## Features

- Landing page with hero, features, templates, workflow, pricing placeholder, and CTA.
- Step-by-step onboarding wizard.
- Dashboard with profile completion, project/skill counts, statuses, recent activity, and quick actions.
- Resume editor for personal info, experience, education, projects, skills, templates, and AI improvements.
- Print-to-PDF resume preview using `@media print`.
- Canva-based visual resume templates with live overlays.
- Downloadable `@react-pdf/renderer` PDF where the Canva image is the background and text, links, profile image, and QR code remain real PDF elements.
- Portfolio editor and preview.
- Public portfolio page at `/u/[username]`.
- GitHub connection screen using the public GitHub API.
- Mock sign in and sign up pages.
- Dark mode and light mode via `next-themes`.
- Strong TypeScript models and reusable component architecture.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- pnpm
- lucide-react
- framer-motion
- react-hook-form
- zod
- next-themes
- clsx
- tailwind-merge
- @react-pdf/renderer
- qrcode

## Screenshots

Place screenshots here after deployment:

- `docs/screenshots/landing.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/resume-builder.png`
- `docs/screenshots/portfolio-preview.png`

## How To Run

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

Production checks:

```bash
pnpm lint
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` when connecting real services.

```bash
MONGODB_URI=
MONGODB_DB=ai_resume_portfolio_builder
AUTH_SECRET=
CLOUDINARY_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
LLM_API_KEY=
LLM_ROUTER_ARCH_BASE_URL=https://router.huggingface.co/v1
LLM_ROUTER_ARCH_MODEL=katanemo/Arch-Router-1.5B
LLM_ROUTER_ROUTES_PATH=./config/resume-routes.json
LLM_ROUTER_OTHER_ROUTE=casual_conversation
LLM_ROUTER_FALLBACK_MODEL=Qwen/Qwen2.5-7B-Instruct
LLM_ROUTER_ARCH_TIMEOUT_MS=10000
LLM_ROUTER_MAX_ASSISTANT_LENGTH=1000
LLM_ROUTER_MAX_PREV_USER_LENGTH=1000
LLM_ROUTER_ENABLE_MULTIMODAL=false
LLM_ROUTER_MULTIMODAL_MODEL=
LLM_ROUTER_ENABLE_TOOLS=false
LLM_ROUTER_TOOLS_MODEL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
PUBLIC_LLM_ROUTER_DISPLAY_NAME=Omni Resume Router
PUBLIC_LLM_ROUTER_ALIAS_ID=omni-resume
PUBLIC_LLM_ROUTER_LOGO_URL=
```

Notes:

- `MONGODB_URI` is used by server API routes only. Never expose it to client components.
- `AUTH_SECRET` signs the HttpOnly session cookie.
- Cloudinary credentials are used server-side for profile images, resume PDFs, QR assets, and future project/template assets.
- `LLM_API_KEY` must only be used from server-side code.
- The AI route uses the Omni router when `LLM_API_KEY` is configured and falls back to a safe local mock when upstream calls fail.
- Authentication is mocked for MVP. Real Firebase Auth, Supabase Auth, or NextAuth can be connected later.

## MongoDB Auth And User Storage

The app now includes a lightweight MongoDB auth layer:

- `POST /api/auth/sign-up` creates a user.
- `POST /api/auth/sign-in` logs in and updates `lastLoginAt`.
- `POST /api/auth/logout` clears the session cookie.
- `GET /api/auth/me` returns the current user.
- `GET /api/profile` reads the profile.
- `PUT /api/profile` updates name, username, email, role, and avatar.
- `DELETE /api/profile` deletes the user plus stored resumes and portfolios.

Rules:

- Email is unique through a MongoDB unique index.
- Username is unique through a MongoDB unique index.
- Role is either `user` or `admin`.
- Passwords are hashed with bcrypt.
- Sessions use an HttpOnly signed cookie.

Saved user assets:

- `GET /api/library/resumes`
- `POST /api/library/resumes`
- `GET /api/library/portfolios`
- `POST /api/library/portfolios`

The profile page at `/dashboard/profile` lets the user update the profile picture, update account data, logout, delete the account, and save snapshots of the current resume or portfolio to MongoDB.

Cloudinary asset layout:

```text
ai-resume-builder/
  users/{userId}/profile/avatar.webp
  users/{userId}/resumes/{resumeId}/pdf/resume.pdf
  users/{userId}/resumes/{resumeId}/assets/qr.png
  users/{userId}/resumes/{resumeId}/preview/preview.png
  users/{userId}/projects/{projectId}/cover.webp
  templates/{templateId}/background.png
  templates/{templateId}/thumbnail.webp
  templates/{templateId}/preview.webp
  admin/
  system/
```

The app creates user/resume folders on demand when uploading profile images or saving resume PDFs. MongoDB stores the Cloudinary `secureUrl` and `publicId` so history can load assets directly.

## Canva Resume Templates

The first visual template is:

```text
public/templates/My-CV.png
```

To add another Canva template:

1. Design an A4 resume in Canva.
2. Export it as PNG.
3. Place the PNG in `public/templates`.
4. Add a template object in `src/templates/resume-template-registry.ts`.
5. Adjust each field's `x`, `y`, `width`, and `height` percentage values.

Coordinates use a 0-100 percentage system. The browser preview uses the percentages directly, and the PDF renderer converts them to A4 points.

The PDF export rule is important:

- The Canva design is used only as a background image.
- User text is rendered as PDF text.
- Email, phone, portfolio, GitHub, LinkedIn, project URLs, and QR links are rendered with `Link` from `@react-pdf/renderer`.
- The export does not use `html2canvas` and does not flatten the whole resume into one screenshot.

## Omni Router

The server-side router lives in:

```text
src/lib/ai/omni-router.ts
src/lib/ai/resume-ai.ts
config/resume-routes.json
```

How it works:

1. `/api/ai/improve` builds a strict resume prompt.
2. Arch Router selects the best route using `LLM_ROUTER_ARCH_BASE_URL` and `LLM_ROUTER_ARCH_MODEL`.
3. The selected route maps to `primary_model` and `fallback_models` in `config/resume-routes.json`.
4. The app calls `https://router.huggingface.co/v1/chat/completions`.
5. If Arch or a model fails, fallback models are tried.
6. If the router cannot complete, the API returns a local mock result so the UI still works.

## Folder Structure

```text
src/
  app/
    api/ai/improve/route.ts
    auth/sign-in/page.tsx
    auth/sign-up/page.tsx
    dashboard/
    onboarding/page.tsx
    u/[username]/page.tsx
    layout.tsx
    page.tsx
  components/
    ai/
    dashboard/
    github/
    layout/
    portfolio/
    resume/
    templates/
    ui/
  hooks/
    use-local-storage.ts
    use-portfolio.ts
    use-resume.ts
  lib/
    ai.ts
    github.ts
    pdf/
    ai/
    qr.ts
    mock-data.ts
    storage.ts
    template-data.ts
    utils.ts
    validation.ts
  templates/
    resume-template-registry.ts
  types/
    index.ts
    template.ts
```

## Future Improvements

- Add real authentication and session persistence.
- Add advanced row management for every resume section.
- Add a visual template calibration UI for dragging overlay fields.
- Add more Canva resume templates and portfolio templates.
- Add payments, custom domains, analytics, and portfolio SEO settings.
- Add full translation coverage for every minor label.

## License

License placeholder. Add your preferred license before publishing.
