<template>
  <section>
    <p class="back" @click="goBack">返回上一级</p>

    <ul class="content-items">
      <li v-for="item in items" :key="item.id" @click="props.addPath(item.id)" class="content-item">
        {{ item.label }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { ProblemSet } from '@/utils/types'
import { computed } from 'vue'

interface Prop {
  data: ProblemSet
  addPath: (id: string) => void
  goBack: () => void
}

const props = defineProps<Prop>()

const items = computed(() => {
  if (props.data.type === 'problemSet') {
    return props.data.content.map((child) => ({
      id: child.id,
      label: child.title,
    }))
  }
  return []
})
</script>
