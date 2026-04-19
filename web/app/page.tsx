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
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1>PoliteAI</h1>
      <p style={{ opacity: 0.85 }}>
        Своя ИИ для политических карт. Текст → разбор → генерация карты.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: 24,
          alignItems: "start"
        }}
      >
        <section
          style={{
            background: "#121933",
            border: "1px solid #243056",
            borderRadius: 16,
            padding: 16
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Запрос</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: 12,
              border: "1px solid #354574",
              background: "#0f1530",
              color: "#fff",
              padding: 12
            }}
          />

          <button
            onClick={generate}
            disabled={loading}
            style={{
              marginTop: 12,
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "12px 16px",
              background: loading ? "#4f628f" : "#6b8cff",
              color: "#fff",
              cursor: loading ? "default" : "pointer",
              fontWeight: 700
            }}
          >
            {loading ? "Генерация..." : "Сгенерировать карту"}
          </button>

          {debug && (
            <pre
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                background: "#0d1328",
                border: "1px solid #243056",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: 13
              }}
            >
              {JSON.stringify(debug, null, 2)}
            </pre>
          )}
        </section>

        <section
          style={{
            background: "#121933",
            border: "1px solid #243056",
            borderRadius: 16,
            padding: 16,
            minHeight: 640
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated map"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 12,
                background: "#fff"
              }}
            />
          ) : (
            <div
              style={{
                minHeight: 600,
                display: "grid",
                placeItems: "center",
                opacity: 0.7
              }}
            >
              Тут появится карта
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
