import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const countryName = String(body?.countryName || "").trim();
    const description = String(body?.description || "").trim();
    const imageUrl = String(body?.imageUrl || "").trim();

    if (!countryName || !imageUrl) {
      return NextResponse.json({ error: "Нужны страна и ссылка на картинку" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: "Supabase env is not configured"
      });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/ai_training_examples`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        country_name: countryName,
        description,
        image_url: imageUrl,
        image_hint: `${countryName} map example`,
        source_type: "user_link"
      })
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: text || "Не удалось сохранить пример" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: text ? JSON.parse(text) : null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Внутренняя ошибка" }, { status: 500 });
  }
}
