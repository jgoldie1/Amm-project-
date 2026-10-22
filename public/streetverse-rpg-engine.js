// StreetVerse cinematic RP/RPG interaction engine.
// Standalone browser module; no network requests or payment side effects.
(function (root) {
  "use strict";
  function normalizeScene(scene) {
    if (!scene || typeof scene !== "object" || !Array.isArray(scene.nodes)) throw new Error("Invalid RP scene");
    const nodes = new Map();
    for (const node of scene.nodes) {
      if (!node || typeof node.id !== "string" || nodes.has(node.id)) throw new Error("Invalid or duplicate node");
      nodes.set(node.id, node);
    }
    const start = scene.start || scene.nodes[0]?.id;
    if (!nodes.has(start)) throw new Error("Missing start node");
    for (const node of nodes.values()) for (const option of node.options || []) {
      if (option.next && !nodes.has(option.next)) throw new Error("Missing dialogue destination: " + option.next);
    }
    return { nodes, start };
  }
  function createSession(scene, onEvent) {
    const { nodes, start } = normalizeScene(scene);
    let current = start;
    let finished = false;
    const history = [];
    const emit = typeof onEvent === "function" ? onEvent : function () {};
    function view() {
      const node = nodes.get(current);
      return { id: node.id, speaker: node.speaker || "Character", text: node.text || "",
        reaction: node.reaction || null, animation: node.animation || null,
        options: finished ? [] : (node.options || []).map((o, index) => ({ index, label: o.label })),
        finished, history: history.slice() };
    }
    return {
      view,
      choose(index) {
        if (finished) throw new Error("Scene already finished");
        const node = nodes.get(current);
        const options = node.options || [];
        if (!Number.isInteger(index) || index < 0 || index >= options.length) throw new Error("Invalid dialogue option");
        const choice = options[index];
        history.push({ node: current, option: index });
        if (choice.event && typeof choice.event === "string") emit({ type: choice.event, scene: scene.id || null, node: current });
        if (choice.next) current = choice.next;
        else finished = true;
        return view();
      },
      reset() { current = start; finished = false; history.length = 0; return view(); }
    };
  }
  const api = { normalizeScene, createSession };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.StreetVerseRPG = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
