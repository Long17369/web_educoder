<template>
  <div class="page">
    <header>
      <h1>{{ title }}</h1>
      <nav>
        <RouterLink to="/">首页</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer>
      <p>&copy; 2026 My Web Page</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => {
  if (route.name === 'home') return '欢迎访问educoder!'
  const titleParam = route.params.title
  const problems = route.params.problems
  const type = route.params.type
  if (typeof titleParam === 'string' && titleParam.length > 0) return titleParam
  if (typeof problems === 'string' && problems.length > 0) return problems
  if (typeof type === 'string' && type.length > 0) return type
  return 'educoder'
})
</script>
