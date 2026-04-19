"use client";

import { useState } from "react";

type TabId = "chat" | "training" | "gallery";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [prompt, setPrompt] = useState("политическая карта Европы, минимализм, подписи, мягкие цвета, вода");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [withWater, setWithWater] = useState(true);

  const [countryName, setCountryName] = useState("");
  const [countryDescription, setCountryDescription] = useState("");
  const [highlightDescription, setHighlightDescription] = useState("");
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState<string | null>(null);

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

  async function saveTrainingExample() {
    setTrainingLoading(true);
    setTrainingMessage(null);

    try {
      if (!trainingFile) {
        throw new Error("Сначала загрузи картинку страны");
      }

      const uploadForm = new FormData();
      uploadForm.append("file", trainingFile);

      const uploadRes = await fetch("/api/upload-training-image", {
        method: "POST",
        body: uploadForm
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData?.error || "Ошибка загрузки картинки");
      }

      const res = await fetch("/api/training-example", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          countryName,
          description: [countryDescription, highlightDescription].filter(Boolean).join(" | "),
          imageUrl: uploadData.publicUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка сохранения примера");
      }

      setTrainingMessage("Пример сохранён. ИИ будет считать самый выделенный цвет главным ориентиром страны, а тусклые области — окружением и фоном.");
      setCountryName("");
      setCountryDescription("");
      setHighlightDescription("");
      setTrainingFile(null);
    } catch (e: any) {
      setTrainingMessage(e.message || "Ошибка обучения");
    } finally {
      setTrainingLoading(false);
    }
  }

  return (
    <main className="pageShell">
      <h1 className="pageTitle">PoliteAI</h1>
      <p className="pageSubtitle">
        Своя ИИ для политических карт. Чат для генерации, обучение на примерах стран и галерея будущих образцов.
      </p>

      <div className="tabsRow">
        <button className={`tabButton ${activeTab === "chat" ? "tabButtonActive" : ""}`} onClick={() => setActiveTab("chat")}>Чат</button>
        <button className={`tabButton ${activeTab === "training" ? "tabButtonActive" : ""}`} onClick={() => setActiveTab("training")}>Обучение</button>
        <button className={`tabButton ${activeTab === "gallery" ? "tabButtonActive" : ""}`} onClick={() => setActiveTab("gallery")}>Галерея</button>
      </div>

      {activeTab === "chat" && (
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
      )}

      {activeTab === "training" && (
        <div className="singleColumnLayout">
          <section className="panel">
            <div className="sectionTitle">Обучение ИИ на примере страны</div>
            <p className="helpText">
              Загрузи картинку одной страны. Лучше, чтобы сама страна была выделена ярче, а остальное — тусклее. Тогда ИИ поймёт, какой цвет главный, где сама территория, а где окружение.
            </p>

            <input
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              className="textInput"
              placeholder="Что за страна? Например: Казахстан"
            />

            <label className="uploadBox">
              <span className="uploadTitle">Загрузить фото страны</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hiddenFileInput"
                onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
              />
              <span className="uploadHint">
                {trainingFile ? `Файл: ${trainingFile.name}` : "Нажми и выбери картинку"}
              </span>
            </label>

            <textarea
              value={countryDescription}
              onChange={(e) => setCountryDescription(e.target.value)}
              rows={5}
              className="promptInput"
              placeholder="Описание страны: форма, вода, размер, вытянутость, особенности территории"
            />

            <textarea
              value={highlightDescription}
              onChange={(e) => setHighlightDescription(e.target.value)}
              rows={4}
              className="promptInput"
              placeholder="Опиши, какой цвет выделяет страну и что вокруг тусклое. Например: страна выделена ярко-зелёным, а соседние территории и море бледные"
            />

            <button
              onClick={saveTrainingExample}
              disabled={trainingLoading}
              className="generateButton"
            >
              {trainingLoading ? "ИИ учится..." : "Сохранить пример для обучения"}
            </button>

            {trainingMessage && <div className="infoMessage">{trainingMessage}</div>}
          </section>
        </div>
      )}

      {activeTab === "gallery" && (
        <div className="singleColumnLayout">
          <section className="panel">
            <div className="sectionTitle">Галерея</div>
            <p className="helpText">
              Тут будут появляться обучающие примеры стран и удачные генерации. Пока это заготовка под следующий этап.
            </p>
            <div className="emptyState compactEmptyState">Галерея пока пустая</div>
          </section>
        </div>
      )}
    </main>
  );
}
