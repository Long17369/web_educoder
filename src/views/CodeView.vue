<template>
  <section class="code-page">
    <p class="back" @click="goBack">返回上一级</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading">加载中...</p>

    <div v-else class="code-layout">
      <div class="markdown-container">
        <h2 class="section-title">题目描述</h2>
        <div ref="problemDOM" class="markdown markdown-body"></div>
      </div>
      <div class="code-container">
        <h2 class="section-title">代码</h2>
        <div v-if="codeFiles.length === 0" class="empty-state">暂无源码</div>
        <div v-else class="code-files">
          <div v-for="file in codeFiles" :key="file.key" class="code-file">
            <div class="code-file-header">
              <span class="code-file-name">{{ file.filename }}</span>
              <div class="code-file-header-right">
                <span class="code-file-language">{{ file.language }}</span>
                <button class="copy-btn" @click="copyCode(file)">
                  {{ file.copied ? '已复制!' : '复制' }}
                </button>
              </div>
            </div>
            <pre><code class="hljs" v-html="file.highlighted"></code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from '../utils/hljs'
// @ts-expect-error No types for markdown-it-katex
import markdownItKatex from 'markdown-it-katex'
import MarkdownItHighlight from 'markdown-it-highlightjs'
import { computed, nextTick, ref, watch } from 'vue'
import type { Problem } from '@/utils/types'

import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown-light.css'

interface Prop {
  data: Problem
  goBack: () => void
}

const props = defineProps<Prop>()

const mdParser = new MarkdownIt({
  html: true,
  breaks: false,
})

mdParser.use(markdownItKatex, {
  throwOnError: false,
})

mdParser.use(MarkdownItHighlight, {
  auto: false,
  code: false,
  hljs: hljs,
})

const loading = ref(false)
const error = ref('')

const codeFiles = computed(() => {
  const files = props.data.content
  return files.map((file, index) => {
    const filename = formatFilename(file.filename, file.language)
    const content = typeof file.code === 'string' ? file.code : ''
    return {
      key: `${index}-${filename}`,
      filename,
      language: formatLanguageLabel(file.language),
      highlighted: highlightCode(content, file.language),
      rawCode: content,
      copied: false,
    }
  })
})

const problemDOM = ref<HTMLElement | null>(null)

// 处理文本的函数列表，允许外部注册函数来修改解析前的文本内容
const handleText = ref<((arg0: string) => string)[]>([])
function add_handle_text(handle: (arg0: string) => string) {
  handleText.value.push(handle)
}

// 处理 DOM 的函数列表，允许外部注册函数来修改解析后的 DOM 结构
const handleDOM = ref<((arg0: HTMLElement) => HTMLElement | void)[]>([])
function add_handle_DOM(handle: (arg0: HTMLElement) => HTMLElement | void) {
  handleDOM.value.push(handle)
}

watch(
  props.data,
  async () => {
    // 等待 DOM 更新完成，确保 problemDOM 已经正确绑定到元素上
    await nextTick()

    console.log('Problem data changed, updating description...')
    if (problemDOM.value === null) throw new Error('problemDOM is null')
    let description = props.data.description ?? ''

    // 依次调用所有文本处理函数，允许它们修改描述文本
    for (const handle of handleText.value) {
      description = handle(description)
    }

    // 将处理后的 Markdown 转换为 HTML，并解析成 DOM 结构
    const html = mdParser.render(description)
    const parser = new DOMParser()
    const DOM = parser.parseFromString(html, 'text/html')

    // 依次调用所有 DOM 处理函数，允许它们修改解析后的 DOM 结构
    for (const handle of handleDOM.value) {
      handle(DOM.documentElement)
    }

    if (problemDOM.value.children.length === 0) {
      problemDOM.value.appendChild(DOM.body)
    } else {
      problemDOM.value.children[0].replaceWith(...DOM.body.children)
    }
  },
  { immediate: true },
)

// 修复标题语法错误导致的渲染问题
add_handle_text((text) => {
  return text.replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
})

// 修复表格分隔行缺少列导致的渲染问题
add_handle_text((md) => {
  return md.replace(
    /(^|\n)([^\n]*\|[^\n]*\n)([^\n]*\|?[\-:][\|\-\s:]*)(?=\n|$)/g,
    (match, nl, header, sep) => {
      const headerCols = (header.match(/\|/g) || []).length - 1
      const sepCols = (sep.match(/\|/g) || []).length - 1
      if (headerCols > sepCols) {
        return nl + header + sep.trimEnd() + '-|'.repeat(headerCols - sepCols)
      }
      return match
    },
  )
})

// 修复图片链接和添加 referrerpolicy 属性
add_handle_DOM((DOM) => {
  const images = DOM.querySelectorAll('img')
  images.forEach((img) => {
    if (!img.hasAttribute('referrerpolicy')) {
      img.setAttribute('referrerpolicy', 'no-referrer')
    }
    const url = img.getAttribute('src') || ''
    if (url.startsWith('~/')) {
      img.setAttribute('src', `https://images.ptausercontent.com/${url.slice(1)}`)
    }
  })
})

async function copyCode(file: { rawCode: string; copied: boolean }) {
  try {
    await navigator.clipboard.writeText(file.rawCode)
    file.copied = true
    setTimeout(() => {
      file.copied = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
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

console.log('table_open:', mdParser.renderer.rules.table_open)
</script>
