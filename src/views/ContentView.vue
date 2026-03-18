<template>
  <section>
    <p class="back" @click="goBack">返回上一级</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading">加载中...</p>

    <ul v-else>
      <li v-for="item in items" :key="item.value">
        <button type="button" @click="goNext(item.value)">{{ item.label }}</button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ProblemSetData } from '../utils/types'

interface ListItem {
  label: string
  value: string
}

const route = useRoute()
const router = useRouter()
const items = ref<ListItem[]>([])
const loading = ref(false)
const error = ref('')

async function loadData() {
  const type = typeof route.query.type === 'string' ? route.query.type : ''
  const problems = typeof route.query.problems === 'string' ? route.query.problems : ''

  if (!type) {
    router.replace({ name: 'home' })
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (!problems) {
      const res = await fetch(`/${type}/data.json`)
      if (!res.ok) throw new Error('加载目录失败')
      const data = (await res.json()) as string[]
      items.value = data.map((name) => ({ label: name, value: name }))
    } else {
      const res = await fetch(`/${type}/${problems}/data.json`)
      if (!res.ok) throw new Error('加载题目失败')
      const data = (await res.json()) as ProblemSetData
      items.value = data.content.map((problem) => ({
        label: `${problem.proid}.${problem.title}`,
        value: `${problem.id}::${problem.title}`,
      }))
    }
  } catch (e) {
    items.value = []
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function goNext(value: string) {
  const type = typeof route.query.type === 'string' ? route.query.type : ''
  const problems = typeof route.query.problems === 'string' ? route.query.problems : ''

  if (!problems) {
    router.push({ name: 'content', query: { type, problems: value } })
    return
  }

  const [problem, title] = value.split('::')
  router.push({
    name: 'code',
    query: {
      type,
      problems,
      problem,
      title,
    },
  })
}

function goBack() {
  router.back()
}

onMounted(loadData)
watch(
  () => route.fullPath,
  () => {
    loadData()
  },
)
</script>
