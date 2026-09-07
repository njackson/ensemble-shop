import { mkdirSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { join } from 'node:path'

// One trace per run, OpenTelemetry-shaped (Module 12): a root span per run, a child span per model
// call, a grandchild per tool call, and the dimensions on the root that let "what is different about
// the bad runs?" be a query. Written as JSON so the shop has no telemetry backend to install; the
// shape is the SDK's, so swapping this writer for the OTel SDK changes nothing above it.
export type Span = {
  traceId: string; spanId: string; parentSpanId?: string
  name: string; kind: 'run' | 'model_call' | 'tool_call'
  startTime: string; endTime?: string; durationMs?: number
  attributes: Record<string, unknown>
}

export type Trace = { traceId: string; spans: Span[] }

export function startTrace(name: string, attributes: Record<string, unknown>) {
  const traceId = randomBytes(8).toString('hex')
  const spans: Span[] = []
  const open = (kind: Span['kind'], n: string, attrs: Record<string, unknown>, parent?: string): Span => {
    const s: Span = { traceId, spanId: randomBytes(4).toString('hex'), parentSpanId: parent, name: n, kind, startTime: new Date().toISOString(), attributes: attrs }
    spans.push(s)
    return s
  }
  const close = (s: Span, attrs: Record<string, unknown> = {}) => {
    s.endTime = new Date().toISOString()
    s.durationMs = Date.parse(s.endTime) - Date.parse(s.startTime)
    Object.assign(s.attributes, attrs)
  }
  const root = open('run', name, attributes)
  return {
    traceId,
    root,
    child: (kind: Exclude<Span['kind'], 'run'>, n: string, attrs: Record<string, unknown>, parent: Span = root) => open(kind, n, attrs, parent.spanId),
    close,
    end: (attrs: Record<string, unknown>): Trace => { close(root, attrs); return { traceId, spans } },
  }
}

export type TraceWriter = { write(t: Trace): string | undefined }

export function fileTraceWriter(dir = 'runs'): TraceWriter {
  return {
    write(t) {
      mkdirSync(dir, { recursive: true })
      const path = join(dir, `${t.traceId}.json`)
      writeFileSync(path, JSON.stringify(t, null, 2))
      return path
    },
  }
}

export const nullTraceWriter: TraceWriter = { write: () => undefined }

// Rough cost, for the cost.usd dimension: a defect indicator before it is an expense.
export function costUsd(modelId: string, usage: { input: number; output: number }): number {
  const perMillion: Record<string, [number, number]> = { 'claude-sonnet-5': [3, 15], 'claude-opus-5': [15, 75], 'claude-haiku-4-5-20251001': [1, 5] }
  const [i, o] = perMillion[modelId] ?? [0, 0]
  return (usage.input * i + usage.output * o) / 1_000_000
}
