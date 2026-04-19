import { NextRequest, NextResponse } from "next/server";
import { parsePrompt, generateMapSvg } from "@politeai/model";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Пустой prompt" }, { status: 400 });
    }

    const parsed = parsePrompt(prompt);
    const svg = generateMapSvg(parsed);
    const image = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    return NextResponse.json({
      ok: true,
      image,
      debug: parsed
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
