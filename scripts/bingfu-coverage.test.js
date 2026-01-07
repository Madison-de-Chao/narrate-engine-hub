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
  for (const file of fs.readdirSync(dir)) {
    const txt = fs.readFileSync(path.join(dir, file), "utf8");
    const idMatches = [...txt.matchAll(/id:\s*'([^']+)'/g)];
    const nameMatches = [...txt.matchAll(/name:\s*'([^']+)'/g)];
    const aliasMatches = [...txt.matchAll(/alias:\s*'([^']+)'/g)];
    const max = Math.max(idMatches.length, nameMatches.length, aliasMatches.length);
    for (let i = 0; i < max; i++) {
      if (idMatches[i]?.[1]) ids.add(idMatches[i][1]);
      if (nameMatches[i]?.[1]) names.add(nameMatches[i][1]);
      if (aliasMatches[i]?.[1]) aliases.add(aliasMatches[i][1]);
    }
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
