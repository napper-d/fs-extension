import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { test, expect } from "@playwright/test"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, "..", "..", "routed-anecdotes", "src")

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    if (/\.jsx?$/.test(entry.name)) return [full]
    return []
  })

const allFiles = walk(srcDir).map((file) => ({
  file: path.relative(srcDir, file),
  source: fs.readFileSync(file, "utf-8"),
}))

// pulls out the body of a `const name = (...) => { ... }` / `function name(...) { ... }`
// declaration by matching braces, so the check doesn't depend on how the body is written
const extractFunctionBody = (source, name) => {
  const defMatch = source.match(
    new RegExp(`(?:const|function)\\s+${name}\\s*=?[^{]*`),
  )
  if (!defMatch) return null
  const braceStart = source.indexOf(
    "{",
    defMatch.index + defMatch[0].length - 1,
  )
  if (braceStart === -1) return null

  let depth = 0
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === "{") depth++
    if (source[i] === "}") {
      depth--
      if (depth === 0) return source.slice(braceStart, i + 1)
    }
  }
  return source.slice(braceStart)
}

// the file that actually defines the hook, wherever it lives
const hookDefiners = allFiles.filter(
  ({ source }) =>
    /(?:const|function)\s+useAnecdotes\s*[=(]/.test(source) &&
    /export/.test(source),
)

// every other file, which may or may not consume the hook - not assumed in advance
const otherFiles = allFiles.filter((f) => !hookDefiners.includes(f))

test.describe("anecdote handling goes through a custom useAnecdotes hook", () => {
  test("exactly one module defines the useAnecdotes hook", () => {
    expect(hookDefiners.length).toBe(1)
  })

  test("useAnecdotes fetches all anecdotes on mount", () => {
    const { source } = hookDefiners[0]
    expect(source).toMatch(/useEffect\s*\(/)
    expect(source).toMatch(/\.getAll\s*\(/)
  })

  test("useAnecdotes exposes addAnecdote, which sends the new anecdote to the server and updates local state", () => {
    const { source } = hookDefiners[0]
    const body = extractFunctionBody(source, "addAnecdote")
    expect(body, "addAnecdote should be defined in the hook").toBeTruthy()
    expect(body).toMatch(/\.createNew\s*\(/)
    // some state setter is invoked afterwards - not assuming concat or any specific method
    expect(body).toMatch(/\bset[A-Z]\w*\s*\(/)
  })

  test("useAnecdotes exposes deleteAnecdote, which removes the anecdote from the server and updates local state", () => {
    const { source } = hookDefiners[0]
    const body = extractFunctionBody(source, "deleteAnecdote")
    expect(body, "deleteAnecdote should be defined in the hook").toBeTruthy()
    expect(body).toMatch(/\.remove\s*\(/)
    // some state setter is invoked afterwards - not assuming filter or any specific method
    expect(body).toMatch(/\bset[A-Z]\w*\s*\(/)
  })

  test("no other file talks to the anecdotes service directly - server communication stays inside the hook", () => {
    for (const { file, source } of otherFiles) {
      expect(
        source,
        `${file} should not import the anecdotes service directly`,
      ).not.toMatch(/from\s*['"].*services\/anecdotes['"]/)
    }
  })

  test("some part of the app consumes useAnecdotes rather than managing anecdote state itself", () => {
    const consumers = otherFiles.filter(({ source }) =>
      /useAnecdotes\s*\(/.test(source),
    )
    expect(consumers.length).toBeGreaterThan(0)
  })

  test("some part of the app calls addAnecdote from the hook", () => {
    const callers = otherFiles.filter(({ source }) =>
      /(?<!use)\baddAnecdote\s*\(/.test(source),
    )
    expect(callers.length).toBeGreaterThan(0)
  })

  test("some part of the app calls deleteAnecdote from the hook", () => {
    // deleteAnecdote may be wired to a button directly, or via an intermediate
    // handler function - only checking that it's called somewhere, not how
    const callers = otherFiles.filter(({ source }) =>
      /(?<!use)\bdeleteAnecdote\s*\(/.test(source),
    )
    expect(callers.length).toBeGreaterThan(0)
  })

  test("some part of the app renders a delete button for each anecdote in the list", () => {
    const rendersButtonPerAnecdote = otherFiles.some(({ source }) =>
      /\.map\s*\([^)]*=>[\s\S]*?<button[\s\S]*?<\/button>[\s\S]*?\)\)?\}/.test(
        source,
      ),
    )
    expect(rendersButtonPerAnecdote).toBe(true)
  })
})
