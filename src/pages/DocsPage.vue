<template>
  <div class="min-h-full bg-morandi-50 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="card">
        <div class="flex items-center justify-center h-96 text-morandi-500">
          <div class="text-center">
            <FileText :size="64" class="mx-auto mb-4 opacity-50" />
            <h2 class="text-2xl font-bold mb-2">文档管理</h2>
            <p class="text-lg">文档功能正在开发中...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
</script> 