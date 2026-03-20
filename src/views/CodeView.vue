<template>
  <section class="code-page">
    <p class="back" @click="goBack">返回上一级</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading">加载中...</p>

    <div v-else class="code-layout">
      <div>
        <h2>代码</h2>
        <div v-if="codeFiles.length === 0">暂无源码</div>
        <div v-else class="code-files">
          <div v-for="file in codeFiles" :key="file.key" class="code-file">
            <div class="code-file-header">
              <span class="code-file-name">{{ file.filename }}</span>
              <span class="code-file-language">{{ file.language }}</span>
            </div>
            <pre><code class="hljs" v-html="file.highlighted"></code></pre>
          </div>
        </div>
      </div>
      <div class="markdown" v-html="problemHtml"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import xml from 'highlight.js/lib/languages/xml'
import { marked } from 'marked'
import { onMounted, ref, watch } from 'vue'
import type { Problem, ProblemSourceFile } from '@/utils/types'

interface Prop {
  data: Problem
  goBack: () => void
}

const props = defineProps<Prop>()

// Legacy markdown uses ```in / ```out fences for sample IO; register no-op languages to avoid warnings.
hljs.registerLanguage('in', () => ({ name: 'in', contains: [] }))
hljs.registerLanguage('out', () => ({ name: 'out', contains: [] }))
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)

marked.setOptions({
  gfm: true,
  breaks: false,
})

const loading = ref(false)
const error = ref('')
const problemHtml = ref('')
const codeFiles = ref<
  {
    key: string
    filename: string
    language: string
    highlighted: string
  }[]
>([])

function renderMarkdown(md: string) {
  const html = marked.parse(md, { async: false }) as string
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  wrapper.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el as HTMLElement)
  })
  return wrapper.innerHTML
}

function normalizeLanguage(language?: string) {
  if (!language) return ''
  const normalized = language.trim().toLowerCase()
  if (normalized === 'js') return 'javascript'
  if (normalized === 'py') return 'python'
  if (normalized === 'htm') return 'html'
  return normalized
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

function highlightCode(content: string, language?: string) {
  const normalized = normalizeLanguage(language)
  if (normalized && hljs.getLanguage(normalized)) {
    return hljs.highlight(content, { language: normalized }).value
  }
  return hljs.highlightAuto(content).value
}

function buildCodeFiles(files: ProblemSourceFile[]) {
  return files.map((file, index) => {
    const filename = formatFilename(file.filename, file.language)
    const content = typeof file.code === 'string' ? file.code : ''
    return {
      key: `${index}-${filename}`,
      filename,
      language: formatLanguageLabel(file.language),
      highlighted: highlightCode(content, file.language),
    }
  })
}

async function loadCodePage() {
  problemHtml.value = renderMarkdown(
    (props.data.description ?? '').replaceAll('$$\\le$$', '≤').replaceAll('$$<$$', '<'),
  )
  const files = props.data.content
  codeFiles.value = buildCodeFiles(files)
}

watch(
  () => props.data,
  () => {
    loadCodePage()
  },
)
</script>
