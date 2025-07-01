import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Track {
  id: string
  name: string
  artist: string
  album?: string
  duration: number
  filePath: string
  coverUrl?: string
  lyrics?: string
}

export interface Playlist {
  id: string
  name: string
  tracks: Track[]
  folderPath: string
}

export const useMusicStore = defineStore('music', () => {
  // 播放状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.7)
  const isMuted = ref(false)
  const isRepeat = ref(false)
  const isShuffle = ref(false)

  // 音乐数据
  const playlists = ref<Playlist[]>([])
  const currentPlaylist = ref<Playlist | null>(null)
  const currentTrackIndex = ref(0)
  const searchQuery = ref('')

  // 计算属性
  const currentTrack = computed(() => {
    if (!currentPlaylist.value || currentPlaylist.value.tracks.length === 0) {
      return null
    }
    return currentPlaylist.value.tracks[currentTrackIndex.value] || null
  })

  const filteredTracks = computed(() => {
    if (!currentPlaylist.value || !searchQuery.value) {
      return currentPlaylist.value?.tracks || []
    }
    return currentPlaylist.value.tracks.filter((track: Track) => 
      track.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const currentTrackInfo = computed(() => {
    if (!currentTrack.value) {
      return {
        name: '暂无播放',
        artist: '未知艺术家',
        album: '',
        duration: 0,
        coverUrl: '',
        lyrics: ''
      }
    }
    return currentTrack.value
  })

  // 播放控制方法
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const play = () => {
    isPlaying.value = true
  }

  const pause = () => {
    isPlaying.value = false
  }

  const stop = () => {
    isPlaying.value = false
    currentTime.value = 0
  }

  const seek = (time: number) => {
    currentTime.value = Math.max(0, Math.min(time, duration.value))
  }

  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
  }

  const toggleRepeat = () => {
    isRepeat.value = !isRepeat.value
  }

  const toggleShuffle = () => {
    isShuffle.value = !isShuffle.value
  }

  // 播放列表控制
  const setCurrentPlaylist = (playlist: Playlist) => {
    currentPlaylist.value = playlist
    currentTrackIndex.value = 0
  }

  const setCurrentTrack = (trackIndex: number) => {
    if (currentPlaylist.value && trackIndex >= 0 && trackIndex < currentPlaylist.value.tracks.length) {
      currentTrackIndex.value = trackIndex
    }
  }

  const nextTrack = () => {
    if (!currentPlaylist.value || currentPlaylist.value.tracks.length === 0) return

    if (isShuffle.value) {
      currentTrackIndex.value = Math.floor(Math.random() * currentPlaylist.value.tracks.length)
    } else {
      currentTrackIndex.value = (currentTrackIndex.value + 1) % currentPlaylist.value.tracks.length
    }
    
    if (isPlaying.value) {
      play()
    }
  }

  const previousTrack = () => {
    if (!currentPlaylist.value || currentPlaylist.value.tracks.length === 0) return

    if (isShuffle.value) {
      currentTrackIndex.value = Math.floor(Math.random() * currentPlaylist.value.tracks.length)
    } else {
      currentTrackIndex.value = currentTrackIndex.value === 0 
        ? currentPlaylist.value.tracks.length - 1 
        : currentTrackIndex.value - 1
    }
    
    if (isPlaying.value) {
      play()
    }
  }

  // 播放列表管理
  const addPlaylist = (playlist: Playlist) => {
    playlists.value.push(playlist)
  }

  const removePlaylist = (playlistId: string) => {
    playlists.value = playlists.value.filter((p: Playlist) => p.id !== playlistId)
  }

  const loadPlaylistsFromDrive = async (musicFolders: any[]) => {
    const newPlaylists: Playlist[] = []
    
    musicFolders.forEach(folder => {
      const playlist: Playlist = {
        id: folder.id,
        name: folder.name,
        folderPath: folder.path,
        tracks: folder.files?.map((file: any, index: number) => ({
          id: `${folder.id}_${index}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
          artist: '未知艺术家',
          duration: 0, // 这里需要实际解析音频文件获取时长
          filePath: file.path,
          coverUrl: '',
          lyrics: ''
        })) || []
      }
      newPlaylists.push(playlist)
    })
    
    playlists.value = newPlaylists
    
    // 如果还没有当前播放列表，设置第一个为当前播放列表
    if (!currentPlaylist.value && newPlaylists.length > 0) {
      setCurrentPlaylist(newPlaylists[0])
    }
  }

  // 搜索
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    // 状态
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    playlists,
    currentPlaylist,
    currentTrackIndex,
    searchQuery,
    
    // 计算属性
    currentTrack,
    filteredTracks,
    currentTrackInfo,
    
    // 方法
    togglePlay,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setCurrentPlaylist,
    setCurrentTrack,
    nextTrack,
    previousTrack,
    addPlaylist,
    removePlaylist,
    loadPlaylistsFromDrive,
    setSearchQuery,
    formatTime
  }
}) 