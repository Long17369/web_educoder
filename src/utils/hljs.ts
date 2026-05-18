import hljs from 'highlight.js/lib/core'
import type { LanguageFn } from 'highlight.js'

// Legacy markdown uses ```in / ```out fences for sample IO; register no-op languages to avoid warnings.
hljs.registerLanguage('in', () => ({ name: 'in', contains: [] }))
hljs.registerLanguage('out', () => ({ name: 'out', contains: [] }))

// 语言名称 -> 动态 import 加载器（按需加载，减小初始包体积）
const languageLoaders: Record<string, () => Promise<{ default: LanguageFn }>> = {
  java: () => import('highlight.js/lib/languages/java'),
  python: () => import('highlight.js/lib/languages/python'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  css: () => import('highlight.js/lib/languages/css'),
  xml: () => import('highlight.js/lib/languages/xml'),
  html: () => import('highlight.js/lib/languages/xml'),
  sql: () => import('highlight.js/lib/languages/sql'),
  c: () => import('highlight.js/lib/languages/c'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
}

// 已加载的语言缓存，避免重复 import
const loadedLanguages = new Set<string>()

function normalizeLanguage(language?: string) {
  if (!language) return ''
  const normalized = language.trim().toLowerCase()
  if (normalized === 'js') return 'javascript'
  if (normalized === 'py') return 'python'
  if (normalized === 'htm') return 'html'
  return normalized
}

async function loadLanguage(language: string): Promise<boolean> {
  const normalized = normalizeLanguage(language)
  if (!normalized) return false
  // 已注册则跳过
  if (loadedLanguages.has(normalized) || hljs.getLanguage(normalized)) {
    loadedLanguages.add(normalized)
    return true
  }
  const loader = languageLoaders[normalized]
  if (!loader) return false
  try {
    const mod = await loader()
    hljs.registerLanguage(normalized, mod.default)
    loadedLanguages.add(normalized)
    return true
  } catch {
    return false
  }
}

function getLanguageExtension(language?: string) {
  switch (normalizeLanguage(language)) {
    case 'java':
      return 'java'
    case 'python':
      return 'py'
    case 'javascript':
      return 'js'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'c':
      return 'c'
    default:
      return 'txt'
  }
}

function formatFilename(filename: string | undefined, language?: string) {
  const trimmed = filename?.trim()
  if (trimmed) return trimmed
  return `main.${getLanguageExtension(language)}`
}

function formatLanguageLabel(language: string | undefined) {
  const normalized = normalizeLanguage(language)
  if (!normalized) return 'text'
  if (normalized === 'html') return 'HTML'
  if (normalized === 'css') return 'CSS'
  if (normalized === 'javascript') return 'JavaScript'
  if (normalized === 'python') return 'Python'
  if (normalized === 'java') return 'Java'
  return normalized
}

async function highlightCode(content: string, language?: string) {
  const normalized = normalizeLanguage(language)
  if (normalized) {
    await loadLanguage(normalized)
    if (hljs.getLanguage(normalized)) {
      return hljs.highlight(content, { language: normalized }).value
    }
  }
  return hljs.highlightAuto(content).value
}

export { hljs, formatFilename, formatLanguageLabel, highlightCode, loadLanguage }
