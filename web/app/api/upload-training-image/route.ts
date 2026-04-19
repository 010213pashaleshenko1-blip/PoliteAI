import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const trainingBucket = process.env.SUPABASE_TRAINING_BUCKET || "training-images";

export const runtime = "nodejs";

function extFromType(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "bin";
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);
    const ext = extFromType(file.type || "application/octet-stream");
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${trainingBucket}/${fileName}`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true"
      },
      body: bytes
    });

    const text = await uploadRes.text();

    if (!uploadRes.ok) {
      return NextResponse.json({ error: text || "Не удалось загрузить картинку" }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${trainingBucket}/${fileName}`;
    return NextResponse.json({ ok: true, fileName, publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Внутренняя ошибка" }, { status: 500 });
  }
}
