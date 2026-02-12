"""Supabase database client for MenuAI."""

import os
import json
import re
import string
import random
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# ─── Supabase client (lazy init) ─────────────────────────────

_supabase = None


def _is_configured() -> bool:
    """Check if Supabase credentials are real (not placeholder)."""
    return (
        bool(SUPABASE_URL)
        and bool(SUPABASE_KEY)
        and "your-project" not in SUPABASE_URL
        and "your-anon-key" not in SUPABASE_KEY
    )


def get_supabase():
    """Return the Supabase client, or None if not configured."""
    global _supabase
    if not _is_configured():
        return None
    if _supabase is None:
        from supabase import create_client
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase


# ─── Slug generation ─────────────────────────────────────────

def make_slug(name: str) -> str:
    """Turn 'Salon Ewa' into 'salon-ewa-x7km'."""
    clean = re.sub(r"[^a-z0-9]+", "-", name.lower().strip())
    clean = clean.strip("-")[:30]
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{clean}-{suffix}"


# ─── In-memory fallback (dev without Supabase) ───────────────

_memory_store: dict[str, dict] = {}


# ─── Menu CRUD ───────────────────────────────────────────────

def save_menu(menu_data: dict, template: str) -> dict:
    """
    Save a published menu. Returns {"slug": ..., "id": ...}.
    Uses Supabase if configured, otherwise in-memory.
    """
    slug = make_slug(menu_data.get("business_name", "menu"))
    sb = get_supabase()

    if sb is not None:
        row = {
            "slug": slug,
            "business_name": menu_data.get("business_name", ""),
            "business_type": menu_data.get("business_type", ""),
            "template": template,
            "menu_data": menu_data,
            "is_paid": False,
        }
        result = sb.table("menus").insert(row).execute()
        record = result.data[0]
        return {"slug": record["slug"], "id": record["id"]}
    else:
        _memory_store[slug] = {
            "slug": slug,
            "business_name": menu_data.get("business_name", ""),
            "business_type": menu_data.get("business_type", ""),
            "template": template,
            "menu_data": menu_data,
            "is_paid": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        return {"slug": slug, "id": slug}


def get_menu_by_slug(slug: str) -> dict | None:
    """
    Fetch a published menu by slug.
    Returns {"menu_data": ..., "template": ..., "is_paid": ..., ...} or None.
    """
    sb = get_supabase()

    if sb is not None:
        result = (
            sb.table("menus")
            .select("*")
            .eq("slug", slug)
            .limit(1)
            .execute()
        )
        if result.data:
            return result.data[0]
        return None
    else:
        return _memory_store.get(slug)


def mark_menu_paid(slug: str) -> bool:
    """
    Set is_paid=True for a menu by slug.
    Returns True if found and updated, False otherwise.
    """
    sb = get_supabase()

    if sb is not None:
        result = (
            sb.table("menus")
            .update({"is_paid": True})
            .eq("slug", slug)
            .execute()
        )
        return len(result.data) > 0
    else:
        if slug in _memory_store:
            _memory_store[slug]["is_paid"] = True
            return True
        return False


def list_menus(limit: int = 50) -> list[dict]:
    """
    List recent menus. Returns list of menu summary dicts.
    """
    sb = get_supabase()

    if sb is not None:
        result = (
            sb.table("menus")
            .select("id, slug, business_name, business_type, template, is_paid, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data
    else:
        items = sorted(
            _memory_store.values(),
            key=lambda x: x.get("created_at", ""),
            reverse=True,
        )[:limit]
        return [
            {
                "id": m.get("slug"),
                "slug": m["slug"],
                "business_name": m["business_name"],
                "business_type": m["business_type"],
                "template": m["template"],
                "is_paid": m.get("is_paid", False),
                "created_at": m.get("created_at"),
            }
            for m in items
        ]
