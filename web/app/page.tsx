"use client";

import { useState } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("политическая карта Европы, минимализм, подписи, мягкие цвета");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  async function generate() {
    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка генерации");
      }

      setImageUrl(data.image);
      setDebug(data.debug);
    } catch (e: any) {
      alert(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pageShell">
      <h1 className="pageTitle">PoliteAI</h1>
      <p className="pageSubtitle">
        Своя ИИ для политических карт. Текст → разбор → генерация карты.
      </p>

      <div className="appGrid">
        <section className="panel">
          <div className="sectionTitle">Запрос</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="promptInput"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="generateButton"
          >
            {loading ? "Генерация..." : "Сгенерировать карту"}
          </button>

          {debug && (
            <pre className="debugBlock">
              {JSON.stringify(debug, null, 2)}
            </pre>
          )}
        </section>

        <section className="panel previewPanel">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated map"
              className="resultImage"
            />
          ) : (
            <div className="emptyState">Тут появится карта</div>
          )}
        </section>
      </div>
    </main>
  );
}
