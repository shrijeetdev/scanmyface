# scanmyface

**GlowXLab's skin analysis prototype.** A guided face scan, a readable skin report and a daily routine builder, built with Next.js and Supabase.

[Live demo](https://scanmyface.vercel.app) · [Report a security issue](./SECURITY.md)

> **Status: prototype.** The scan flow, report UI, routine builder and habit tracking are real. The analysis engine in `lib/aiEngine.js` is currently a deterministic simulation (the same image always gives the same result) so the full product loop can be tested end to end. Swapping in a real vision model is the next milestone.

## What it does

- **Guided 3-angle scan:** front, left and right captures through the camera, with on-screen prompts (`components/scan/FaceScan360.jsx`)
- **Face check before analysis:** a fast client-side skin-tone and framing heuristic (`lib/faceValidator.js`)
- **Skin report:** issues with severity, likely root causes from lifestyle inputs (sleep, water, stress and more), and an improvement plan
- **Routine builder:** ingredients matched to each issue, with product suggestions (`data/`)
- **Habit tracking and dashboard:** progress over time for signed-in users
- **PDF export:** download the report (`lib/pdfExport.js`)

## Stack

Next.js 16 · React 19 · Supabase (auth + Postgres with row-level security) · Framer Motion · Recharts · jsPDF · Vercel

## Run it locally

```bash
npm install
npm run dev
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Create the tables and policies by running `supabase/schema.sql` in the Supabase SQL editor. Every table has row-level security on, and users can only read and write their own rows.

## Privacy

Face images are personal data. Guest scans are not saved. Signed-in users' scans are saved to their own account so progress can be tracked over time.

## Roadmap

- [ ] Real vision model for issue detection
- [ ] Stricter image storage and consent controls
- [ ] Before and after comparison across scans
- [ ] Android and iOS apps

## Author

Built by [Shrijeet Singh](https://github.com/shrijeetdev), co-founder and CTO of [Vexocore](https://vexocore.io).
