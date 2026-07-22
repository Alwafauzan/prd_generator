"use client";
import { useEffect, useRef, useState } from "react";

// Client-side Mermaid renderer. Dynamically imports mermaid (heavy, browser-only)
// so it never lands in the server bundle. Falls back to showing the raw code +
// a mermaid.live link if rendering fails.
let mermaidInit = false;

export default function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInit) {
          mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "neutral" });
          mermaidInit = true;
        }
        const id = "mmd-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) { ref.current.innerHTML = svg; setErr(""); }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  function copy() {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 15000); });
  }
  // mermaid.live uses base64 of a JSON payload in the URL hash.
  function liveUrl(): string {
    try {
      const json = JSON.stringify({ code, mermaid: { theme: "neutral" } });
      const b64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : "";
      return `https://mermaid.live/edit#base64:${b64}`;
    } catch { return "https://mermaid.live"; }
  }

  return (
    <div className="mermaid-wrap">
      <div className="mermaid-actions">
        <button className="btn btn-ghost" onClick={copy}>{copied ? "Tersalin ✓" : "Copy kode"}</button>
        <a className="btn btn-ghost" href={liveUrl()} target="_blank" rel="noreferrer">Buka di mermaid.live ↗</a>
      </div>
      {!err && <div className="mermaid-svg" ref={ref} />}
      {err && (
        <div>
          <div className="errbox" style={{ marginTop: 0 }}>Render gagal: {err}. Pakai kode di bawah.</div>
          <pre className="mermaid-code"><code>{code}</code></pre>
        </div>
      )}
    </div>
  );
}
