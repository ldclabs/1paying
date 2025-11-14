# 1Pay.ing Web App

https://1Pay.ing is the x402 payment wallet for instant micropayments, human‑readable signing, and trusted checkout flows across the emerging “paid web”.

This repository contains the public marketing site and web app shell for the 1Pay.ing wallet and developer experience.

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, custom animations
- **Web3 / Protocols:**
  - `@ldclabs/1paying-kit` – x402 payment integration SDK
  - Solana stack: `@solana/web3.js`, `@solana/kit`, `@solana/spl-token`, `@solana-program/*`
  - Internet Computer (IC) tooling: `@dfinity/*`, `@ldclabs/ic-auth`
- **Tooling:** ESLint, Prettier, Vitest, Svelte Check

> Note: This repo focuses on the web experience and integration surfaces. The core SDK lives in [`ldclabs/1paying-kit`](https://github.com/ldclabs/1paying-kit).

## Project Structure (Overview)

Key paths:

- app.html – HTML shell and SEO metadata (title, OG tags, Twitter card, canonical links).
- +page.svelte – Marketing landing page (hero, benefits, developer section, tokenomics, contact).
- +page.svelte – App entry route for the actual wallet experience.
- `src/lib/components/*` – Shared UI components (header, wallet modals, payment UI, etc.).
- `src/lib/animations/*` – Motion and background animation utilities (e.g. neural grid, parallax).
- `src/lib/canisters/*` – IC‑related actor and authentication helpers.
- static – Static assets (tokenomics pages, images, fonts, `token.json`).

The root build directory contains a prebuilt static export that can be served as-is by a static host or CDN.

## Tokenomics & PAY

The landing page includes a detailed “Tokenomics” section describing:

- **PAY** as the coordination token of the 1Pay.ing ecosystem.
- Token allocation across:
  - Ecosystem & community rewards
  - Public sale & liquidity
  - Core team & contributors
  - Strategic partners & advisors
  - Treasury / foundation
- Utility pillars:
  - **B2D:** Integrate‑to‑Earn, staking for premium services.
  - **B2C:** Pay‑to‑Earn rebates, stake‑to‑earn yield.
  - **Shared:** Governance via vePAY and tiered privileges.

On‑chain reference (Solana):

- `PAY` token: `PAYiNGqaLFRdBomkQY3JXZeCm7wzK7hKuhrJDzcZBWN`

## Contributing

Contributions are welcome via pull requests and issues.

- Report bugs and feature ideas through GitHub Issues.
- For changes, please:
  - Keep the Svelte/Tailwind style consistent.
  - Run `pnpm check`, `pnpm test`, and `pnpm format` before opening a PR.

## License

This project is released under the MIT License. See LICENSE for details.
