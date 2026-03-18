<template>
  <section class="code-page">
    <p class="back" @click="goBack">返回上一级</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading">加载中...</p>

    <div v-else class="code-layout">
      <div>
        <h2>代码</h2>
        <div class="markdown" v-html="codeHtml"></div>
      </div>
      <div class="markdown" v-html="problemHtml"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import hljs from 'highlight.js'
import { marked } from 'marked'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

hljs.registerLanguage('in', () => ({ name: 'in', contains: [] }))
hljs.registerLanguage('out', () => ({ name: 'out', contains: [] }))

marked.setOptions({
  gfm: true,
  breaks: false,
})

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const problemHtml = ref('')
const codeHtml = ref('')

function renderMarkdown(md: string) {
  const html = marked.parse(md, { async: false }) as string
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  wrapper.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el as HTMLElement)
  })
  return wrapper.innerHTML
}

async function loadCodePage() {
  const type = typeof route.query.type === 'string' ? route.query.type : ''
  const problems = typeof route.query.problems === 'string' ? route.query.problems : ''
  const problem = typeof route.query.problem === 'string' ? route.query.problem : ''

  if (!type || !problems || !problem) {
    router.replace({ name: 'home' })
    return
  }

  loading.value = true
  error.value = ''

  try {
    const base = `/${type}/${problems}/code/${problem}`
    const [problemRes, codeRes] = await Promise.all([
      fetch(`${base}.cont.md`),
      fetch(`${base}.code.md`),
    ])

    if (!problemRes.ok || !codeRes.ok) {
      throw new Error('题目内容不存在')
    }

    const [problemMd, codeMd] = await Promise.all([problemRes.text(), codeRes.text()])
    problemHtml.value = renderMarkdown(problemMd.replaceAll('$$\\le$$', '≤').replaceAll('$$<$$', '<'))
    codeHtml.value = renderMarkdown(codeMd)
  } catch (e) {
    problemHtml.value = ''
    codeHtml.value = ''
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(loadCodePage)
watch(
  () => route.fullPath,
  () => {
    loadCodePage()
  },
)
</script>
