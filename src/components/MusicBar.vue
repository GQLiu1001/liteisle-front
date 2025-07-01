<template>
  <!-- 浮动音乐栏 - 与内容区域对齐 -->
  <div 
    class="fixed bottom-0 left-[150px] right-0 z-20 px-6"
    @mouseenter="showMusicBar"
    @mouseleave="hideMusicBar"
  >
    <!-- 音乐栏指示器 - 固定在屏幕最底边 -->
    <div 
      class="absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-300"
      :class="isVisible ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100'"
    >
      <div class="w-12 h-4 bg-morandi-300/80 hover:bg-morandi-400/80 rounded-t-md flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm">
        <ChevronUp :size="12" class="text-morandi-700" />
      </div>
    </div>
    
    <!-- 完整音乐栏 -->
    <div 
      class="bg-liteisle-sidebar rounded-t-[40px] shadow-xl border border-morandi-300 border-b-0 px-8 py-4 backdrop-blur-sm transition-all duration-300 ease-out"
      :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
    >
      <div class="flex items-center justify-between">
        <!-- 左侧区域 - 音乐信息 -->
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-teal-500 rounded-2xl flex items-center justify-center">
            <Music :size="24" class="text-white" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-morandi-900 truncate">{{ currentTrack.name }}</p>
            <p class="text-sm text-morandi-700">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</p>
          </div>
        </div>

        <!-- 中间区域 - 主要播放控制 -->
        <div class="flex items-center gap-3">
          <button @click="previousTrack" class="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors">
            <SkipBack :size="20" />
          </button>
          
          <button @click="togglePlay" class="w-12 h-12 rounded-full bg-white text-morandi-800 flex items-center justify-center hover:shadow-lg transition-all duration-200">
            <Play v-if="!isPlaying" :size="20" />
            <Pause v-else :size="20" />
          </button>
          
          <button @click="nextTrack" class="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors">
            <SkipForward :size="20" />
          </button>
        </div>

        <!-- 右侧区域 - 其他控制按钮 -->
        <div class="flex items-center gap-3 flex-1 justify-end">
          <button @click="toggleMute" class="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors">
            <Volume2 v-if="!isMuted" :size="20" />
            <VolumeX v-else :size="20" />
          </button>
          
          <button @click="toggleRepeat" class="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors" :class="{ 'bg-white/60': isRepeat }">
            <Repeat :size="20" />
          </button>
          
          <button @click="togglePlaylist" class="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors">
            <List :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, List, ChevronUp } from 'lucide-vue-next'

// 音乐播放状态
const isPlaying = ref(false)
const isMuted = ref(false)
const isRepeat = ref(false)
const currentTime = ref(90) // 秒
const duration = ref(212) // 秒
const currentTrack = ref({
  name: '音乐名称',
  artist: '艺术家'
})

// 音乐栏显示状态
const isVisible = ref(false)
let hideTimeout: NodeJS.Timeout | null = null

let progressInterval: NodeJS.Timeout | null = null

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 音乐栏交互
const showMusicBar = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  isVisible.value = true
}

const hideMusicBar = () => {
  hideTimeout = setTimeout(() => {
    isVisible.value = false
  }, 500) // 500ms延迟，避免快速移入移出闪烁
}

// 播放控制
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startProgress()
  } else {
    stopProgress()
  }
}

const previousTrack = () => {
  console.log('上一首')
  currentTime.value = 0
}

const nextTrack = () => {
  console.log('下一首')
  currentTime.value = 0
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const toggleRepeat = () => {
  isRepeat.value = !isRepeat.value
}

const togglePlaylist = () => {
  console.log('显示播放列表')
}

// 进度控制
const startProgress = () => {
  progressInterval = setInterval(() => {
    if (currentTime.value < duration.value) {
      currentTime.value++
    } else {
      if (isRepeat.value) {
        currentTime.value = 0
      } else {
        isPlaying.value = false
        stopProgress()
      }
    }
  }, 1000)
}

const stopProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

onUnmounted(() => {
  stopProgress()
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script> 