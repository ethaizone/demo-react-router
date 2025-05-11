import { useEffect, useRef, useState } from "react";
import { useEventSource } from "remix-utils/sse/react";

// --- Client UI ---
export default function StreamPage() {
  const [lines, setLines] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = () => {
    setStreaming(true);
  };

  const stopStream = () => {
    console.log("Stopping stream");
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreaming(false);
  };

  let time = useEventSource("/stream-resource", {
    event: "time",
    enabled: streaming,
  });

  let exit = useEventSource("/stream-resource", {
    event: "exit",
    enabled: streaming,
  });

  useEffect(() => {
    if (time) {
      setLines((prev) => [...prev, time]);
    }
  }, [time]);

  useEffect(() => {
    if (exit) {
      stopStream();
    }
  }, [exit]);

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">
        SSE Timer Stream (remix-utils)
      </h1>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={streaming}
          onClick={startStream}
        >
          Start
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          disabled={!streaming}
          onClick={stopStream}
        >
          Stop
        </button>
      </div>
      <div className="bg-gray-100 rounded p-4 h-64 overflow-auto font-mono text-sm border">
        {lines.length === 0 ? (
          <span className="text-gray-600">No data yet.</span>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="text-black">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
