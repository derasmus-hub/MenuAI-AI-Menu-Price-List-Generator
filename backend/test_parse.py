"""Test script for MenuAI API — parse and preview endpoints."""

import json
import sys
import httpx

API = "http://localhost:8000"

SALON_TEXT = (
    "Salon Fryzjerski Ewa. Strzyżenie damskie 80zł, strzyżenie męskie 50zł, "
    "koloryzacja 150-250zł, balayage 300zł, modelowanie 40zł, "
    "trwała ondulacja 180zł, prostowanie keratynowe 250-400zł, "
    "upięcie okolicznościowe 120zł, strzyżenie dziecięce 35zł"
)

RESTAURANT_TEXT = (
    "Pizzeria Roma. Margherita 28zł, Capricciosa 32zł, Pepperoni 34zł, "
    "Hawajska 30zł, Calzone 36zł. Napoje: Cola 8zł, Sprite 8zł, "
    "Woda mineralna 6zł, Piwo Tyskie 12zł, Kawa espresso 9zł"
)


def test_parse(label: str, text: str, business_name: str, menu_type: str) -> dict:
    """Send text to /api/parse and return structured menu data."""
    print(f"\n{'='*60}")
    print(f"TEST: {label}")
    print(f"{'='*60}")

    resp = httpx.post(
        f"{API}/api/parse",
        json={
            "text": text,
            "business_name": business_name,
            "menu_type": menu_type,
        },
        timeout=30.0,
    )

    if resp.status_code != 200:
        print(f"FAIL — status {resp.status_code}: {resp.text}")
        sys.exit(1)

    data = resp.json()
    print(f"Business: {data['business_name']}")
    print(f"Type:     {data['business_type']}")
    print(f"Tagline:  {data.get('tagline', '—')}")
    print(f"Categories ({len(data['categories'])}):")
    for cat in data["categories"]:
        print(f"  [{cat['name']}]")
        for item in cat["items"]:
            desc = f" — {item['description']}" if item.get("description") else ""
            print(f"    {item['name']}: {item['price']}{desc}")

    assert len(data["categories"]) >= 1, "Expected at least 1 category"
    total_items = sum(len(c["items"]) for c in data["categories"])
    assert total_items >= 3, f"Expected at least 3 items, got {total_items}"
    print(f"\nPASS — {len(data['categories'])} categories, {total_items} items")
    return data


def test_preview(menu_data: dict, template: str, output_file: str) -> None:
    """Send menu data to /api/preview and save the HTML output."""
    print(f"\n{'='*60}")
    print(f"TEST: Preview with template='{template}'")
    print(f"{'='*60}")

    resp = httpx.post(
        f"{API}/api/preview",
        json={
            "menu": menu_data,
            "template": template,
        },
        timeout=15.0,
    )

    if resp.status_code != 200:
        print(f"FAIL — status {resp.status_code}: {resp.text}")
        sys.exit(1)

    html = resp.text
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"HTML preview saved to: {output_file}")
    print(f"Size: {len(html)} bytes")
    assert "<html" in html.lower(), "Expected HTML content"
    assert menu_data["business_name"] in html, "Business name missing from preview"
    print("PASS — HTML preview looks correct")


SAMPLE_MENU = {
    "business_name": "Salon Fryzjerski Ewa",
    "business_type": "salon",
    "tagline": "Piękne fryzury na każdą okazję",
    "categories": [
        {
            "name": "Strzyżenie",
            "items": [
                {"name": "Strzyżenie damskie", "description": "Mycie, strzyżenie, modelowanie", "price": "80 zł"},
                {"name": "Strzyżenie męskie", "description": None, "price": "50 zł"},
                {"name": "Strzyżenie dziecięce", "description": "Do 12 lat", "price": "35 zł"},
            ],
        },
        {
            "name": "Koloryzacja",
            "items": [
                {"name": "Koloryzacja", "description": "Cena zależna od długości włosów", "price": "150–250 zł"},
                {"name": "Balayage", "description": "Naturalne refleksy", "price": "300 zł"},
            ],
        },
        {
            "name": "Stylizacja",
            "items": [
                {"name": "Modelowanie", "description": None, "price": "40 zł"},
                {"name": "Trwała ondulacja", "description": None, "price": "180 zł"},
                {"name": "Prostowanie keratynowe", "description": None, "price": "250–400 zł"},
                {"name": "Upięcie okolicznościowe", "description": None, "price": "120 zł"},
            ],
        },
    ],
}

SAMPLE_RESTAURANT = {
    "business_name": "Pizzeria Roma",
    "business_type": "restaurant",
    "tagline": "Prawdziwa pizza z pieca",
    "categories": [
        {
            "name": "Pizza",
            "items": [
                {"name": "Margherita", "description": "Sos pomidorowy, mozzarella, bazylia", "price": "28 zł"},
                {"name": "Capricciosa", "description": "Szynka, pieczarki, oliwki", "price": "32 zł"},
                {"name": "Pepperoni", "description": "Pikantne salami pepperoni", "price": "34 zł"},
                {"name": "Hawajska", "description": "Szynka, ananas", "price": "30 zł"},
                {"name": "Calzone", "description": "Pizza zamknięta z nadzieniem", "price": "36 zł"},
            ],
        },
        {
            "name": "Napoje",
            "items": [
                {"name": "Cola", "description": None, "price": "8 zł"},
                {"name": "Sprite", "description": None, "price": "8 zł"},
                {"name": "Woda mineralna", "description": None, "price": "6 zł"},
                {"name": "Piwo Tyskie", "description": None, "price": "12 zł"},
                {"name": "Kawa espresso", "description": None, "price": "9 zł"},
            ],
        },
    ],
}


def main():
    # Check server is reachable
    try:
        health = httpx.get(f"{API}/api/health", timeout=5.0)
        print(f"Server health: {health.json()}")
    except httpx.ConnectError:
        print(f"ERROR: Cannot connect to {API}. Is the server running?")
        print("Start it with: cd backend && source venv/bin/activate && uvicorn main:app --reload")
        sys.exit(1)

    # --- Template preview tests (no API key needed) ---
    templates = ["clean", "elegant", "neon", "rustic", "pastel"]

    test_preview(SAMPLE_MENU, template="clean", output_file="test_output.html")
    for tmpl in templates:
        data = SAMPLE_RESTAURANT if tmpl in ("elegant", "rustic") else SAMPLE_MENU
        test_preview(data, template=tmpl, output_file=f"test_output_{tmpl}.html")

    # --- AI parse tests (require ANTHROPIC_API_KEY) ---
    print(f"\n{'='*60}")
    print("AI PARSE TESTS (require valid ANTHROPIC_API_KEY in .env)")
    print(f"{'='*60}")

    try:
        salon_data = test_parse(
            label="Parse salon (price list)",
            text=SALON_TEXT,
            business_name="Salon Fryzjerski Ewa",
            menu_type="price_list",
        )

        restaurant_data = test_parse(
            label="Parse restaurant menu",
            text=RESTAURANT_TEXT,
            business_name="Pizzeria Roma",
            menu_type="restaurant_menu",
        )

        # Preview with AI-parsed data
        test_preview(salon_data, template="clean", output_file="test_output_ai_salon.html")
        test_preview(restaurant_data, template="elegant", output_file="test_output_ai_restaurant.html")

        print(f"\n{'='*60}")
        print("FULL JSON — Salon")
        print(f"{'='*60}")
        print(json.dumps(salon_data, indent=2, ensure_ascii=False))

        print(f"\n{'='*60}")
        print("FULL JSON — Restaurant")
        print(f"{'='*60}")
        print(json.dumps(restaurant_data, indent=2, ensure_ascii=False))

    except SystemExit:
        print("\nSKIPPED — AI parse tests failed (likely missing API key).")
        print("Set ANTHROPIC_API_KEY in backend/.env and re-run.")

    print(f"\n{'='*60}")
    print("DONE — Template tests passed. Check test_output_*.html files.")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
