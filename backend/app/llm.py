import os
from typing import Literal

import httpx


class LlmError(Exception):
    pass


async def consult_style_with_llm(
    *,
    image_b64: str,
    image_mime: str,
    occasion: str,
    system_prompt: str,
) -> str:
    provider: Literal["openai", "openrouter"] = os.getenv("PROVIDER", "openai").lower()  # type: ignore[assignment]

    if provider not in {"openai", "openrouter"}:
        raise LlmError("Unsupported PROVIDER. Use 'openai' or 'openrouter'.")

    if provider == "openai":
        return await _call_openai(image_b64=image_b64, image_mime=image_mime, occasion=occasion, system_prompt=system_prompt)
    else:
        return await _call_openrouter(image_b64=image_b64, image_mime=image_mime, occasion=occasion, system_prompt=system_prompt)


def _build_messages(system_prompt: str, image_b64: str, image_mime: str, occasion: str):
    # Check if using Claude model (Anthropic format)
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o")
    
    if "claude" in model.lower() or "anthropic" in model.lower():
        # Claude format
        return [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": image_mime,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"Please analyze my photo and provide complete style recommendations for: {occasion}. Include your assessment of my features, seasonal color analysis, and specific clothing/accessory suggestions for this occasion.",
                    },
                ],
            },
        ]
    else:
        # OpenAI format
        return [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Please analyze my photo and provide complete style recommendations for: {occasion}. Include your assessment of my features, seasonal color analysis, and specific clothing/accessory suggestions for this occasion."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image_mime};base64,{image_b64}",
                        },
                    },
                ],
            },
        ]


async def _call_openai(*, image_b64: str, image_mime: str, occasion: str, system_prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise LlmError("Missing OPENAI_API_KEY")

    model = os.getenv("OPENAI_MODEL", "gpt-5.1-mini")
    url = "https://api.openai.com/v1/chat/completions"

    messages = _build_messages(system_prompt, image_b64, image_mime, occasion)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.6,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code >= 400:
            raise LlmError(f"OpenAI error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def _call_openrouter(*, image_b64: str, image_mime: str, occasion: str, system_prompt: str) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise LlmError("Missing OPENROUTER_API_KEY")

    # OpenRouter is OpenAI-compatible for chat completions; select model via env
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-5.1-mini")
    url = "https://openrouter.ai/api/v1/chat/completions"

    messages = _build_messages(system_prompt, image_b64, image_mime, occasion)
    
    print(f"OpenRouter request - Model: {model}")
    print(f"Image mime: {image_mime}")
    print(f"Image data URL prefix: {f'data:{image_mime};base64,{image_b64[:50]}...'}")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # Optional: identify your app
        "HTTP-Referer": os.getenv("APP_URL", "http://localhost"),
        "X-Title": os.getenv("APP_NAME", "VibeFab"),
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.6,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code >= 400:
            raise LlmError(f"OpenRouter error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


