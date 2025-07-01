<template>
  <div class="min-h-full bg-liteisle-bg p-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        <!-- 左侧播放列表导航 -->
        <div class="col-span-3">
          <div class="card h-full">
            <!-- 搜索框 -->
            <div class="mb-6">
              <input
                v-model="musicStore.searchQuery"
                placeholder="搜索音乐..."
                class="w-full px-4 py-2 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <!-- 播放列表 -->
            <div class="space-y-2">
              <h3 class="text-lg font-bold text-morandi-900 mb-4">播放列表</h3>
              <div
                v-for="playlist in musicStore.playlists"
                :key="playlist.id"
                @click="selectPlaylist(playlist)"
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  musicStore.currentPlaylist?.id === playlist.id 
                    ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                    : 'hover:bg-morandi-100'
                ]"
              >
                <HardDrive :size="20" class="text-blue-500" />
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ playlist.name }}</p>
                  <p class="text-sm text-morandi-500">{{ playlist.tracks.length }} 首歌曲</p>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="musicStore.playlists.length === 0" class="text-center py-8">
                <Music :size="32" class="mx-auto mb-3 text-morandi-400" />
                <p class="text-sm text-morandi-500">暂无播放列表</p>
                <p class="text-xs text-morandi-400 mt-1">请先在云盘中上传音乐文件</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间歌曲列表 -->
        <div class="col-span-6">
          <div class="card h-full flex flex-col">
            <!-- 列表头部 -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-morandi-900">
                  {{ musicStore.currentPlaylist?.name || '选择播放列表' }}
                </h2>
                <p class="text-sm text-morandi-500">
                  {{ filteredTracks.length }} 首歌曲
                </p>
              </div>

              <!-- 列表操作 -->
              <div v-if="musicStore.currentPlaylist" class="flex items-center gap-3">
                <button
                  @click="playAll"
                  class="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <Music :size="16" />
                  播放全部
                </button>
              </div>
            </div>

            <!-- 歌曲列表 -->
            <div class="flex-1 overflow-auto">
              <div v-if="filteredTracks.length > 0" class="space-y-1">
                <div
                  v-for="(track, index) in filteredTracks"
                  :key="track.id"
                  @click="playTrack(index)"
                  @dblclick="playTrackImmediately(index)"
                  :class="[
                    'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 group',
                    musicStore.currentTrack?.id === track.id 
                      ? 'bg-teal-100 border border-teal-300' 
                      : 'hover:bg-morandi-50'
                  ]"
                >
                  <!-- 序号 / 播放状态 -->
                  <div class="w-8 text-center">
                    <span 
                      v-if="musicStore.currentTrack?.id !== track.id"
                      class="text-sm text-morandi-500 group-hover:hidden"
                    >
                      {{ index + 1 }}
                    </span>
                    <Music 
                      v-else-if="musicStore.isPlaying"
                      :size="16" 
                      class="text-teal-600 animate-pulse" 
                    />
                    <Music 
                      v-else
                      :size="16" 
                      class="text-teal-600" 
                    />
                    <button 
                      class="hidden group-hover:block text-teal-600 hover:text-teal-700"
                      @click.stop="playTrackImmediately(index)"
                    >
                      <Music :size="16" />
                    </button>
                  </div>

                  <!-- 歌曲信息 -->
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-morandi-900 truncate">{{ track.name }}</p>
                    <p class="text-sm text-morandi-500 truncate">{{ track.artist }}</p>
                  </div>

                  <!-- 歌曲时长 -->
                  <div class="text-sm text-morandi-500">
                    {{ musicStore.formatTime(track.duration) }}
                  </div>

                  <!-- 操作按钮 -->
                  <div class="hidden group-hover:flex items-center gap-2">
                    <button
                      @click.stop="addToFavorites(track)"
                      class="p-1 text-morandi-400 hover:text-red-500 transition-colors"
                      title="添加到我喜欢的"
                    >
                      <Music :size="16" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <Music :size="48" class="mx-auto mb-4 text-morandi-400" />
                  <h3 class="text-lg font-medium text-morandi-700 mb-2">
                    {{ musicStore.searchQuery ? '未找到匹配的歌曲' : '播放列表为空' }}
                  </h3>
                  <p class="text-morandi-500">
                    {{ musicStore.searchQuery ? '尝试其他搜索词' : '请先选择一个播放列表' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧播放详情 -->
        <div class="col-span-3">
          <div class="card h-full flex flex-col">
            <!-- 专辑封面 -->
            <div class="text-center mb-6">
              <div class="w-48 h-48 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                <Music :size="64" class="text-white" />
              </div>
              <h3 class="font-bold text-morandi-900 truncate">{{ musicStore.currentTrackInfo.name }}</h3>
              <p class="text-sm text-morandi-600 truncate">{{ musicStore.currentTrackInfo.artist }}</p>
            </div>

            <!-- 播放进度 -->
            <div class="mb-6">
              <div class="flex items-center justify-between text-sm text-morandi-500 mb-2">
                <span>{{ musicStore.formatTime(musicStore.currentTime) }}</span>
                <span>{{ musicStore.formatTime(musicStore.duration) }}</span>
              </div>
              <div 
                class="w-full bg-morandi-200 rounded-full h-2 cursor-pointer"
                @click="seekToPosition"
              >
                <div 
                  class="bg-teal-500 h-2 rounded-full transition-all duration-100"
                  :style="{ width: progressPercentage + '%' }"
                ></div>
              </div>
            </div>

            <!-- 播放控制 -->
            <div class="flex items-center justify-center gap-4 mb-6">
              <button
                @click="musicStore.toggleShuffle"
                :class="[
                  'p-2 rounded-full transition-colors',
                  musicStore.isShuffle ? 'bg-teal-500 text-white' : 'text-morandi-600 hover:bg-morandi-100'
                ]"
                title="随机播放"
              >
                <Music :size="20" />
              </button>

              <button
                @click="musicStore.previousTrack"
                class="p-3 rounded-full text-morandi-600 hover:bg-morandi-100 transition-colors"
              >
                <ChevronLeft :size="24" />
              </button>

              <button
                @click="musicStore.togglePlay"
                class="p-4 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                <Music v-if="!musicStore.isPlaying" :size="24" />
                <Music v-else :size="24" />
              </button>

              <button
                @click="musicStore.nextTrack"
                class="p-3 rounded-full text-morandi-600 hover:bg-morandi-100 transition-colors"
              >
                <ChevronRight :size="24" />
              </button>

              <button
                @click="musicStore.toggleRepeat"
                :class="[
                  'p-2 rounded-full transition-colors',
                  musicStore.isRepeat ? 'bg-teal-500 text-white' : 'text-morandi-600 hover:bg-morandi-100'
                ]"
                title="循环播放"
              >
                <Music :size="20" />
              </button>
            </div>

            <!-- 音量控制 -->
            <div class="mb-6">
              <div class="flex items-center gap-3">
                <button
                  @click="musicStore.toggleMute"
                  class="text-morandi-600 hover:text-morandi-800 transition-colors"
                >
                  <Music :size="20" />
                </button>
                <div class="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="musicStore.volume"
                    @input="setVolume"
                    class="w-full h-2 bg-morandi-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <!-- 歌词区域 -->
            <div class="flex-1 overflow-auto">
              <div class="text-center">
                <h4 class="font-medium text-morandi-700 mb-3">歌词</h4>
                <div v-if="musicStore.currentTrackInfo.lyrics" class="text-sm text-morandi-600 leading-relaxed">
                  {{ musicStore.currentTrackInfo.lyrics }}
                </div>
                <div v-else class="text-sm text-morandi-500">
                  暂无歌词
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Music, HardDrive, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useMusicStore } from '../store/MusicStore'

const musicStore = useMusicStore()

// 计算属性
const filteredTracks = computed(() => {
  return musicStore.filteredTracks
})

const progressPercentage = computed(() => {
  if (musicStore.duration === 0) return 0
  return (musicStore.currentTime / musicStore.duration) * 100
})

// 方法
const selectPlaylist = (playlist: any) => {
  musicStore.setCurrentPlaylist(playlist)
}

const playTrack = (index: number) => {
  musicStore.setCurrentTrack(index)
}

const playTrackImmediately = (index: number) => {
  musicStore.setCurrentTrack(index)
  musicStore.play()
}

const playAll = () => {
  if (filteredTracks.value.length > 0) {
    musicStore.setCurrentTrack(0)
    musicStore.play()
  }
}

const addToFavorites = (track: any) => {
  console.log('添加到我喜欢的:', track.name)
  // 这里可以实现添加到收藏的逻辑
}

const seekToPosition = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  const newTime = percentage * musicStore.duration
  musicStore.seek(newTime)
}

const setVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  musicStore.setVolume(parseFloat(target.value))
}

// 模拟加载云盘音乐数据
const loadMusicFromDrive = () => {
  // 模拟从云盘加载的音乐文件夹数据
  const mockMusicFolders = [
    {
      id: 'folder1',
      name: '我喜欢的',
      path: '/音乐/我喜欢的',
      files: [
        { name: 'A.mp3', path: '/音乐/我喜欢的/A.mp3' },
        { name: 'B.mp3', path: '/音乐/我喜欢的/B.mp3' },
        { name: 'C.mp3', path: '/音乐/我喜欢的/C.mp3' }
      ]
    },
    {
      id: 'folder2',
      name: '古典',
      path: '/音乐/古典',
      files: [
        { name: 'Bach - Prelude.mp3', path: '/音乐/古典/Bach - Prelude.mp3' },
        { name: 'Mozart - Sonata.mp3', path: '/音乐/古典/Mozart - Sonata.mp3' },
        { name: 'Chopin - Nocturne.mp3', path: '/音乐/古典/Chopin - Nocturne.mp3' }
      ]
    }
  ]
  
  musicStore.loadPlaylistsFromDrive(mockMusicFolders)
}

onMounted(() => {
  loadMusicFromDrive()
})
</script> 