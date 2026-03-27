<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/accadf3d-012c-4037-9b18-c758fba3ddf9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Backend Architecture Note

This app does **not** use a Cloudflare Worker in the active runtime path.

- Frontend data access is through Firebase SDK calls in `services/api.ts`.
- There are no frontend calls to Worker endpoints (`workers.dev`, Wrangler routes, or Worker URLs).
- Deployment should target the frontend hosting tier + Firebase services only.

If any legacy Worker references are reintroduced, `scripts/verify-deploy.sh` now fails the deployment check.

Detailed assessment record: `docs/phase-5-cloudflare-worker-assessment.md`.
