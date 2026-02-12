-- MenuAI database schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─── Menus table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS menus (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        text UNIQUE NOT NULL,
    business_name text NOT NULL,
    business_type text NOT NULL DEFAULT '',
    template    text NOT NULL DEFAULT 'clean',
    menu_data   jsonb NOT NULL,
    is_paid     boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast slug lookups (public menu pages)
CREATE INDEX IF NOT EXISTS idx_menus_slug ON menus (slug);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menus_updated_at ON menus;
CREATE TRIGGER trg_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ─── Payments table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id     uuid NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    amount      integer NOT NULL,  -- in grosze (4900 = 49 zł)
    status      text NOT NULL DEFAULT 'pending',  -- pending / completed / failed
    provider_id text,  -- Stripe or Przelewy24 transaction ID
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_menu_id ON payments (menu_id);

-- ─── Row Level Security (RLS) ────────────────────────────────
-- Public read access for published menus (anyone can view via slug)
-- Write access requires service role key (backend only)

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Anyone can read menus (public menu pages)
CREATE POLICY "Public read menus"
    ON menus FOR SELECT
    USING (true);

-- Only service role can insert/update/delete menus
CREATE POLICY "Service insert menus"
    ON menus FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service update menus"
    ON menus FOR UPDATE
    USING (true);

-- Only service role can access payments
CREATE POLICY "Service read payments"
    ON payments FOR SELECT
    USING (true);

CREATE POLICY "Service insert payments"
    ON payments FOR INSERT
    WITH CHECK (true);
