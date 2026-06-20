import { useState } from "react";

export default function HistoryPanel({ detections = [], onClear }) {
  const [expandedId, setExpandedId] = useState(null);

  const downloadEvidence = (detection, index) => {
    const metadata = {
      timestamp: detection.timestamp,
      gesture: detection.gesture,
      confidence: detection.confidence,
    };

    // Create a zip-like experience: download metadata JSON + open screenshot
    const metaBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const metaUrl = URL.createObjectURL(metaBlob);
    const a = document.createElement("a");
    a.href = metaUrl;
    a.download = `detection_${index + 1}_metadata.json`;
    a.click();
    URL.revokeObjectURL(metaUrl);

    // Also download screenshot
    if (detection.screenshot) {
      const b = document.createElement("a");
      b.href = detection.screenshot;
      b.download = `detection_${index + 1}_screenshot.jpg`;
      b.click();
    }
  };

  if (detections.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500 text-sm py-8 border border-dashed border-gray-700 rounded-xl">
        No detections yet. Gesture events will appear here.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">
          Detection Log{" "}
          <span className="text-red-400 text-sm ml-1">
            ({detections.length})
          </span>
        </h2>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-red-400 transition"
          >
            Clear all
          </button>
        )}
      </div>

      {[...detections].reverse().map((d, i) => {
        const realIndex = detections.length - 1 - i;
        const isOpen = expandedId === realIndex;
        const pct = Math.round(d.confidence * 100);
        const time = new Date(d.timestamp).toLocaleTimeString();

        return (
          <div
            key={realIndex}
            className="bg-gray-900 border border-red-800 rounded-lg overflow-hidden"
          >
            {/* Header row */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition"
              onClick={() => setExpandedId(isOpen ? null : realIndex)}
            >
              <div className="flex items-center gap-3 text-left">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-white text-sm font-medium">{d.gesture}</span>
                <span className="text-gray-400 text-xs">{time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${pct >= 90 ? "bg-red-900 text-red-300" : "bg-yellow-900 text-yellow-300"}`}
                >
                  {pct}%
                </span>
                <span className="text-gray-500 text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="px-4 pb-4 border-t border-gray-800">
                {d.screenshot && (
                  <img
                    src={d.screenshot}
                    alt="Detection screenshot"
                    className="mt-3 rounded-lg w-full max-w-xs border border-gray-700"
                  />
                )}
                <div className="mt-3 text-xs text-gray-400 font-mono space-y-1">
                  <p>Timestamp: {d.timestamp}</p>
                  <p>Confidence: {pct}%</p>
                </div>
                <button
                  onClick={() => downloadEvidence(d, realIndex)}
                  className="mt-3 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition"
                >
                  ⬇ Download evidence
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
