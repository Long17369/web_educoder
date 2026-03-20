<template>
  <div class="page">
    <header>
      <h1>{{ data.title }}</h1>
      <nav>
        <RouterLink to="/">首页</RouterLink>
      </nav>
    </header>

    <main v-if="loading === true">加载中</main>

    <main v-else>
      <ContentView
        v-if="data.type === 'problemSet'"
        :data="data"
        :go-back="goBack"
        :add-path="addPath"
        :key="data.title + '@ProblemSet'"
      />
      <CodeView
        v-else-if="data.type === 'problem'"
        :data="data"
        :go-back="goBack"
        :key="data.title + '@Problem'"
      />
    </main>

    <footer>
      <p>&copy; 2026 My Web Page</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchData } from './fetchData'
import type { DataFile } from './utils/types'
import ContentView from './views/ContentView.vue'
import CodeView from './views/CodeView.vue'

const route = useRoute()
const router = useRouter()

const _loading = ref<boolean>(false)
let _loadingTimer: number | null = null

const loading = computed({
  get() {
    return _loading.value
  },
  set(value) {
    if (_loadingTimer !== null) {
      clearTimeout(_loadingTimer)
      _loadingTimer = null
    }
    if (value === false) {
      _loading.value = false
      return
    }
    _loadingTimer = setTimeout(() => {
      _loading.value = value
    }, 300)
  },
})

async function loadData() {
  loading.value = true
  data.value = await fetchData(route.path.split('/'))
  loading.value = false
}

async function addPath(id: string) {
  const newPath = [...route.path.split('/').filter((p) => p), id].join('/')
  router.push('/' + newPath)
}

async function goBack() {
  const paths = route.path.split('/').filter((p) => p)
  if (paths.length === 0) return
  const newPath = paths.slice(0, -1).join('/')
  router.push('/' + newPath)
}

const data = ref<DataFile>({
  type: 'problemSet',
  title: 'home',
  content: [],
})

watch(route, async () => {
  loadData()
})
</script>
