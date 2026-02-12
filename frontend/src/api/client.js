export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function parseText(text, businessName, menuType) {
  let res;
  try {
    res = await fetch(`${API}/api/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, business_name: businessName, menu_type: menuType }),
    });
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) {
    throw new Error("Nie udało się przeanalizować tekstu. Spróbuj ponownie.");
  }
  return res.json();
}

export async function parsePhoto(file, businessName, menuType) {
  const form = new FormData();
  form.append("file", file);
  form.append("business_name", businessName || "Moja Firma");
  form.append("menu_type", menuType || "price_list");

  let res;
  try {
    res = await fetch(`${API}/api/parse-photo`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (res.status === 400) {
    throw new Error("Nie udało się odczytać menu. Spróbuj wpisać ręcznie.");
  }
  if (!res.ok) {
    throw new Error("Nie udało się odczytać menu. Spróbuj wpisać ręcznie.");
  }
  return res.json();
}

export async function getPreview(menuData, template) {
  let res;
  try {
    res = await fetch(`${API}/api/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu: menuData, template }),
    });
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);
  return res.text();
}

export async function downloadPdf(menuData, template) {
  let res;
  try {
    res = await fetch(`${API}/api/download-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu: menuData, template }),
    });
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);

  const contentType = res.headers.get("content-type") || "";
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // Use .pdf or .html depending on what the server returned
  a.download = contentType.includes("pdf") ? "menu.pdf" : "menu.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function publishMenu(menuData, template) {
  let res;
  try {
    res = await fetch(`${API}/api/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu: menuData, template }),
    });
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);
  return res.json(); // { slug, url }
}

export async function getQrCode(url) {
  let res;
  try {
    res = await fetch(`${API}/api/qr?url=${encodeURIComponent(url)}`);
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function createCheckout(slug) {
  let res;
  try {
    res = await fetch(`${API}/api/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Błąd serwera: ${res.status}`);
  }
  return res.json(); // { url, already_paid }
}

export async function getMenuStatus(slug) {
  let res;
  try {
    res = await fetch(`${API}/api/menu-status/${encodeURIComponent(slug)}`);
  } catch {
    throw new Error("Błąd połączenia. Sprawdź czy serwer działa.");
  }
  if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);
  return res.json(); // { slug, is_paid, business_name }
}
