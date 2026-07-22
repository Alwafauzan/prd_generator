"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import Mermaid from "./components/Mermaid";

type FeatureOpt = { code: string; cluster: string; label: string; suggestBpmn: string | null };
type PrdSection = { id: string; title: string; content_md: string };
type Prd = {
  title: string;
  meta?: { related_document?: string; version?: string; date?: string };
  sections: PrdSection[];
  open_questions?: string[];
  assumptions?: string[];
};
type SavedItem = { code: string; moduleName: string; mode: string | null; hasFlowchart: boolean; updatedAt: string };

// Mirror of server prdToMarkdown for download + save.
function prdToMarkdown(p: Prd): string {
  const out = [`# ${p.title || "PRD"}`];
  if (p.meta?.related_document) out.push(`\n**Related Document:** ${p.meta.related_document}`);
  if (p.meta?.version) out.push(`**Versi:** ${p.meta.version}`);
  for (const s of p.sections) out.push(`\n## ${s.title}\n\n${s.content_md}`);
  if (p.assumptions?.length) out.push(`\n## Asumsi\n` + p.assumptions.map((x) => `- ${x}`).join("\n"));
  if (p.open_questions?.length) out.push(`\n## Pertanyaan Terbuka\n` + p.open_questions.map((x) => `- ${x}`).join("\n"));
  return out.join("\n");
}

export default function Home() {
  const [features, setFeatures] = useState<FeatureOpt[]>([]);
  const [bpmnFiles, setBpmnFiles] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [bpmnFile, setBpmnFile] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [prd, setPrd] = useState<Prd | null>(null);
  const [mode, setMode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [err, setErr] = useState("");

  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");
  const [storeErr, setStoreErr] = useState("");

  // Flowchart (UI/UX) + Develop-PRD prompting.
  const [flowchart, setFlowchart] = useState("");
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowErr, setFlowErr] = useState("");
  const [flowEditing, setFlowEditing] = useState(false);
  const [devInstr, setDevInstr] = useState("");
  const [devLoading, setDevLoading] = useState(false);
  const [devErr, setDevErr] = useState("");

  // Cross-PRD consistency picker.
  const [relatedCand, setRelatedCand] = useState<{ code: string; moduleName: string; auto: boolean }[]>([]);
  const [relatedSel, setRelatedSel] = useState<string[]>([]);

  // Document attachments (bahan tambahan generate).
  const [docs, setDocs] = useState<File[]>([]);
  const [savedAttachments, setSavedAttachments] = useState<{ name: string; kind: string }[]>([]);

  useEffect(() => {
    fetch("/api/options").then((r) => r.json()).then((d) => { setFeatures(d.features); setBpmnFiles(d.bpmnFiles); }).catch((e) => setErr(String(e)));
    refreshSaved();
  }, []);

  function refreshSaved() {
    fetch("/api/prd").then((r) => r.json()).then((d) => {
      if (d.error) setStoreErr(d.error); else { setSaved(d.items || []); setStoreErr(""); }
    }).catch((e) => setStoreErr(String(e)));
  }

  const grouped = useMemo(() => {
    const m = new Map<string, FeatureOpt[]>();
    for (const f of features) { if (!m.has(f.cluster)) m.set(f.cluster, []); m.get(f.cluster)!.push(f); }
    return [...m.entries()];
  }, [features]);

  const selectedCluster = features.find((f) => f.code === code)?.cluster || null;

  function onPickCode(c: string) {
    setCode(c);
    const f = features.find((x) => x.code === c);
    setBpmnFile(f?.suggestBpmn && bpmnFiles.includes(f.suggestBpmn) ? f.suggestBpmn : "");
    setRelatedCand([]); setRelatedSel([]);
    if (c) {
      fetch(`/api/related?code=${encodeURIComponent(c)}`).then((r) => r.json()).then((d) => {
        const items = d.items || [];
        setRelatedCand(items);
        setRelatedSel(items.filter((x: { auto: boolean }) => x.auto).map((x: { code: string }) => x.code));
      }).catch(() => {});
    }
  }

  function onPickDocs(fileList: FileList | null) {
    if (!fileList) return;
    // Materialize NOW — the live FileList empties when we reset input.value below.
    const picked = Array.from(fileList);
    setDocs((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...picked.filter((f) => !names.has(f.name))];
    });
  }
  function removeDoc(name: string) { setDocs((prev) => prev.filter((f) => f.name !== name)); }

  function toggleRelated(c: string) {
    setRelatedSel((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function resetResult() { setPrd(null); setMode(""); setModuleName(""); setCurrentCode(null); setEditing(false); setFlowchart(""); setFlowErr(""); setFlowEditing(false); setDevErr(""); setDevInstr(""); setSavedAttachments([]); }

  async function onFlowchart() {
    setFlowErr(""); setFlowEditing(false);
    if (!prd) { setFlowErr("Generate PRD dulu — flowchart diturunkan dari PRD."); return; }
    setFlowLoading(true);
    try {
      const res = await fetch("/api/flowchart", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd, moduleName, code: currentCode || code }),
      });
      const data = await res.json();
      if (!res.ok) { setFlowErr(data.error || "Gagal generate flowchart."); return; }
      setFlowchart(data.mermaid || "");
      refreshSaved(); // hasFlowchart updated
    } catch (e) { setFlowErr(e instanceof Error ? e.message : String(e)); }
    finally { setFlowLoading(false); }
  }

  function downloadFlowchart() {
    if (!flowchart) return;
    const blob = new Blob([flowchart], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `flowchart-${(moduleName || code).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mmd`;
    a.click(); URL.revokeObjectURL(url);
  }

  async function onDevelop() {
    if (!prd) return;
    const instruction = devInstr.trim();
    if (!instruction) { setDevErr("Tulis instruksi pengembangan dulu."); return; }
    setDevErr(""); setDevLoading(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd, instruction, moduleName, code: currentCode || code }),
      });
      const data = await res.json();
      if (!res.ok) { setDevErr(data.error || "Gagal kembangkan PRD."); return; }
      setPrd(data.prd || prd); setMode(data.mode || mode); setDevInstr("");
      refreshSaved(); // PRD overwritten in store
    } catch (e) { setDevErr(e instanceof Error ? e.message : String(e)); }
    finally { setDevLoading(false); }
  }

  async function onGenerate() {
    setErr(""); resetResult(); setLoading(true);
    if (!code) { setErr("Pilih code fitur dulu."); setLoading(false); return; }
    try {
      // Multipart when documents attached, else plain JSON.
      let res: Response;
      if (docs.length) {
        const fd = new FormData();
        fd.append("code", code); fd.append("bpmnFile", bpmnFile); fd.append("draft", draft);
        fd.append("relatedCodes", relatedSel.join(","));
        for (const f of docs) fd.append("documents", f);
        res = await fetch("/api/generate", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, bpmnFile, draft, relatedCodes: relatedSel }),
        });
      }
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Gagal generate."); return; }
      setPrd(data.prd || null); setMode(data.mode); setModuleName(data.moduleName || "");
      setCurrentCode(data.code || code); // auto-saved to result/
      setSavedAttachments(data.attachments || []);
      refreshSaved();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  // Save manual edits (section / flowchart) — overwrites the stored record.
  async function onSave() {
    if (!prd) return;
    const key = currentCode || code;
    setBusy("save"); setStoreErr("");
    const markdown = prdToMarkdown(prd);
    try {
      const res = saved.some((s) => s.code === key)
        ? await fetch(`/api/prd/${key}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ moduleName, prd, markdown, flowchart: flowchart || null }) })
        : await fetch("/api/prd", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: key, moduleName, cluster: selectedCluster, bpmnFile: bpmnFile || null, mode, draft, prd, markdown, flowchart: flowchart || null }) });
      const data = await res.json();
      if (!res.ok) { setStoreErr(data.error || "Gagal simpan."); return; }
      if (data.item?.code) setCurrentCode(data.item.code);
      setEditing(false);
      refreshSaved();
    } catch (e) { setStoreErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(""); }
  }

  async function onLoad(loadCode: string) {
    setBusy("load"); setErr("");
    try {
      const res = await fetch(`/api/prd/${loadCode}`);
      const data = await res.json();
      if (!res.ok) { setStoreErr(data.error || "Gagal load."); return; }
      const row = data.item;
      setPrd(row.prd); setModuleName(row.moduleName); setMode(row.mode || "tersimpan");
      setCode(row.code); setBpmnFile(row.bpmnFile || ""); setDraft(row.draft || "");
      setFlowchart(row.flowchart || ""); setFlowEditing(false);
      setSavedAttachments(row.attachments || []); setDocs([]);
      setCurrentCode(row.code); setEditing(false);
    } catch (e) { setStoreErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(""); }
  }

  async function onDelete(delCode: string) {
    if (!confirm("Hapus PRD ini?")) return;
    await fetch(`/api/prd/${delCode}`, { method: "DELETE" });
    if (currentCode === delCode) resetResult();
    refreshSaved();
  }

  function editSection(i: number, field: "title" | "content_md", v: string) {
    if (!prd) return;
    const sections = prd.sections.map((s, idx) => (idx === i ? { ...s, [field]: v } : s));
    setPrd({ ...prd, sections });
  }

  function download() {
    if (!prd) return;
    const blob = new Blob([prdToMarkdown(prd)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `prd-${(moduleName || code).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click(); URL.revokeObjectURL(url);
  }

  const hasResult = !!prd;
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">PR</div>
          <div className="brand">
            <h1>PRD Generator — SIMRS</h1>
            <p>System Analyst · RS Tipe C &amp; D · BPMN → PRD terstruktur</p>
          </div>
        </div>
      </header>

      <main className="wrap">
        <div className="grid">
          <div>
            <form className="panel panel-form" onSubmit={(e) => { e.preventDefault(); onGenerate(); }}>
              <div className="field">
                <label>Code Fitur <span className="hint">— List Fitur (MVP)</span></label>
                <select value={code} onChange={(e) => onPickCode(e.target.value)}>
                  <option value="">— pilih code —</option>
                  {grouped.map(([cluster, opts]) => (
                    <optgroup key={cluster} label={cluster}>
                      {opts.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>File BPMN <span className="hint">— kosong = knowledge mode</span></label>
                <select value={bpmnFile} onChange={(e) => setBpmnFile(e.target.value)}>
                  <option value="">⚡ Tanpa BPMN — pakai knowledge base</option>
                  {bpmnFiles.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Draft PRD <span className="hint">— opsional</span></label>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tujuan modul, kebutuhan utama, integrasi… (boleh kosong)" />
              </div>
              <div className="field">
                <label>Dokumen pendukung <span className="hint">— PDF/Word/Excel/teks (opsional)</span></label>
                <label className="file-drop">
                  <input type="file" multiple accept=".pdf,.docx,.xlsx,.xls,.txt,.md,.csv" onChange={(e) => { onPickDocs(e.target.files); e.currentTarget.value = ""; }} />
                  <span>📎 Pilih / tambah dokumen…</span>
                </label>
                {docs.length > 0 && (
                  <ul className="doc-list">
                    {docs.map((f) => (
                      <li key={f.name}>
                        <span className="doc-name" title={f.name}>{f.name}</span>
                        <span className="doc-size">{(f.size / 1024).toFixed(0)} KB</span>
                        <button type="button" className="saved-del" onClick={() => removeDoc(f.name)} title="Hapus">✕</button>
                      </li>
                    ))}
                  </ul>
                )}
                {savedAttachments.length > 0 && (
                  <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>📁 Tersimpan: {savedAttachments.map((a) => a.name).join(", ")}</p>
                )}
              </div>
              {relatedCand.length > 0 && (
                <div className="field">
                  <label>PRD terkait <span className="hint">— jaga konsistensi field (NIP, NIK, dll). ✓ = terdeteksi beririsan</span></label>
                  <div className="related-list">
                    {relatedCand.map((r) => (
                      <label key={r.code} className="related-item" title={r.moduleName}>
                        <input type="checkbox" checked={relatedSel.includes(r.code)} onChange={() => toggleRelated(r.code)} />
                        <span className="related-code">{r.code}{r.auto ? " ●" : ""}</span>
                        <span className="related-name">{r.moduleName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn" type="submit" disabled={loading}>{loading ? "Menyusun PRD…" : "Generate PRD"}</button>
              {err && <div className="errbox">{err}</div>}
            </form>

            <div className="panel panel-form" style={{ marginTop: 20 }}>
              <div className="out-head" style={{ marginBottom: 12 }}>
                <div className="out-title"><strong style={{ fontSize: 15 }}>PRD Tersimpan</strong></div>
                <button className="btn btn-ghost" onClick={refreshSaved}>↻</button>
              </div>
              {storeErr && <div className="errbox" style={{ marginTop: 0 }}>{storeErr}</div>}
              {!storeErr && !saved.length && <p className="muted">Belum ada PRD tersimpan.</p>}
              <ul className="saved-list">
                {saved.map((s) => (
                  <li key={s.code} className={currentCode === s.code ? "active" : ""}>
                    <button className="saved-open" onClick={() => onLoad(s.code)} title={s.moduleName}>
                      <span className="saved-code">{s.code}{s.hasFlowchart ? " 🧭" : ""}</span>
                      <span className="saved-name">{s.moduleName}</span>
                    </button>
                    <button className="saved-del" onClick={() => onDelete(s.code)} title="Hapus">✕</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section className="panel panel-out">
            <div className="out-head">
              <div className="out-title">Hasil PRD<strong>{moduleName || "—"}</strong></div>
              <div className="out-actions">
                {mode && <span className={`badge ${mode.includes("preview") ? "badge-muted" : ""}`}>{mode}</span>}
                {currentCode && <span className="badge badge-muted">{currentCode}</span>}
                {hasResult && <button className="btn btn-ghost" onClick={() => setEditing((v) => !v)}>{editing ? "Selesai edit" : "Edit"}</button>}
                {hasResult && <button className="btn btn-ghost" onClick={onFlowchart} disabled={flowLoading}>{flowLoading ? "Flowchart…" : flowchart ? "↻ Flowchart" : "🧭 Flowchart"}</button>}
                {hasResult && <button className="btn btn-ghost" onClick={onSave} disabled={busy === "save"}>{busy === "save" ? "Menyimpan…" : "💾 Simpan Edit"}</button>}
                {hasResult && <button className="btn btn-ghost" onClick={download}>Download .md</button>}
              </div>
            </div>

            {!hasResult && !loading && (
              <div className="empty"><div className="ico">📄</div><p>Belum ada hasil.</p><p>Pilih code &amp; BPMN, lalu <strong>Generate PRD</strong> — flowchart dibuat dari PRD via tombol <strong>🧭 Flowchart</strong>.</p></div>
            )}
            {loading && <div className="empty"><p><span className="spinner" />Menyusun PRD… (~1–2 menit)</p></div>}
            {flowErr && <div className="errbox">{flowErr}</div>}
            {flowLoading && <div className="empty"><p><span className="spinner" />Menyusun flowchart dari PRD… (~1–2 menit)</p></div>}

            {flowchart && (
              <details className="section" open>
                <summary>🧭 Flowchart System (untuk UI/UX)</summary>
                <div className="section-body">
                  <div className="flow-tools">
                    <button className="btn btn-ghost" onClick={() => setFlowEditing((v) => !v)}>{flowEditing ? "Selesai edit" : "✎ Edit flowchart"}</button>
                    <button className="btn btn-ghost" onClick={downloadFlowchart}>Download .mmd</button>
                  </div>
                  {flowEditing && (
                    <textarea
                      className="flow-edit"
                      value={flowchart}
                      onChange={(e) => setFlowchart(e.target.value)}
                      spellCheck={false}
                    />
                  )}
                  <Mermaid code={flowchart} />
                </div>
              </details>
            )}

            {!loading && prd && (
              <div>
                {prd.meta && !editing && (
                  <p className="meta">
                    {prd.meta.related_document && <>📎 {prd.meta.related_document} · </>}
                    {prd.meta.version && <>v{prd.meta.version}</>}
                  </p>
                )}
                {prd.sections.map((s, i) => editing ? (
                  <div key={s.id} className="edit-sec">
                    <input className="edit-title" value={s.title} onChange={(e) => editSection(i, "title", e.target.value)} />
                    <textarea className="edit-body" value={s.content_md} onChange={(e) => editSection(i, "content_md", e.target.value)} />
                  </div>
                ) : (
                  <details key={s.id} className="section" open>
                    <summary>{s.title}</summary>
                    <div className="section-body"><ReactMarkdown>{s.content_md}</ReactMarkdown></div>
                  </details>
                ))}
                {!editing && prd.assumptions?.length ? (
                  <details className="section" open><summary>Asumsi</summary><div className="section-body"><ul>{prd.assumptions.map((x, i) => <li key={i}>{x}</li>)}</ul></div></details>
                ) : null}
                {!editing && prd.open_questions?.length ? (
                  <details className="section" open><summary>Pertanyaan Terbuka</summary><div className="section-body"><ul>{prd.open_questions.map((x, i) => <li key={i}>{x}</li>)}</ul></div></details>
                ) : null}

                {!editing && (
                  <div className="develop-box">
                    <label>💬 Kembangkan PRD <span className="hint">— prompt untuk perdalam / tambah konteks</span></label>
                    <textarea
                      value={devInstr}
                      onChange={(e) => setDevInstr(e.target.value)}
                      placeholder="cth: perdalam integrasi BPJS VClaim & SEP, tambah user stories untuk perawat, detailkan business rules validasi NIK, tambah edge case IGD…"
                      disabled={devLoading}
                    />
                    <button className="btn" onClick={onDevelop} disabled={devLoading}>
                      {devLoading ? "Mengembangkan PRD…" : "Kembangkan PRD"}
                    </button>
                    {devErr && <div className="errbox">{devErr}</div>}
                    <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Hasil menggantikan PRD di atas &amp; <strong>otomatis tersimpan</strong> ke <code>result/{currentCode}</code>.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
