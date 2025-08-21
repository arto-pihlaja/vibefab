import base64
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .llm import consult_style_with_llm


class StyleAdviceResponse(BaseModel):
    advice: str


def load_system_prompt() -> str:
    prompts_path = Path(__file__).resolve().parent.parent / "prompts.txt"
    try:
        return prompts_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return (
            "You are a helpful style consultant. Provide concise, actionable advice."
        )


app = FastAPI(title="VibeFab Backend", version="0.1.0")


# CORS for local frontend dev - relaxed by default (override with env if desired)
cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "*")
if cors_origins_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allowed = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/style/consult", response_model=StyleAdviceResponse)
async def style_consult(
    image: UploadFile = File(...),
    occasion: str = Form(...),
):
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file type")

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image upload")

    encoded = base64.b64encode(raw).decode("utf-8")
    mime = image.content_type

    # Load system prompt once per request (simple for now)
    system_prompt = load_system_prompt()

    try:
        advice = await consult_style_with_llm(
            image_b64=encoded, image_mime=mime, occasion=occasion, system_prompt=system_prompt
        )
        return StyleAdviceResponse(advice=advice)
    except Exception as e:  # noqa: BLE001
        # Fail soft for local development without keys
        provider = os.getenv("PROVIDER", "openai")
        if (
            (provider == "openai" and not os.getenv("OPENAI_API_KEY"))
            or (provider == "openrouter" and not os.getenv("OPENROUTER_API_KEY"))
        ):
            fallback = (
                "Stubbed advice (no API key configured). For '{occ}', consider a clean, "
                "well-fitted outfit in colors that suit your complexion. Keep accessories "
                "tasteful and aligned with the vibe."
            ).format(occ=occasion)
            return StyleAdviceResponse(advice=fallback)

        raise HTTPException(status_code=500, detail=str(e))


# Entry point for `uvicorn backend.app.main:app --reload`

