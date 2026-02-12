# MenuAI — AI Menu & Price List Generator
## Product Build Plan (2-Week Sprint)

---

## The Product

**One-liner:** Describe your business → get a beautiful digital menu or price list with QR code in 60 seconds.

**Target customers:**
- Restaurants, cafés, food trucks (menu)
- Hair salons, barber shops (cennik usług)
- Nail studios, beauty salons (cennik)
- Physiotherapy, massage studios (cennik)
- Tattoo studios, pet groomers, car washes — anyone with a service/price list

**Why they'll pay:**
- Currently they use Word/Canva/handwritten menus — looks amateur
- Designers charge 300-1000 zł for a menu design
- Canva takes hours and still looks templated
- This: paste your services → get a polished result in 60 seconds → 49 zł

---

## Revenue Model

| Tier | Price | What they get |
|------|-------|---------------|
| Free | 0 zł | 1 menu, "Made with MenuAI" watermark, basic templates |
| Single | 49 zł one-time | 1 menu, no watermark, QR code, PDF download, hosted page |
| Pro | 29 zł/month | Unlimited menus, all templates, analytics, custom domain |

**Target:** 100 paying users in first 3 months = ~5,000 zł/month

---

## User Flow (Keep It Stupid Simple)

```
Landing Page → "Stwórz menu w 60 sekund"
    ↓
Step 1: Choose type (Restaurant Menu / Price List / Drink Menu)
    ↓
Step 2: Enter business name + paste or type your items & prices
         OR upload a photo of existing menu (AI extracts items)
    ↓
Step 3: AI generates structured menu + suggests categories
         User reviews, edits if needed
    ↓
Step 4: Choose style (Elegant Dark / Clean White / Rustic / Modern / Colorful)
    ↓
Step 5: Preview → Download PDF → Get QR code → Get hosted link
    ↓
Pay 49 zł to remove watermark & unlock downloads
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React (Vite) + Tailwind | Fast, you know it |
| Backend | FastAPI + Python | Your strength |
| Database | PostgreSQL (Supabase free tier) | Free, managed |
| AI | Claude API (Sonnet) | Structures menu data, suggests categories |
| PDF Gen | WeasyPrint or Puppeteer | Beautiful PDF output |
| QR Codes | python-qrcode | Dead simple |
| Hosting | Vercel (frontend) + Railway (backend) | Free/cheap tiers |
| Payments | Stripe or Przelewy24 | P24 better for Polish market |
| Auth | Supabase Auth or simple email magic links | Zero friction |

**Monthly costs at start:** ~$0-20 (free tiers everywhere)
**Claude API cost per menu:** ~$0.01-0.03 (one Sonnet call)

---

## 2-Week Build Plan

### Week 1: Core Product (Mon-Sun)

**Day 1-2: Backend Foundation**
- [ ] FastAPI project setup with Supabase Postgres
- [ ] Data model: businesses, menus, menu_items, payments
- [ ] Claude API integration: "Parse these services into structured JSON"
- [ ] Test: paste messy text → get clean categorized menu data

**Day 3-4: Menu Templates & PDF Generation**
- [ ] 5 HTML/CSS menu templates (restaurant + price list variants)
- [ ] Template engine: inject menu data → render beautiful HTML
- [ ] PDF generation from HTML templates
- [ ] QR code generation pointing to hosted menu page

**Day 5-6: Frontend MVP**
- [ ] Landing page (Polish, compelling, one clear CTA)
- [ ] Menu creation wizard (3-step form)
- [ ] Live preview as user types
- [ ] Template selector with visual previews
- [ ] Download PDF button

**Day 7: Polish & Connect**
- [ ] Connect frontend ↔ backend
- [ ] Hosted menu pages (menuai.pl/twoja-firma)
- [ ] Mobile responsive menus
- [ ] Error handling, loading states

### Week 2: Payment & Launch (Mon-Sun)

**Day 8-9: Payment Integration**
- [ ] Przelewy24 or Stripe integration
- [ ] Payment flow: preview free (watermark) → pay → unlock clean PDF + QR
- [ ] Simple dashboard: "Your menus"

**Day 10-11: Photo Upload Feature**
- [ ] Upload photo of existing menu/cennik
- [ ] Claude Vision extracts items + prices
- [ ] User confirms/edits → generates new design
- [ ] This is the WOW feature that sells it

**Day 12-13: SEO & Marketing Prep**
- [ ] Landing page SEO (target: "generator menu online", "cennik dla salonu")
- [ ] 3 demo menus (restaurant, salon, barber) as examples
- [ ] Facebook post templates for launch
- [ ] Record 60-second demo video (screen recording)

**Day 14: Launch**
- [ ] Deploy production
- [ ] Post in Polish business Facebook groups
- [ ] Post on local Poznań business groups
- [ ] Share demo video on Instagram/TikTok

---

## AI Integration Details

### Prompt 1: Parse Menu Items
```
User input: "Fryzjer męski. Strzyżenie 50zł, broda 30zł, 
strzyżenie + broda 70zł, koloryzacja od 120zł, 
keratynowe prostowanie 200-350zł"

AI returns JSON:
{
  "business_type": "barber",
  "categories": [
    {
      "name": "Strzyżenie",
      "items": [
        {"name": "Strzyżenie męskie", "price": "50 zł"},
        {"name": "Strzyżenie + broda", "price": "70 zł"}
      ]
    },
    {
      "name": "Pielęgnacja",
      "items": [
        {"name": "Modelowanie brody", "price": "30 zł"},
        {"name": "Koloryzacja", "price": "od 120 zł"},
        {"name": "Keratynowe prostowanie", "price": "200–350 zł"}
      ]
    }
  ]
}
```

### Prompt 2: Photo → Menu (the killer feature)
```
User uploads photo of handwritten or printed menu.
Claude Vision extracts all items and prices.
Returns same structured JSON.
User saves hours of typing.
```

---

## 5 Menu Templates (MVP)

1. **"Elegancja"** — Dark background, gold accents, serif fonts. For upscale restaurants.
2. **"Czysty"** — White, minimal, sans-serif. For modern cafés and salons.
3. **"Rustykalny"** — Kraft paper texture, hand-drawn feel. For pizza, burgers, street food.
4. **"Neon"** — Dark with neon color accents. For barber shops, tattoo studios.
5. **"Pastel"** — Soft colors, rounded fonts. For nail studios, beauty salons.

---

## Go-To-Market (Free/Cheap Channels)

### Week 1 after launch:
1. **Facebook groups** — Post in JDG groups, gastro groups, salon owner groups
   - "Zrobiłem narzędzie do tworzenia menu w 60 sekund. Pierwsze menu za darmo."
   - Include before/after: ugly Word menu → beautiful MenuAI result
2. **Local Poznań** — Walk into 10 restaurants/salons, show them on your phone
3. **Instagram Reels / TikTok** — 15-sec transformation videos (photo of messy menu → beautiful result)

### Month 1:
4. **Google Ads** — "menu dla restauracji online", "cennik usług generator" (low competition keywords)
5. **Partner with local gastro/beauty suppliers** — they have email lists
6. **Allegro listing** — Yes, people buy digital products on Allegro

### Viral hooks:
- Free tier with watermark = every menu is an ad for you
- QR code links back to menuai.pl = organic discovery
- "Made with MenuAI" on free menus = social proof

---

## Competitive Advantage

| Competitor | Problem | Your edge |
|-----------|---------|-----------|
| Canva | Takes hours, generic | 60 seconds, AI-powered |
| Graphic designer | 300-1000 zł, days wait | 49 zł, instant |
| Word/Excel | Looks terrible | Professional templates |
| Printed menus | Can't update, expensive reprint | Update anytime, QR code |
| Existing menu apps | English-focused, subscription | Polish-first, one-time pay |

---

## Success Metrics

| Metric | Week 2 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Menus created (free) | 50 | 300 | 1000 |
| Paying customers | 5 | 30 | 100 |
| Revenue | 245 zł | 1,470 zł | 4,900 zł |
| MRR (if Pro subs) | — | 500 zł | 2,000 zł |

---

## Future Features (DON'T build yet)

- [ ] Allergen icons for restaurant menus
- [ ] Multi-language menus (PL/EN/UA) for tourist areas
- [ ] Seasonal menu scheduler
- [ ] Analytics: how many people scanned QR code
- [ ] Integration with food delivery platforms
- [ ] AI food photography suggestions
- [ ] White-label for marketing agencies

---

## Domain Ideas

- menuai.pl ← check availability
- cennik.ai
- twojecennik.pl
- menupro.pl
- szybkiemenu.pl
