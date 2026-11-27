# AI Business Idea Generator

A simple web application that generates business ideas using AI,
with a focus on AI agents and opportunities in the European market.

This is a personal hobby project created to explore full-stack
development, LLM integration, authentication and subscription-based
applications. It is not intended for commercial use.

## Features

- AI-powered business idea generation
- Real-time response streaming
- Markdown-formatted ideas
- Ability to generate new ideas
- Thumbs up and thumbs down for idea evaluation
- Feedback stored locally in the browser
- User authentication and subscription management with Clerk
- Minimalistic dark interface

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, CSS
- **Backend:** Python, FastAPI
- **LLM:** OpenAI API (GPT-5 Nano)
- **Authentication:** Clerk
- **Billing:** Clerk Billing
- **Streaming:** Server-Sent Events (SSE)
- **Deployment:** Vercel

## How to Use

1. Open the application
2. Sign in or create an account using Clerk.
3. Select the Premium subscription using the test payment environment.
4. Wait for the AI to generate a business idea.
5. Evaluate the idea using the thumbs up or thumbs down buttons.
6. Click **Generate again** to receive a new idea.

## Running Locally

Install the frontend dependencies:

    npm install

Configure the environment variables in `.env.local` or `.env`:

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=
    CLERK_JWKS_URL=
    OPENAI_API_KEY=

Install the Python dependencies and start the frontend and FastAPI
backend. Make sure that `/api` is routed to the backend.

To start the Next.js development server:

    npm run dev

Open `http://localhost:3000` in your browser.

## Disclaimer

This project was created for learning and experimentation.
Clerk Billing is used in development mode for testing subscriptions.
AI-generated business ideas are not validated market research.

## Credit
Based on AI Engineer Course by Ed Donner
