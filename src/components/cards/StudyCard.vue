<template>
  <div class="card h-full flex flex-col justify-center w-full">
    <div class="flex flex-col items-center text-center">
      <div class="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-teal-400 to-blue-500 rounded-3xl flex items-center justify-center mb-4 lg:mb-6">
        <Clock :size="28" class="text-white lg:hidden" />
        <Clock :size="36" class="text-white hidden lg:block" />
      </div>
      <div>
        <h3 class="text-lg lg:text-xl font-semibold text-morandi-900 mb-2 lg:mb-3">累计学习</h3>
        <p class="text-3xl lg:text-4xl font-bold text-morandi-800">{{ formattedTotalTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useFocusStore } from '@/store/FocusStore'
import { storeToRefs } from 'pinia'

const focusStore = useFocusStore()
const { formattedTotalTime, formattedCurrentTime, currentStudyTime } = storeToRefs(focusStore)

// 今日学习进度（假设目标是2小时=120分钟）
const todayProgress = computed(() => {
  const todayTarget = 120 // 分钟
  const progress = Math.min((currentStudyTime.value / todayTarget) * 100, 100)
  return Math.round(progress)
})
</script> 