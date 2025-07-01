<template>
  <div class="min-h-full bg-morandi-50 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="card">
        <div class="flex items-center justify-center h-96 text-morandi-500">
          <div class="text-center">
            <Settings :size="64" class="mx-auto mb-4 opacity-50" />
            <h2 class="text-2xl font-bold mb-2">系统设置</h2>
            <p class="text-lg">设置功能正在开发中...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
</script> 