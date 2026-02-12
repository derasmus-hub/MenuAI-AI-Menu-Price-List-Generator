"""MenuAI — Backend API"""

import json
import io
import re
import base64
from pathlib import Path
from typing import Optional

import qrcode
import stripe
from fastapi import FastAPI, Form, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
import anthropic
import os

load_dotenv()

app = FastAPI(title="MenuAI", version="0.1.0")

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")

# ─── CORS ─────────────────────────────────────────────────
_cors_origins = ["http://localhost:5173", "http://localhost:3000"]
if FRONTEND_URL and FRONTEND_URL not in _cors_origins:
    _cors_origins.append(FRONTEND_URL)
_extra = os.getenv("CORS_ORIGINS", "")
if _extra:
    _cors_origins.extend([o.strip() for o in _extra.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))


# ─── Data Models ────────────────────────────────────────────────

class MenuItem(BaseModel):
    name: str
    description: Optional[str] = None
    price: str

class MenuCategory(BaseModel):
    name: str
    items: list[MenuItem]

class MenuData(BaseModel):
    business_name: str
    business_type: str  # restaurant, salon, barber, etc.
    tagline: Optional[str] = None
    categories: list[MenuCategory]

class ParseRequest(BaseModel):
    text: str
    business_name: Optional[str] = None
    menu_type: str = "price_list"

class GenerateRequest(BaseModel):
    menu: MenuData
    template: str = "clean"

class PublishRequest(BaseModel):
    menu: MenuData
    template: str = "clean"

class PublishResponse(BaseModel):
    slug: str
    url: str

class CheckoutRequest(BaseModel):
    slug: str


# ─── Database ─────────────────────────────────────────────────

from database import save_menu, get_menu_by_slug, list_menus, mark_menu_paid


# ─── AI Menu Parsing ───────────────────────────────────────────

PARSE_PROMPT = """Jesteś ekspertem od tworzenia menu i cenników.
Użytkownik podaje surowy tekst opisujący usługi/produkty i ceny swojej firmy.

Twoim zadaniem jest:
1. Wyodrębnić wszystkie pozycje (nazwa + cena)
2. Pogrupować je w logiczne kategorie
3. Poprawić interpunkcję i formatowanie nazw
4. Dodać krótkie opisy tam, gdzie to pomoże klientowi

Typ menu: {menu_type}
Nazwa firmy: {business_name}

Zwróć TYLKO poprawny JSON (bez markdown, bez komentarzy) w formacie:
{{
  "business_name": "nazwa firmy",
  "business_type": "typ np. restaurant/salon/barber",
  "tagline": "krótkie hasło reklamowe po polsku, max 8 słów",
  "categories": [
    {{
      "name": "Nazwa kategorii",
      "items": [
        {{"name": "Nazwa pozycji", "description": "opcjonalny opis", "price": "50 zł"}},
      ]
    }}
  ]
}}

Tekst użytkownika:
{text}"""


@app.post("/api/parse", response_model=MenuData)
async def parse_menu_text(req: ParseRequest):
    """Parse raw text into structured menu data using Claude."""
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": PARSE_PROMPT.format(
                    text=req.text,
                    business_name=req.business_name or "Moja Firma",
                    menu_type=req.menu_type,
                )
            }]
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]

        data = json.loads(raw)
        return MenuData(**data)

    except json.JSONDecodeError as e:
        raise HTTPException(400, f"AI returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(500, f"Parse failed: {e}")


MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

HEIC_MIME_ALIASES = {"image/heic", "image/heif", "application/octet-stream"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"} | HEIC_MIME_ALIASES


@app.post("/api/parse-photo", response_model=MenuData)
async def parse_menu_photo(
    file: UploadFile = File(...),
    business_name: str = Form("Moja Firma"),
    menu_type: str = Form("price_list"),
):
    """Extract menu items from a photo using Claude Vision."""
    contents = await file.read()

    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(413, "Plik jest za duży. Maksymalny rozmiar to 10MB.")

    media = file.content_type or "image/jpeg"
    if media in HEIC_MIME_ALIASES:
        media = "image/jpeg"
    if media not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
        raise HTTPException(400, f"Nieobsługiwany format obrazu: {media}")

    b64 = base64.b64encode(contents).decode()

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": media, "data": b64},
                    },
                    {
                        "type": "text",
                        "text": PARSE_PROMPT.format(
                            text="[Zdjęcie menu/cennika — wyodrębnij wszystkie pozycje i ceny]",
                            business_name=business_name,
                            menu_type=menu_type,
                        ),
                    },
                ],
            }],
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]

        data = json.loads(raw)
        return MenuData(**data)

    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Nie udało się odczytać menu ze zdjęcia: {e}")
    except anthropic.BadRequestError as e:
        raise HTTPException(400, f"Nie udało się przetworzyć obrazu: {e}")
    except Exception as e:
        raise HTTPException(500, f"Photo parse failed: {e}")


# ─── Menu Preview (HTML) ──────────────────────────────────────

@app.post("/api/preview", response_class=HTMLResponse)
async def preview_menu(req: GenerateRequest):
    """Render menu as HTML using selected template."""
    template_name = f"{req.template}.html"
    try:
        template = jinja_env.get_template(template_name)
    except Exception:
        raise HTTPException(400, f"Template '{req.template}' not found")

    html = template.render(menu=req.menu.model_dump())
    return HTMLResponse(content=html)


# ─── Publish Menu ─────────────────────────────────────────────

@app.post("/api/publish", response_model=PublishResponse)
async def publish_menu(req: PublishRequest):
    """Save menu to database and return a public URL slug."""
    try:
        result = save_menu(req.menu.model_dump(), req.template)
    except Exception as e:
        raise HTTPException(500, f"Nie udało się opublikować menu: {e}")

    url = f"{BASE_URL}/menu/{result['slug']}"
    return PublishResponse(slug=result["slug"], url=url)


@app.get("/menu/{slug}", response_class=HTMLResponse)
async def view_published_menu(slug: str):
    """Serve a published menu as a public HTML page."""
    entry = get_menu_by_slug(slug)
    if not entry:
        raise HTTPException(404, "Menu nie znalezione")

    template_name = f"{entry['template']}.html"
    try:
        template = jinja_env.get_template(template_name)
    except Exception:
        raise HTTPException(500, "Szablon niedostępny")

    html = template.render(menu=entry["menu_data"], is_paid=entry.get("is_paid", False))
    return HTMLResponse(content=html)


@app.get("/api/my-menus")
async def my_menus():
    """List published menus (will be scoped to user with auth later)."""
    try:
        menus = list_menus(limit=50)
    except Exception as e:
        raise HTTPException(500, f"Nie udało się pobrać menu: {e}")
    return menus


# ─── PDF Download ─────────────────────────────────────────────

@app.post("/api/download-pdf")
async def download_pdf(req: GenerateRequest):
    """Generate PDF from menu template. Falls back to print-ready HTML if weasyprint unavailable."""
    template_name = f"{req.template}.html"
    try:
        template = jinja_env.get_template(template_name)
    except Exception:
        raise HTTPException(400, f"Template '{req.template}' not found")

    html = template.render(menu=req.menu.model_dump(), pdf_mode=True)

    # Try WeasyPrint first
    try:
        from weasyprint import HTML as WeasyHTML
        pdf_bytes = WeasyHTML(string=html).write_pdf()
        filename = re.sub(r"[^a-z0-9]+", "-", req.menu.business_name.lower()).strip("-")
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}-menu.pdf"'},
        )
    except Exception:
        # Fallback: return print-optimized HTML that the browser can print to PDF
        filename = re.sub(r"[^a-z0-9]+", "-", req.menu.business_name.lower()).strip("-")
        return HTMLResponse(
            content=html,
            headers={"Content-Disposition": f'attachment; filename="{filename}-menu.html"'},
        )


# ─── QR Code ──────────────────────────────────────────────────

@app.get("/api/qr")
async def generate_qr(url: str):
    """Generate QR code PNG for a given URL."""
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


# ─── Stripe Payment ──────────────────────────────────────────

@app.post("/api/create-checkout")
async def create_checkout(req: CheckoutRequest):
    """Create a Stripe Checkout session for a published menu."""
    entry = get_menu_by_slug(req.slug)
    if not entry:
        raise HTTPException(404, "Menu nie znalezione")

    if entry.get("is_paid"):
        return {"already_paid": True, "url": None}

    if not stripe.api_key or "your-stripe" in stripe.api_key:
        raise HTTPException(503, "Płatności nie są jeszcze skonfigurowane.")

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card", "p24"],
            line_items=[{
                "price": STRIPE_PRICE_ID,
                "quantity": 1,
            }] if STRIPE_PRICE_ID and "your-price" not in STRIPE_PRICE_ID else [{
                "price_data": {
                    "currency": "pln",
                    "product_data": {
                        "name": f"MenuAI Premium — {entry.get('business_name', 'Menu')}",
                        "description": "Menu bez znaku wodnego + PDF",
                    },
                    "unit_amount": 4900,  # 49 zł in grosze
                },
                "quantity": 1,
            }],
            metadata={"menu_slug": req.slug},
            success_url=f"{FRONTEND_URL}/success?slug={req.slug}",
            cancel_url=f"{FRONTEND_URL}/create",
        )
        return {"url": session.url, "already_paid": False}
    except Exception as e:
        raise HTTPException(500, f"Nie udało się utworzyć sesji płatności: {e}")


@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events (checkout.session.completed)."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if STRIPE_WEBHOOK_SECRET and "your-webhook" not in STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        except stripe.SignatureVerificationError:
            raise HTTPException(400, "Nieprawidłowy podpis webhook")
        except Exception as e:
            raise HTTPException(400, f"Webhook error: {e}")
    else:
        event = json.loads(payload)

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        slug = session.get("metadata", {}).get("menu_slug")
        if slug:
            mark_menu_paid(slug)

    return JSONResponse({"received": True})


@app.get("/api/menu-status/{slug}")
async def menu_status(slug: str):
    """Check payment status of a published menu."""
    entry = get_menu_by_slug(slug)
    if not entry:
        raise HTTPException(404, "Menu nie znalezione")
    return {
        "slug": slug,
        "is_paid": entry.get("is_paid", False),
        "business_name": entry.get("business_name", ""),
    }


# ─── Health Check ─────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
