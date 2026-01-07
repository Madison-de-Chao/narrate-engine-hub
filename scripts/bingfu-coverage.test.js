import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

function loadTradNames() {
  const dir = path.join(process.cwd(), "src/data/shensha_trad");
  const names = [];
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".json"))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    if (Array.isArray(data)) {
      data.forEach(d => {
        if (d?.name || d?.rule_name) {
          names.push(d.name || d.rule_name);
        }
      });
    } else if (data?.name) {
      names.push(data.name);
    }
  }
  return names;
}

function loadBingfuDefinitions() {
  const dir = path.join(process.cwd(), "src/data/bingfu");
  const ids = new Set();
  const names = new Set();
  const aliases = new Set();
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".ts") && f !== "index.ts")) {
    const txt = fs.readFileSync(path.join(dir, file), "utf8");
    const cleaned = txt
      .replace(/import[^;]+;\s*/g, "")
      .replace(/export const [^=]+=\s*/, "return ")
      .replace(/export \{[^}]+\};?/g, "");
    const defs = new Function(cleaned)();
    defs.forEach(def => {
      if (def?.id) ids.add(def.id);
      if (def?.name) names.add(def.name);
      if (def?.alias) aliases.add(def.alias);
    });
  }
  return { ids, names, aliases };
}

function loadMapping(validIds) {
  const content = fs.readFileSync(path.join(process.cwd(), "src/lib/shenshaRuleEngine.ts"), "utf8");
  const start = content.indexOf("const shenshaToBingfuMap");
  const end = content.indexOf("};", start);
  const snippet = content.slice(start, end + 2);
  const entries = [...snippet.matchAll(/'([^']+)':\s*'([^']+)'/g)].map(m => [m[1], m[2]]);
  const map = new Map(entries);
  const existingOnly = new Map(entries.filter(([, val]) => validIds.has(val)));
  return { map: existingOnly };
}

const tradNames = loadTradNames();
const { ids, names, aliases } = loadBingfuDefinitions();
const { map } = loadMapping(ids);

const missing = tradNames.filter(name => {
  const mapped = map.get(name);
  const hasDef = names.has(name) || aliases.has(name);
  const mappedExists = mapped ? ids.has(mapped) : false;
  return !hasDef && !mappedExists;
});

assert.strictEqual(missing.length, 0, `Missing bingfu definitions for: ${missing.join(", ")}`);
console.log("Bingfu coverage OK for trad shensha set.");
