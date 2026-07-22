// BPMN (Lucidchart export) parser.
// Input: parsed JSON object. Output: structured flow summary for LLM prompt.
// Logic validated on node 14; port to lib/bpmn.ts (add types) for Next.js.

const TEXT = (shape, label = "Text") => {
  const ta = (shape.textAreas || []).find((t) => t.label === label);
  return ta ? (ta.text || "").trim() : "";
};

// Any non-empty text on the shape (gateway text sometimes under different label).
const anyText = (shape) => {
  for (const t of shape.textAreas || []) {
    if (t.label !== "Placeholder" && (t.text || "").trim()) return t.text.trim();
  }
  return "";
};

/**
 * Parse one Lucidchart BPMN JSON into a normalized model.
 * @param {object} doc - parsed JSON
 * @returns {{title:string, lanes:object[], nodes:Map, edges:object[]}}
 */
export function parseBpmn(doc) {
  const page = (doc.pages || [])[0] || {};
  const items = page.items || {};
  const shapes = items.shapes || [];
  const lines = items.lines || [];

  // id -> shape
  const byId = new Map();
  for (const s of shapes) byId.set(s.id, s);

  // Lanes/pools + membership (shapeId -> actor name).
  // Two encodings exist:
  //  a) BPMNAdvancedPoolBlock: one shape per lane, members in contains.shapes
  //     -> reliable per-activity actor mapping.
  //  b) AdvancedSwimLaneBlockRotated: one shape holds many lanes (textAreas
  //     Primary_0..N) with a single flat contains list -> we get the actor NAMES
  //     but cannot map each activity to its lane (no geometry). Names only.
  const lanes = [];
  const actorOf = new Map();
  for (const s of shapes) {
    if (s.class === "BPMNAdvancedPoolBlock") {
      const name = TEXT(s, "poolPrimaryTitleKey") || anyText(s) || "(tanpa nama)";
      const members = (s.contains && s.contains.shapes) || [];
      lanes.push({ id: s.id, name, members });
      for (const m of members) actorOf.set(m, name);
    } else if (s.class === "AdvancedSwimLaneBlockRotated") {
      for (const t of s.textAreas || []) {
        if (/^Primary/.test(t.label) && (t.text || "").trim()) {
          lanes.push({ id: `${s.id}:${t.label}`, name: t.text.trim(), members: [] });
        }
      }
    }
  }

  // Classify nodes we care about.
  const KIND = {
    BPMNActivity: "activity",
    KNBPMNActivityNonGctBlock: "activity",
    BPMNGateway: "gateway",
    BPMNEvent: "event",
  };
  const nodes = new Map();
  for (const s of shapes) {
    const kind = KIND[s.class];
    if (!kind) continue;
    nodes.set(s.id, {
      id: s.id,
      kind,
      text: anyText(s),
      actor: actorOf.get(s.id) || "",
    });
  }

  // Decision questions live in floating AutoGrowTextBlock shapes (no geometry to
  // tie them to a gateway, so collect as standalone context for the LLM).
  const questions = [];
  for (const s of shapes) {
    if (s.class !== "AutoGrowTextBlock") continue;
    const t = anyText(s);
    if (t && t.includes("?")) questions.push(t);
  }

  // Edges: sequence flow. style Generalization/CircleOpen = cross-pool handoff.
  const edges = [];
  for (const l of lines) {
    const e1 = l.endpoint1 || {};
    const e2 = l.endpoint2 || {};
    const from = e1.connectedTo;
    const to = e2.connectedTo;
    if (!from || !to) continue;
    const label = (l.textAreas || [])
      .map((t) => (t.text || "").trim())
      .filter(Boolean)
      .join(" / ");
    const style = `${e1.style || ""}|${e2.style || ""}`;
    const handoff = /Generalization|CircleOpen/.test(style);
    edges.push({ id: l.id, from, to, label, handoff });
  }

  return { title: doc.title || "(untitled)", lanes, nodes, byId, edges, questions };
}

/**
 * Order sequence edges by traversal from start nodes (in-degree 0).
 * Handoff edges excluded. Falls back to file order for unreached edges.
 */
function orderedEdges(model) {
  const seq = model.edges.filter((e) => !e.handoff);
  const adj = new Map();
  const indeg = new Map();
  const known = new Set();
  for (const e of seq) {
    known.add(e.from);
    known.add(e.to);
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e);
    indeg.set(e.to, (indeg.get(e.to) || 0) + 1);
  }
  const starts = [...known].filter((id) => !(indeg.get(id) > 0));
  const ordered = [];
  const seen = new Set();
  const visit = (id) => {
    for (const e of adj.get(id) || []) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      ordered.push(e);
      visit(e.to);
    }
  };
  for (const s of starts) visit(s);
  // Append any edges missed (cycles with no in-degree-0 entry).
  for (const e of seq) if (!seen.has(e.id)) ordered.push(e);
  return ordered;
}

/**
 * Build a human/LLM-readable text summary of the flow.
 */
export function summarizeFlow(model) {
  const { title, lanes, nodes, edges } = model;
  const out = [];
  out.push(`# Diagram: ${title}`);

  // Actors
  out.push(`\n## Aktor (lanes)`);
  for (const ln of lanes) out.push(`- ${ln.name}`);

  // Activities grouped by actor (when per-item mapping exists).
  const byActor = new Map();
  for (const n of nodes.values()) {
    if (n.kind !== "activity" || !n.text) continue;
    if (!byActor.has(n.actor)) byActor.set(n.actor, []);
    byActor.get(n.actor).push(n.text);
  }
  const mapped = [...byActor.keys()].some((k) => k);
  if (mapped) {
    out.push(`\n## Aktivitas per aktor`);
    for (const [actor, acts] of byActor) {
      out.push(`\n### ${actor || "(tanpa lane)"}`);
      for (const a of acts) out.push(`- ${a}`);
    }
  } else {
    out.push(`\n## Aktivitas (aktor tak terpetakan per item — lihat daftar aktor di atas)`);
    for (const acts of byActor.values()) for (const a of acts) out.push(`- ${a}`);
  }

  // Decision questions (floating labels) — LLM correlates with branches by context.
  if (model.questions && model.questions.length) {
    out.push(`\n## Pertanyaan keputusan (teridentifikasi)`);
    for (const q of model.questions) out.push(`- ${q}`);
  }

  // Decisions (gateways): describe via outgoing labeled edges
  out.push(`\n## Percabangan (gateway)`);
  let gi = 0;
  for (const n of nodes.values()) {
    if (n.kind !== "gateway") continue;
    const outs = edges.filter((e) => e.from === n.id && !e.handoff);
    if (!outs.length) continue;
    const q = n.text || `Keputusan #${++gi}`;
    const branches = outs
      .map((e) => `${e.label || "?"} → ${label(model, e.to)}`)
      .join("; ");
    out.push(`- ${q}: ${branches}`);
  }

  // Sequence flow ordered from start, as readable steps
  out.push(`\n## Alur langkah (urut dari start)`);
  for (const e of orderedEdges(model)) {
    const a = label(model, e.from);
    const b = label(model, e.to);
    const lbl = e.label ? ` [${e.label}]` : "";
    out.push(`- ${a} →${lbl} ${b}`);
  }

  // Events
  const events = [...nodes.values()].filter((n) => n.kind === "event" && n.text);
  if (events.length) {
    out.push(`\n## Event`);
    for (const ev of events) out.push(`- ${ev.text}`);
  }

  return out.join("\n");
}

// Resolve a readable label for any node id (activity/gateway/event).
function label(model, id) {
  const n = model.nodes.get(id);
  if (n && n.text) return n.text;
  if (n && n.kind === "gateway") return "Keputusan";
  // could be a pool or autogrow text block
  const s = model.byId.get(id);
  if (s) return anyText(s) || `(${s.class})`;
  return "(?)";
}
