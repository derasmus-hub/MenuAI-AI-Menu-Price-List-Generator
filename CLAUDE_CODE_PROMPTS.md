# Claude Code Prompts — Day-by-Day Build Guide

## ⚠️ IMPORTANT — READ THIS FIRST

**Project directory:** `C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator`

**Rule for every prompt:** Always work in and save all files to this directory. Never create files outside it. After every change, verify the file structure is correct and all files are saved.

**Start every Claude Code session with:**
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Before doing anything, read the project structure:
ls -la /mnt/c/Users/erasm/OneDrive/Documents/MenuAI-AI-Menu-Price-List-Generator/
cat /mnt/c/Users/erasm/OneDrive/Documents/MenuAI-AI-Menu-Price-List-Generator/README.md

Then continue with the task below.
```

---

## DAY 1 — Project Setup + Backend + AI Parsing

### Prompt 1: Initialize the full project
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Initialize the MenuAI project. Create the following directory structure:

MenuAI-AI-Menu-Price-List-Generator/
├── backend/
│   ├── main.py              (FastAPI app)
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                 (copy from .env.example, user fills in API key)
├── frontend/                (React + Vite — will be created in Day 2)
├── templates/
│   ├── clean.html
│   └── elegant.html
├── README.md
├── BUILD_PLAN.md
├── .gitignore
└── CLAUDE_CODE_PROMPTS.md

Steps:
1. Create all directories if they don't exist
2. Verify all files are in place
3. Set up Python venv in backend/:
   cd backend
   python -m venv venv
   venv\Scripts\activate   (Windows)
   pip install -r requirements.txt
4. Copy .env.example to .env
5. Run: uvicorn main:app --reload
6. Test http://localhost:8000/api/health returns {"status": "ok"}
7. Print the full directory tree when done

All files must be saved to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator
```

### Prompt 2: Test AI menu parsing
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

The backend should be running at http://localhost:8000.

Create a test script at backend/test_parse.py that:

1. Sends POST /api/parse with this Polish salon text:
   "Salon Fryzjerski Ewa. Strzyżenie damskie 80zł, strzyżenie męskie 50zł, 
   koloryzacja 150-250zł, balayage 300zł, modelowanie 40zł, 
   trwała ondulacja 180zł, prostowanie keratynowe 250-400zł, 
   upięcie okolicznościowe 120zł, strzyżenie dziecięce 35zł"

2. Sends POST /api/parse with this restaurant text:
   "Pizzeria Roma. Margherita 28zł, Capricciosa 32zł, Pepperoni 34zł, 
   Hawajska 30zł, Calzone 36zł. Napoje: Cola 8zł, Sprite 8zł, 
   Woda mineralna 6zł, Piwo Tyskie 12zł, Kawa espresso 9zł"

3. Sends POST /api/preview with the parsed data and template="clean"
4. Saves the HTML preview to backend/test_output.html
5. Prints the structured JSON and confirms categories were created

Run the test and fix any issues.
Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\backend\
```

### Prompt 3: Create remaining templates
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Create 3 more menu templates in the templates/ directory. Use the same Jinja2 variable structure as clean.html and elegant.html (menu.business_name, menu.tagline, menu.categories, items with name/description/price).

1. templates/neon.html — For barber shops and tattoo studios
   - Background: near-black (#0d0d0d)
   - Accent: electric cyan (#00e5ff) 
   - Fonts: 'Bebas Neue' for headings, 'Barlow' for body (Google Fonts)
   - text-shadow glow effects on category names
   - Edgy, urban, modern feel
   - Subtle gradient border on the container

2. templates/rustic.html — For pizza places, burger joints, food trucks
   - Background: warm cream (#f5f0e8) with subtle paper texture (CSS pattern)
   - Accent: warm brown (#8B4513)
   - Fonts: 'Caveat' for headings (handwritten feel), 'Source Sans 3' for body
   - Dashed borders between items
   - Casual, friendly, homemade feel

3. templates/pastel.html — For nail studios, beauty salons, spas
   - Background: soft lavender (#f8f5ff) 
   - Accent: muted rose (#d4a0a0)
   - Fonts: 'Quicksand' for headings, 'Poppins' for body
   - Rounded corners on everything
   - Soft shadows, airy spacing
   - Feminine, clean, welcoming feel

Test each template by rendering it with sample data. Verify they all work with the /api/preview endpoint.

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\templates\
```

---

## DAY 2 — Frontend Wizard

### Prompt 4: Scaffold React frontend
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\frontend

Create a React + Vite + Tailwind frontend:

1. Initialize: npm create vite@latest . -- --template react
2. Install dependencies: npm install
3. Install Tailwind: npm install -D tailwindcss @tailwindcss/vite
4. Configure Tailwind with Vite plugin

5. Create the app structure:
   src/
   ├── App.jsx              (main router)
   ├── main.jsx             (entry point)
   ├── index.css            (Tailwind imports)
   ├── components/
   │   ├── MenuWizard.jsx   (3-step wizard container)
   │   ├── StepType.jsx     (Step 1: choose menu type)
   │   ├── StepContent.jsx  (Step 2: enter text or upload photo)
   │   ├── StepStyle.jsx    (Step 3: choose template + preview)
   │   └── MenuPreview.jsx  (live preview iframe)
   └── api/
       └── client.js        (fetch wrapper for backend calls)

6. api/client.js should have:
   - const API = "http://localhost:8000"
   - parseText(text, businessName, menuType) → POST /api/parse
   - parsePhoto(file, businessName, menuType) → POST /api/parse-photo
   - getPreview(menuData, template) → POST /api/preview (returns HTML)
   - downloadPdf(menuData, template) → POST /api/download-pdf (triggers download)
   - getQrCode(url) → GET /api/qr?url=...

7. MenuWizard.jsx:
   - State: currentStep (1-3), menuType, businessName, rawText, menuData, template
   - Progress bar at top showing steps
   - Back/Next navigation
   - Polish language throughout

8. StepType.jsx — "Co tworzysz?"
   - 3 clickable cards in a row:
     🍕 Menu Restauracji | ✂️ Cennik Usług | 🍸 Karta Drinków
   - Clicking a card sets menuType and advances to step 2

9. StepContent.jsx — "Opisz swoją ofertę"
   - Input: "Nazwa firmy" 
   - Large textarea: "Wklej lub wpisz swoje usługi i ceny..."
   - Placeholder text showing example format
   - OR: drag-and-drop zone "Przeciągnij zdjęcie menu"
   - Big button: "✨ Generuj menu" → calls parseText or parsePhoto
   - Loading state: spinner + "AI analizuje Twoje menu..."

10. StepStyle.jsx — "Wybierz styl i pobierz"
    - Row of 5 template thumbnails (clean, elegant, neon, rustic, pastel)
    - Clicking a template loads preview
    - Preview panel showing rendered HTML in an iframe
    - Buttons: "Pobierz PDF" | "Pobierz kod QR" | "Edytuj dane"

Design: 
- Dark navy sidebar/header (#0f172a)
- White content area
- Accent color: emerald green (#10b981)
- Clean, modern, trustworthy
- Mobile responsive
- Polish language everywhere

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\frontend\
```

---

## DAY 3 — Photo Upload + PDF + QR Code

### Prompt 5: Photo upload with drag-and-drop
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Make the photo upload feature work end-to-end:

1. In StepContent.jsx, create a drag-and-drop upload zone:
   - Dashed border area with icon and text "Przeciągnij zdjęcie cennika lub kliknij aby wybrać"
   - Accepts: JPG, PNG, WEBP, HEIC
   - Max file size: 10MB
   - Shows image thumbnail after selection
   - Click to select file (hidden input)

2. When user uploads a photo:
   - Show loading: "AI odczytuje Twoje menu ze zdjęcia..." with spinner
   - Call POST /api/parse-photo with FormData
   - On success: populate the text area with the parsed items (editable)
   - Store the structured menuData in state
   - Auto-advance to Step 3

3. In the backend (main.py), verify the parse-photo endpoint:
   - Handles multipart/form-data correctly
   - Sends image to Claude Vision with the Polish parsing prompt
   - Returns structured MenuData JSON
   - Test with a real photo of a Polish menu/cennik

4. Error handling:
   - File too large → "Plik jest za duży. Maksymalny rozmiar to 10MB."
   - AI can't parse → "Nie udało się odczytać menu. Spróbuj wpisać ręcznie."
   - Network error → "Błąd połączenia. Sprawdź czy serwer działa."

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\
```

### Prompt 6: PDF download and QR code working
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Make PDF download and QR codes work end-to-end:

1. Backend — Hosted menu pages:
   - Add a dict-based in-memory store: published_menus = {}
   - POST /api/publish → saves menu data + template, returns a unique slug
   - GET /menu/{slug} → renders the menu HTML publicly (no watermark for paid, watermark for free)
   - The slug should be URL-friendly: business-name-random4chars (e.g., "salon-ewa-x7km")

2. Backend — PDF download:
   - POST /api/download-pdf already exists but test it works
   - If weasyprint has issues on Windows, fallback to returning the HTML with a print-optimized stylesheet
   - The PDF should look identical to the HTML preview

3. Backend — QR code:
   - GET /api/qr?url=... already exists
   - The QR should point to the public menu URL: http://localhost:8000/menu/{slug}
   - (Later in production this becomes https://menuai.pl/menu/{slug})

4. Frontend — StepStyle.jsx:
   - "Pobierz PDF" button → calls /api/download-pdf, triggers browser download
   - "Kod QR" button → first calls /api/publish to get the slug, then shows QR code image
   - "Kopiuj link" button → copies the public menu URL to clipboard
   - Show success toast: "Menu opublikowane! Link skopiowany."

5. Test the full flow:
   - Enter menu text → generate → choose template → download PDF → get QR → scan QR on phone → see menu

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\
```

---

## DAY 4 — Menu Editor + Polish UX

### Prompt 7: Inline menu editor
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Add an inline menu editor so users can modify AI-generated results:

1. Create frontend/src/components/MenuEditor.jsx:
   - Shows all categories and items in an editable form
   - Each category: editable name + "Dodaj pozycję" button + delete button
   - Each item: editable name, description (optional), price + delete button
   - "Dodaj kategorię" button at the bottom
   - Drag-and-drop reordering of categories and items (use @dnd-kit/sortable)
   - Business name and tagline are editable at the top

2. The editor appears between Step 2 and Step 3:
   - After AI parses the text/photo, show the editor
   - User reviews and can modify anything
   - "Wygląda dobrze →" button advances to Step 3 (template selection)

3. Changes in the editor update menuData state in real-time
4. The preview in Step 3 always reflects the latest edited data

5. Install: npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

Polish labels:
- "Nazwa kategorii" / "Nazwa pozycji" / "Opis (opcjonalnie)" / "Cena"
- "Dodaj kategorię" / "Dodaj pozycję" / "Usuń"

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\frontend\
```

---

## DAY 5 — Landing Page

### Prompt 8: Polish landing page
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\frontend

Create a Polish landing page at the root route (/). The wizard should be at /create.

1. src/pages/LandingPage.jsx:

HERO SECTION:
- Headline: "Profesjonalne menu w 60 sekund"
- Subheadline: "Wklej tekst lub zrób zdjęcie swojego cennika. AI stworzy piękne menu z kodem QR."
- CTA button: "Stwórz menu za darmo →" (links to /create)
- Right side: animated mockup showing a menu being generated

HOW IT WORKS:
- 3 steps with icons:
  1. "Wpisz lub sfotografuj" — Wklej swoje usługi i ceny, lub zrób zdjęcie istniejącego cennika
  2. "AI tworzy menu" — Sztuczna inteligencja organizuje i formatuje Twoje menu
  3. "Pobierz i udostępnij" — Pobierz PDF, wydrukuj lub udostępnij kod QR klientom

EXAMPLES:
- 3 example menus side by side (static screenshots or rendered HTML):
  - "Pizzeria Roma" (restaurant, elegant template)
  - "Salon Fryzjerski Ewa" (salon, clean template)  
  - "Barber King" (barber, neon template)

PRICING:
- 3 cards:
  - Darmowy: 1 menu, znak wodny, podstawowe szablony → "Zacznij za darmo"
  - Pojedynczy (49 zł): Bez znaku wodnego, PDF, QR kod, strona online → "Kup teraz"
  - Pro (29 zł/mies.): Bez limitu, wszystkie szablony, analityka → "Subskrybuj"

FAQ (accordion):
  - Czy mogę edytować menu po stworzeniu?
  - Jak działa kod QR?
  - Czy mogę zmienić szablon później?
  - Jak wygląda zdjęcie cennika, które mogę przesłać?
  - Czy to działa na telefonie?

FOOTER:
- MenuAI © 2026 | Kontakt | Regulamin | Polityka prywatności

Design: Modern, trustworthy, green accents (#10b981). 
Use smooth scroll animations (CSS only, no heavy libraries).
Mobile responsive — this is critical, most users will find it on phone.

2. Set up routing in App.jsx:
   - / → LandingPage
   - /create → MenuWizard
   - /menu/:slug → public menu view (later)

Install react-router-dom if not already installed.

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\frontend\
```

---

## DAY 6-7 — Payment + Database + Deploy

### Prompt 9: Supabase database
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Replace in-memory storage with Supabase:

1. Create backend/database.py with Supabase client setup

2. Database tables (create these in Supabase dashboard):

   menus:
   - id: uuid (primary key, auto-generated)
   - slug: text (unique, URL-friendly)
   - business_name: text
   - business_type: text
   - template: text
   - menu_data: jsonb (full MenuData JSON)
   - is_paid: boolean (default false)
   - created_at: timestamptz
   - updated_at: timestamptz

   payments:
   - id: uuid (primary key)
   - menu_id: uuid (foreign key → menus)
   - amount: integer (in grosze, e.g., 4900 = 49 zł)
   - status: text (pending/completed/failed)
   - provider_id: text (Stripe/P24 transaction ID)
   - created_at: timestamptz

3. Update main.py:
   - POST /api/publish → saves to Supabase menus table, returns slug
   - GET /menu/{slug} → fetches from Supabase and renders
   - GET /api/my-menus → list user's menus (later, with auth)

4. Add slug generation: slugify(business_name) + "-" + random 4 chars

5. Test: create menu → publish → fetch by slug → renders correctly

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\backend\
```

### Prompt 10: Payment with Stripe
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Add Stripe payment for the 49 zł single menu purchase:

1. Install: pip install stripe

2. Add to .env:
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID=price_...  (create a 49 zł product in Stripe dashboard)

3. Backend endpoints:
   - POST /api/create-checkout → creates Stripe Checkout session, returns URL
     - success_url: http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}
     - cancel_url: http://localhost:5173/create
     - metadata: { menu_slug: "..." }
   - POST /api/webhook/stripe → handles checkout.session.completed
     - Updates menu.is_paid = true
     - Removes watermark from published menu

4. Frontend:
   - In StepStyle.jsx, "Pobierz PDF (bez znaku wodnego)" button:
     - If not paid → redirect to Stripe Checkout
     - If paid → direct PDF download without watermark
   - Create frontend/src/pages/SuccessPage.jsx:
     - "Dziękujemy za zakup! 🎉"
     - Show download buttons for PDF and QR
     - Link to the published menu page

5. Free tier still works without payment — just has watermark

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\
```

### Prompt 11: Deploy to production
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

Prepare for deployment:

1. Backend — Deploy to Railway or Render:
   - Create backend/Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT
   - Create backend/runtime.txt: python-3.12
   - Update CORS in main.py to include production domain
   - Set environment variables in Railway dashboard

2. Frontend — Deploy to Vercel:
   - Create frontend/vercel.json with rewrites for SPA routing
   - Update api/client.js: const API = import.meta.env.VITE_API_URL || "http://localhost:8000"
   - Create frontend/.env.production: VITE_API_URL=https://your-backend.railway.app

3. Domain setup:
   - Point menuai.pl (or chosen domain) to Vercel
   - Point api.menuai.pl to Railway backend
   - Update all URLs

4. Create a production checklist:
   - [ ] ANTHROPIC_API_KEY set in Railway
   - [ ] SUPABASE_URL + KEY set in Railway
   - [ ] STRIPE keys set (switch to live mode)
   - [ ] CORS updated for production domain
   - [ ] QR codes point to production URL
   - [ ] Watermark logic works (free vs paid)
   - [ ] PDF generation works on Linux (Railway)
   - [ ] Test full flow: create → preview → pay → download

Save all files to: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\
```

---

## ONGOING — Bug Fixes & Features

### Template for any bug fix or feature:
```
Working directory: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator

[Describe the bug or feature here]

After making changes:
1. Save all modified files to the project directory
2. Verify the project structure is intact
3. Test the change works
4. Update README.md if any setup steps changed

All files must be in: C:\Users\erasm\OneDrive\Documents\MenuAI-AI-Menu-Price-List-Generator\
```
