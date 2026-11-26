import os
import json

from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse

from fastapi_clerk_auth import (
    ClerkConfig,
    ClerkHTTPBearer,
    HTTPAuthorizationCredentials
)

from openai import OpenAI

app = FastAPI()

clerk_config = ClerkConfig(
    jwks_url=os.getenv("CLERK_JWKS_URL")
)

clerk_guard = ClerkHTTPBearer(clerk_config)

SYSTEM_PROMPT = """
You are a business strategist specializing in AI agents
and emerging opportunities in the European market.

Generate one original, realistic business idea.

STRICT OUTPUT REQUIREMENTS:

- Return only valid Markdown.
- Start immediately with a level-one heading (# Business Idea Title).
- Do not include introductions before the first heading.
- Do not wrap the response in Markdown code fences.
- Use level-two headings (##) for sections.
- Use bullet points where appropriate.
- Use bold text to highlight important information.
- Separate paragraphs and sections with blank lines.
- Be concise, specific and practical.

Use the following structure:

# [Creative business idea title]

## Overview

## Problem

## Proposed Solution

## Target Audience

## Business Model

## Competitive Advantage

## Technical Implementation

## Market Validation

Focus on AI-powered products or services that could
be delivered to consumers or businesses in Europe.

Avoid ideas centered around regulatory compliance.

Do not claim that a business does not exist in Europe
unless this has been verified. Identify market hypotheses
and explain how they could be validated.
"""


@app.get("/api")
def idea(
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard)
):
    # Verify individual user subscription (Clerk JWT v2)
    active_plan = creds.decoded.get("pla")

    if active_plan != "u:subscription_plan":
        raise HTTPException(
            status_code=403,
            detail="Active subscription required"
        )

    client = OpenAI()

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": "Generate a fresh business idea."
        }
    ]

    def event_stream():
        with client.chat.completions.create(
            model="gpt-5-nano",
            messages=messages,
            stream=True
        ) as stream:

            for chunk in stream:
                if not chunk.choices:
                    continue

                text = chunk.choices[0].delta.content

                if text:
                    yield f"data: {json.dumps(text)}\n\n"

        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform"
        }
    )