"use client";

import { useState } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("политическая карта Европы, минимализм, подписи, мягкие цвета, вода");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [withWater, setWithWater] = useState(true);

  async function generate() {
    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, withWater })
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
        Своя ИИ для политических карт. Теперь с генерацией воды, внутренним инструментом вариаций и статусом процесса.
      </p>

      <div className="appGrid">
        <section className="panel">
          <div className="sectionTitle">Запрос</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="promptInput"
            placeholder="Например: политическая карта Азии, тёмный стиль, подписи, вода, мягкие цвета"
          />

          <label className="toggleRow">
            <input
              type="checkbox"
              checked={withWater}
              onChange={(e) => setWithWater(e.target.checked)}
            />
            <span>Добавлять воду</span>
          </label>

          <button
            onClick={generate}
            disabled={loading}
            className="generateButton"
          >
            {loading ? "ИИ генерирует карту..." : "Сгенерировать карту"}
          </button>

          {loading && (
            <div className="statusCard">
              <div className="statusDot" />
              <div>
                <div className="statusTitle">ИИ генерирует карту</div>
                <div className="statusText">Собираю регион, стили, воду и вариативные детали...</div>
              </div>
            </div>
          )}

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
