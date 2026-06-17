<template>
  <div class="page">
    <header>
      <h1>{{ data.title }}</h1>
      <nav>
        <RouterLink to="/">首页</RouterLink>
      </nav>
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索题目或题库..."
          class="search-input"
          @input="onSearchInput"
          @focus="onSearchFocus"
          @keydown.escape="closeSearch"
          @keydown.enter="selectFirstResult"
        />
        <div v-if="searching" class="search-progress">
          <div class="search-progress-bar" :style="{ width: searchProgress + '%' }"></div>
        </div>
        <ul v-if="searchResults.length > 0 && showResults" class="search-results">
          <li
            v-for="result in searchResults"
            :key="result.path"
            class="search-result-item"
            @click="navigateTo(result)"
            @mouseenter="highlightedIndex = -1"
          >
            <span class="search-result-title">{{ result.title }}</span>
            <span class="search-result-path">ID路径: {{ result.path }}</span>
            <span class="search-result-titlepath">Title路径: {{ result.titlePath }}</span>
          </li>
        </ul>
      </div>
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
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchData } from './fetchData'
import type { DataFile } from './utils/types'
import { searchAll, type SearchResult } from './utils/search'

const ContentView = defineAsyncComponent(() => import('./views/ContentView.vue'))
const CodeView = defineAsyncComponent(() => import('./views/CodeView.vue'))

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

// 搜索相关
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const showResults = ref(false)
const searching = ref(false)
const searchProgress = ref(0)
const highlightedIndex = ref(-1)
let searchDebounceTimer: number | null = null
let currentSearchAbort: (() => void) | null = null

async function loadSearchIndex() {
  const currentPath = route.path.split('/').filter((p) => p)

  // 取消上一次搜索
  if (currentSearchAbort) {
    currentSearchAbort()
    currentSearchAbort = null
  }

  searchResults.value = []
  searching.value = true
  searchProgress.value = 0
  let aborted = false
  currentSearchAbort = () => {
    aborted = true
  }

  const lowerQuery = searchQuery.value.toLowerCase().trim()

  await searchAll(
    currentPath,
    (result) => {
      if (aborted) return

      // 边搜索边过滤显示
      if (
        result.title.toLowerCase().includes(lowerQuery) ||
        result.id.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.value = [...searchResults.value, result].slice(0, 20)
      }
    },
    (ratio: number) => {
      if (aborted) return
      searchProgress.value = Math.round(ratio * 100)
    },
    () => aborted,
  )

  searching.value = false
  currentSearchAbort = null
}

function onSearchInput() {
  // 取消上一次 debounce
  if (searchDebounceTimer !== null) {
    clearTimeout(searchDebounceTimer)
  }
  // 取消正在进行的后台搜索任务
  if (currentSearchAbort) {
    currentSearchAbort()
    currentSearchAbort = null
  }

  searchDebounceTimer = setTimeout(() => {
    const query = searchQuery.value.trim()
    if (query) {
      showResults.value = true
      loadSearchIndex()
    } else {
      searchResults.value = []
      showResults.value = false
    }
  }, 200)
}

function onSearchFocus() {
  if (searchQuery.value.trim()) {
    showResults.value = true
  }
}

function closeSearch() {
  showResults.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function navigateTo(result: SearchResult) {
  closeSearch()
  router.push('/' + result.path)
}

function selectFirstResult() {
  if (searchResults.value.length > 0 && highlightedIndex.value >= 0) {
    navigateTo(searchResults.value[highlightedIndex.value])
  }
}

// 点击外部关闭搜索结果
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.search-container')) {
    showResults.value = false
  }
}

// 监听路由变化
watch(route, async () => {
  loadData()
  closeSearch()
  // 取消正在进行的搜索任务
  if (currentSearchAbort) {
    currentSearchAbort()
    currentSearchAbort = null
  }
})

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>
