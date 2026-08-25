import {
  type Document,
  type Node,
  type Pair,
  type Scalar,
  type YAMLMap,
  type YAMLSeq,
  isMap,
  isScalar,
  isSeq,
  parseDocument,
} from 'yaml';

/**
 * Structured issue returned by {@link validateCompose}.
 *
 * `line` / `column` are 1-based and point at the offending token in the *source*
 * text that was passed in (the normalized YAML). `lineText` is the verbatim line
 * so the UI can render a highlighted snippet with a `^` caret.
 */
export interface ComposeIssue {
  message: string
  severity: 'error' | 'warning'
  kind: 'syntax' | 'structure' | 'service'
  line?: number
  column?: number
  lineText?: string
}

export interface ComposeValidationResult {
  errors: ComposeIssue[]
  warnings: ComposeIssue[]
  /** true when there are no errors (warnings do not block). */
  isValid: boolean
}

// Top-level keys that are part of the Compose specification. Anything else (that
// is not an `x-` extension field) is reported as an "unsupported top-level object"
// warning — the same category `docker compose config` warns about.
const KNOWN_TOP_LEVEL_KEYS = new Set([
  'version',
  'name',
  'services',
  'networks',
  'volumes',
  'secrets',
  'configs',
  'include',
]);

// Keys inside a service definition that we actively validate. The Compose schema
// is huge; we deliberately only flag a curated, high-signal subset to avoid
// false positives on legitimate (but less common) options.
const SERVICE_REFERENCE_KEYS = ['depends_on', 'links', 'volumes_from', 'network_mode'] as const;

const IPV4 = '(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)';
const PORT_SHORT = new RegExp(
  `^(?:${IPV4}:)?(\\d{1,5}(?:-\\d{1,5})?)(?::(\\d{1,5}(?:-\\d{1,5})?))?(?:/(tcp|udp|sctp))?$`,
);

function offsetToLineCol(src: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const max = Math.min(offset, src.length);
  for (let i = 0; i < max; i++) {
    if (src[i] === '\n') {
      line++;
      column = 1;
    }
    else {
      column++;
    }
  }
  return { line, column };
}

function nodeLineCol(src: string, node?: Node): { line?: number; column?: number } {
  if (!node || !node.range) {
    return {};
  }
  const { line, column } = offsetToLineCol(src, node.range[0]);
  return { line, column };
}

function lineTextOf(src: string, line?: number): string | undefined {
  if (!line) {
    return undefined;
  }
  return src.split('\n')[line - 1] ?? '';
}

/** Find a direct child pair of a map node by its scalar key. */
function findPair(map: YAMLMap | undefined, key: string): Pair<Scalar, Node> | undefined {
  if (!map || !isMap(map)) {
    return undefined;
  }
  return map.items.find(
    p => isScalar(p.key) && p.key.value === key,
  ) as Pair<Scalar, Node> | undefined;
}

/** Get the value node of a direct child of a map node, if present. */
function getChild(map: YAMLMap | undefined, key: string): Node | undefined {
  return findPair(map, key)?.value ?? undefined;
}

function scalarText(node: Node | undefined): string | undefined {
  if (node && isScalar(node) && node.value != null) {
    return String(node.value);
  }
  return undefined;
}

/** Extract the list of service names a reference key points at. */
function extractReferences(value: Node | undefined, key: string): string[] {
  if (!value) {
    return [];
  }
  if (isSeq(value)) {
    return (value as YAMLSeq<Node>).items
      .map(item => scalarText(item as Node))
      .filter((s): s is string => s != null)
      // links / volumes_from may carry an alias: "service:alias"
      .map(s => s.split(':')[0]);
  }
  if (isMap(value)) {
    if (key === 'network_mode') {
      const text = scalarText(value);
      if (text) {
        const m = text.match(/^service:(.+)$/);
        return m ? [m[1]] : [];
      }
      return [];
    }
    // depends_on / links / volumes_from long form: keys are service names.
    return value.items
      .filter(p => isScalar(p.key))
      .map(p => String((p.key as Scalar).value));
  }
  // network_mode short string form ("service:db", "host", ...)
  if (key === 'network_mode') {
    const text = scalarText(value);
    if (text) {
      const m = text.match(/^service:(.+)$/);
      return m ? [m[1]] : [];
    }
  }
  return [];
}

function validatePortEntry(src: string, portNode: Node, context: string): ComposeIssue[] {
  const issues: ComposeIssue[] = [];
  if (isScalar(portNode)) {
    const raw = String(portNode.value ?? '');
    const m = PORT_SHORT.exec(raw);
    if (!m) {
      const { line, column } = nodeLineCol(src, portNode);
      issues.push({
        severity: 'error',
        kind: 'service',
        message: `${context}: "${raw}" is not a valid port mapping. Expected "HOST:CONTAINER", "CONTAINER", "IP:HOST:CONTAINER" or "PORT/PROTOCOL".`,
        line,
        column,
        lineText: lineTextOf(src, line),
      });
      return issues;
    }
    const numbers = [m[1], m[2]]
      .filter((part): part is string => Boolean(part))
      .flatMap(part => part.split('-').map(Number));
    if (numbers.some(n => n > 65535)) {
      const { line, column } = nodeLineCol(src, portNode);
      issues.push({
        severity: 'error',
        kind: 'service',
        message: `${context}: port number must be in the range 0-65535.`,
        line,
        column,
        lineText: lineTextOf(src, line),
      });
    }
    return issues;
  }
  if (isMap(portNode)) {
    const target = getChild(portNode, 'target');
    if (target == null) {
      const { line, column } = nodeLineCol(src, portNode);
      issues.push({
        severity: 'error',
        kind: 'service',
        message: `${context}: long-syntax port must declare a "target" container port.`,
        line,
        column,
        lineText: lineTextOf(src, line),
      });
    }
    const protocol = scalarText(getChild(portNode, 'protocol'));
    if (protocol && !['tcp', 'udp', 'sctp'].includes(protocol)) {
      const { line, column } = nodeLineCol(src, getChild(portNode, 'protocol'));
      issues.push({
        severity: 'warning',
        kind: 'service',
        message: `${context}: port protocol "${protocol}" is unknown; expected tcp, udp or sctp.`,
        line,
        column,
        lineText: lineTextOf(src, line),
      });
    }
    const mode = scalarText(getChild(portNode, 'mode'));
    if (mode && !['host', 'ingress'].includes(mode)) {
      const { line, column } = nodeLineCol(src, getChild(portNode, 'mode'));
      issues.push({
        severity: 'warning',
        kind: 'service',
        message: `${context}: port mode "${mode}" is unknown; expected host or ingress.`,
        line,
        column,
        lineText: lineTextOf(src, line),
      });
    }
  }
  return issues;
}

/**
 * Validate a docker-compose document the way `docker compose config` would: first
 * YAML syntax, then structural / semantic checks (services, image/build, ports,
 * cross-service references, ...).
 *
 * @param text normalized YAML source (indentation already repaired)
 */
export function validateCompose(text: string): ComposeValidationResult {
  const doc: Document = parseDocument(text);
  const errors: ComposeIssue[] = [];
  const warnings: ComposeIssue[] = [];

  // --- YAML syntax ---------------------------------------------------------
  // We deliberately do NOT surface the library's raw parser errors as problems.
  // `docker-compose-prettify` is a formatting tool first: tab / Unicode /
  // aligned-sequence-mapping quirks are repaired by normalizeYamlIndentation, and
  // the few remaining (usually recoverable) parser hiccups are simply formatted
  // into valid YAML rather than flagged. Only a genuinely unfixable document with
  // no parseable root falls through to the single message below.
  const root = doc.contents;
  if (!root || !isMap(root)) {
    if (doc.errors.length > 0) {
      const e = doc.errors[0];
      const lp = e.linePos?.[0];
      const line = lp?.line;
      const column = lp?.col;
      errors.push({
        severity: 'error',
        kind: 'syntax',
        message: `无法解析为可用的 YAML：${e.message.split('\n')[0]}`,
        line,
        column,
        lineText: lineTextOf(text, line),
      });
    }
    else {
      errors.push({
        severity: 'error',
        kind: 'structure',
        message: 'Compose file must be a YAML mapping at the top level.',
        line: 1,
        column: 1,
        lineText: lineTextOf(text, 1),
      });
    }
    return { errors, warnings, isValid: false };
  }

  // --- Top-level unknown keys ---------------------------------------------
  for (const pair of root.items) {
    if (!isScalar(pair.key)) {
      continue;
    }
    const key = String(pair.key.value);
    if (KNOWN_TOP_LEVEL_KEYS.has(key) || key.startsWith('x-')) {
      continue;
    }
    const { line, column } = nodeLineCol(text, pair.key);
    warnings.push({
      severity: 'warning',
      kind: 'structure',
      message: `Unsupported top-level object "${key}" — Compose only recognises ${[...KNOWN_TOP_LEVEL_KEYS].join(', ')} (and "x-*" extension fields).`,
      line,
      column,
      lineText: lineTextOf(text, line),
    });
  }

  const servicesNode = getChild(root, 'services');
  if (servicesNode == null) {
    errors.push({
      severity: 'error',
      kind: 'structure',
      message: 'Compose file must declare a top-level "services" section.',
      line: 1,
      column: 1,
      lineText: lineTextOf(text, 1),
    });
    return { errors, warnings, isValid: false };
  }
  if (!isMap(servicesNode)) {
    const { line, column } = nodeLineCol(text, findPair(root, 'services')?.key);
    errors.push({
      severity: 'error',
      kind: 'structure',
      message: '"services" must be a mapping of service definitions.',
      line,
      column,
      lineText: lineTextOf(text, line),
    });
    return { errors, warnings, isValid: false };
  }

  const serviceNames = new Set(
    servicesNode.items.filter(p => isScalar(p.key)).map(p => String((p.key as Scalar).value)),
  );

  const volumesNode = getChild(root, 'volumes');
  const declaredVolumes = new Set(
    isMap(volumesNode)
      ? (volumesNode as YAMLMap).items
          .filter(p => isScalar(p.key))
          .map(p => String((p.key as Scalar).value))
      : [],
  );

  // --- Per-service validation ---------------------------------------------
  for (const svcPair of servicesNode.items) {
    if (!isScalar(svcPair.key)) {
      continue;
    }
    const svcName = String(svcPair.key.value);
    const svc = svcPair.value;
    if (!isMap(svc)) {
      const { line, column } = nodeLineCol(text, svcPair.key);
      errors.push({
        severity: 'error',
        kind: 'service',
        message: `Service "${svcName}" must be a mapping of options.`,
        line,
        column,
        lineText: lineTextOf(text, line),
      });
      continue;
    }

    const imageNode = getChild(svc, 'image');
    const buildNode = getChild(svc, 'build');

    if (imageNode == null && buildNode == null) {
      const { line, column } = nodeLineCol(text, svcPair.key);
      errors.push({
        severity: 'error',
        kind: 'service',
        message: `Service "${svcName}" must specify either "image" or "build".`,
        line,
        column,
        lineText: lineTextOf(text, line),
      });
    }

    if (imageNode != null && !isScalar(imageNode)) {
      const { line, column } = nodeLineCol(text, imageNode);
      errors.push({
        severity: 'error',
        kind: 'service',
        message: `Service "${svcName}": "image" must be a string (e.g. nginx:latest).`,
        line,
        column,
        lineText: lineTextOf(text, line),
      });
    }

    if (buildNode != null && isMap(buildNode)) {
      if (getChild(buildNode, 'context') == null) {
        const { line, column } = nodeLineCol(text, findPair(svc, 'build')?.key);
        errors.push({
          severity: 'error',
          kind: 'service',
          message: `Service "${svcName}": "build" must define a "context" (or use the short string form "build: ./dir").`,
          line,
          column,
          lineText: lineTextOf(text, line),
        });
      }
    }

    // ports
    const portsNode = getChild(svc, 'ports');
    if (portsNode != null) {
      const portNodes: Node[] = isSeq(portsNode)
        ? (portsNode as YAMLSeq<Node>).items
        : [portsNode];
      for (const p of portNodes) {
        errors.push(...validatePortEntry(text, p, `Service "${svcName}" ports`));
      }
    }

    // cross-service references
    for (const key of SERVICE_REFERENCE_KEYS) {
      const refNode = getChild(svc, key);
      if (refNode == null) {
        continue;
      }
      const refs = extractReferences(refNode, key);
      const { line, column } = nodeLineCol(text, findPair(svc, key)?.key);
      for (const ref of refs) {
        if (!serviceNames.has(ref)) {
          const label
            = key === 'network_mode'
              ? `Service "${svcName}" network_mode references undefined service "${ref}"`
              : `Service "${svcName}" ${key} references undefined service "${ref}"`;
          errors.push({
            severity: 'error',
            kind: 'service',
            message: label,
            line,
            column,
            lineText: lineTextOf(text, line),
          });
        }
      }
    }

    // volumes: warn about named volumes that are never declared
    const volumesNode = getChild(svc, 'volumes');
    if (volumesNode != null) {
      const volNodes: Node[] = isSeq(volumesNode)
        ? (volumesNode as YAMLSeq<Node>).items
        : [volumesNode];
      for (const v of volNodes) {
        let source: string | undefined;
        if (isScalar(v)) {
          const raw = String(v.value ?? '');
          const colon = raw.indexOf(':');
          source = (colon === -1 ? raw : raw.slice(0, colon));
        }
        else if (isMap(v)) {
          source = scalarText(getChild(v, 'source'));
        }
        if (!source) {
          continue;
        }
        const looksLikeNamedVolume
          = !source.startsWith('/')
            && !source.startsWith('.')
            && !source.startsWith('~')
            && !source.startsWith('$');
        if (looksLikeNamedVolume && !declaredVolumes.has(source)) {
          const { line, column } = nodeLineCol(text, v);
          warnings.push({
            severity: 'warning',
            kind: 'service',
            message: `Service "${svcName}": named volume "${source}" is not declared under the top-level "volumes" section (Compose will create it).`,
            line,
            column,
            lineText: lineTextOf(text, line),
          });
        }
      }
    }
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}
