<template>
  <ul>
    <li>
      <button type="button" @click="goType('头歌')">头歌</button>
    </li>
    <li>
      <button type="button" @click="goType('pta')">PTA</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goType(type: string) {
  router.push({ name: 'content', params: { type } })
}
</script>
