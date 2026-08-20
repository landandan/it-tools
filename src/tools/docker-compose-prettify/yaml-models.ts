import { type MaybeRef, get } from '@vueuse/core';

import yaml from 'yaml';

export { formatYaml };

// Compose files copied from terminals, docs or chat often contain indentation that the
// strict `yaml` parser rejects:
//   - Unicode whitespace (non-breaking space U+00A0, ideographic space U+3000, ...)
//     -> "Implicit keys need to be on a single line"
//   - Tab characters used for indentation (editors/terminals emit them)
//     -> "Tabs are not allowed as indentation"
//   - The "aligned" sequence-mapping form (`- key: a` then `key2:` at the same column),
//     which docker-compose (PyYAML) emits and the YAML spec allows, but this library
//     only accepts when the continuation key is nested one column deeper.
// Normalize all three so pasted compose still beautifies.
export function normalizeYamlIndentation(text: string): string {
  const base = expandIndentation(text);

  // Already parses? Good.
  try {
    yaml.parse(base);
    return base;
  }
  catch {
    // Retry after fixing the aligned sequence-mapping form.
    return fixAlignedSequenceMapping(base);
  }
}

// Collapse Unicode whitespace to a single space and expand tabs to the width that
// makes the document parse (try 2 / 4 / 8; fall back to 4).
function expandIndentation(text: string): string {
  const tryWidth = (tabWidth: number) =>
    text.replace(
      /^[^\S\n\r]+/gm,
      match => match.replace(/[^\S\t\n\r]/g, ' ').replace(/\t/g, ' '.repeat(tabWidth)),
    );

  for (const tabWidth of [2, 4, 8]) {
    const candidate = tryWidth(tabWidth);
    try {
      yaml.parse(candidate);
      return candidate;
    }
    catch {
      // try the next width
    }
  }

  return tryWidth(4);
}

// Turn the "aligned" sequence-mapping continuation keys into the "nested" form the
// parser accepts: a `- key:` whose following sibling keys line up under `key` get
// indented one column deeper. No-op for already-valid (nested) YAML.
function fixAlignedSequenceMapping(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const dash = line.match(/^(\s*)-\s+([^\s:][^:]*:\s)/); // "- key: ..." (mapping item)

    if (dash) {
      const dashIndent = dash[1].length;
      const alignedKeyLead = dashIndent + 1; // leading spaces of an *aligned* sibling key
      out.push(line);

      let j = i + 1;
      while (j < lines.length) {
        const l = lines[j];
        if (l.trim() === '') {
          out.push(l);
          j++;
          continue;
        }
        const lead = l.length - l.trimStart().length;
        if (lead <= dashIndent) {
          break; // end of this sequence item
        }
        const isKey = /^(\s*)(\S.*?:)(\s.*)?$/.test(l);
        if (isKey && lead === alignedKeyLead) {
          out.push(` ${l}`); // nest one column deeper
        }
        else {
          out.push(l);
        }
        j++;
      }
      i = j;
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join('\n');
}

function formatYaml({
  rawYaml,
  sortKeys = false,
  indentSize = 2,
}: {
  rawYaml: MaybeRef<string>
  sortKeys?: MaybeRef<boolean>
  indentSize?: MaybeRef<number>
}) {
  const parsedYaml = yaml.parse(normalizeYamlIndentation(get(rawYaml)));

  const formattedYAML = yaml.stringify(parsedYaml, {
    sortMapEntries: get(sortKeys),
    indent: get(indentSize),
  });

  return formattedYAML;
}
