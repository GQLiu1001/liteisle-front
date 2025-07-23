import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { API } from '@/utils/api'
import { onFileStatusUpdated } from '@/utils/websocket'
import { useToast } from 'vue-toastification'
import { FileStatusEnum } from '@/types/api'
import type {
  MusicViewResp,
  MusicFileInfo,
  FolderInfo,
  FolderTypeEnum
} from '@/types/api'

// 播放模式枚举
export enum PlayMode {
  ORDER = 'order',       // 顺序播放
  SHUFFLE = 'shuffle',   // 随机播放
  REPEAT = 'repeat'      // 单曲循环
}

// 播放状态枚举
export enum PlayState {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LOADING = 'loading'
}

export const useMusicStore = defineStore('music', () => {
  const toast = useToast()
  
  // === 音乐数据状态 ===
  const playlists = ref<FolderInfo[]>([])        // 播放列表（文件夹）
  const allMusicFiles = ref<MusicFileInfo[]>([]) // 所有音乐文件
  const isLoading = ref(false)
  const searchQuery = ref('')
  const lastUpdated = ref<Date | null>(null)
  
  // === 播放器状态 ===
  const currentPlaylist = ref<FolderInfo | null>(null)  // 当前播放列表
  const currentTrack = ref<MusicFileInfo | null>(null)  // 当前播放歌曲
  const playState = ref<PlayState>(PlayState.STOPPED)
  const playMode = ref<PlayMode>(PlayMode.ORDER)
  const volume = ref(0.7)
  const isMuted = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  
  // === HTML Audio元素 ===
  const audio = ref<HTMLAudioElement | null>(null)
  let progressTimer: number | null = null
  
  // === 计算属性 ===
  const currentPlaylistTracks = computed(() => {
    if (!currentPlaylist.value) return []
    return allMusicFiles.value.filter(file => 
      file.folder_id === currentPlaylist.value!.id &&
      file.file_status === FileStatusEnum.AVAILABLE
    ).sort((a, b) => a.sorted_order - b.sorted_order)
  })
  
  const currentTrackIndex = computed(() => {
    const tracks = currentPlaylistTracks.value
    if (!currentTrack.value || tracks.length === 0) return -1
    return tracks.findIndex(track => track.id === currentTrack.value!.id)
  })
  
  const hasNextTrack = computed(() => {
    const tracks = currentPlaylistTracks.value
    return playMode.value !== PlayMode.REPEAT && 
           (playMode.value === PlayMode.SHUFFLE || currentTrackIndex.value < tracks.length - 1)
  })
  
  const hasPreviousTrack = computed(() => {
    const tracks = currentPlaylistTracks.value
    return playMode.value !== PlayMode.REPEAT && 
           (playMode.value === PlayMode.SHUFFLE || currentTrackIndex.value > 0)
  })
  
  const filteredTracks = computed(() => {
    const tracks = currentPlaylistTracks.value
    if (!searchQuery.value) return tracks
    
    const query = searchQuery.value.toLowerCase()
    return tracks.filter(track => 
      track.file_name.toLowerCase().includes(query) ||
      (track.artist && track.artist.toLowerCase().includes(query)) ||
      (track.album && track.album.toLowerCase().includes(query))
    )
  })
  
  const progressPercentage = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  /**
   * 设置WebSocket监听
   */
  const setupWebSocketListeners = () => {
    onFileStatusUpdated((payload) => {
      // 更新对应音乐文件的状态
      const fileIndex = allMusicFiles.value.findIndex(file => file.id === payload.file_id)
      if (fileIndex > -1 && payload.file_data) {
        // 将通用FileInfo转换为MusicFileInfo
        const existingFile = allMusicFiles.value[fileIndex]
        allMusicFiles.value[fileIndex] = {
          ...payload.file_data,
          folder_id: existingFile.folder_id,
          artist: existingFile.artist,
          album: existingFile.album,
          duration: existingFile.duration,
          cover_art_url: existingFile.cover_art_url
        } as MusicFileInfo
        
        if (payload.file_status === FileStatusEnum.AVAILABLE) {
          toast.success(`音乐 "${payload.file_data.file_name}" 处理完成`)
        } else if (payload.file_status === FileStatusEnum.FAILED) {
          toast.error(`音乐 "${payload.file_data.file_name}" 处理失败`)
        }
      }
    })
  }
  
  /**
   * 加载音乐页面数据
   */
  const loadMusicData = async (content?: string): Promise<void> => {
    try {
      isLoading.value = true
      const response = await API.music.getMusicView(content)
      
      if (response.data) {
        playlists.value = response.data.playlists || []
        allMusicFiles.value = response.data.files || []
        lastUpdated.value = new Date()
      }
    } catch (error) {
      console.error('加载音乐数据失败:', error)
      toast.error('加载音乐数据失败')
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 搜索音乐
   */
  const searchMusic = async (query: string): Promise<void> => {
    searchQuery.value = query
    await loadMusicData(query)
  }
  
  /**
   * 初始化音频元素
   */
  const initializeAudio = (): void => {
    if (typeof window === 'undefined') return
    
    if (!audio.value) {
      audio.value = new Audio()
      
      // 音频事件监听
      audio.value.addEventListener('loadstart', () => {
        playState.value = PlayState.LOADING
      })
      
      audio.value.addEventListener('canplay', () => {
        duration.value = audio.value?.duration || 0
        if (playState.value === PlayState.LOADING) {
          playState.value = PlayState.PAUSED
        }
      })
      
      audio.value.addEventListener('play', () => {
        playState.value = PlayState.PLAYING
        startProgressTimer()
      })
      
      audio.value.addEventListener('pause', () => {
        playState.value = PlayState.PAUSED
        stopProgressTimer()
      })
      
      audio.value.addEventListener('ended', () => {
        playState.value = PlayState.STOPPED
        stopProgressTimer()
        handleTrackEnd()
      })
      
      audio.value.addEventListener('error', (e) => {
        console.error('音频播放错误:', e)
        playState.value = PlayState.STOPPED
        stopProgressTimer()
        toast.error('音频播放失败')
      })
      
      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value?.currentTime || 0
      })
    }
  }
  
  /**
   * 播放指定歌曲
   */
  const playTrack = async (track: MusicFileInfo, playlist?: FolderInfo): Promise<void> => {
    try {
      if (playlist) {
        currentPlaylist.value = playlist
      }
      
      currentTrack.value = track
      
      if (!audio.value) {
        initializeAudio()
      }
      
      // 获取播放URL
      const response = await API.music.getPlayUrl(track.id)
      if (response.data && audio.value) {
        audio.value.src = response.data
        audio.value.currentTime = 0
        await audio.value.play()
      }
    } catch (error) {
      console.error('播放失败:', error)
      toast.error('播放失败')
      playState.value = PlayState.STOPPED
    }
  }
  
  /**
   * 播放/暂停
   */
  const togglePlay = async (): Promise<void> => {
    if (!audio.value || !currentTrack.value) return
    
    try {
      if (playState.value === PlayState.PLAYING) {
        audio.value.pause()
      } else if (playState.value === PlayState.PAUSED) {
        await audio.value.play()
      }
    } catch (error) {
      console.error('播放控制失败:', error)
      toast.error('播放控制失败')
    }
  }
  
  /**
   * 下一首
   */
  const nextTrack = async (): Promise<void> => {
    const tracks = currentPlaylistTracks.value
    if (tracks.length === 0) return
    
    let nextIndex: number
    
    switch (playMode.value) {
      case PlayMode.SHUFFLE:
        nextIndex = Math.floor(Math.random() * tracks.length)
        break
      case PlayMode.REPEAT:
        nextIndex = currentTrackIndex.value
        break
      default: // ORDER
        nextIndex = currentTrackIndex.value + 1
        if (nextIndex >= tracks.length) {
          nextIndex = 0 // 循环到第一首
        }
    }
    
    const nextTrack = tracks[nextIndex]
    if (nextTrack) {
      await playTrack(nextTrack)
    }
  }
  
  /**
   * 上一首
   */
  const previousTrack = async (): Promise<void> => {
    const tracks = currentPlaylistTracks.value
    if (tracks.length === 0) return
    
    let prevIndex: number
    
    switch (playMode.value) {
      case PlayMode.SHUFFLE:
        prevIndex = Math.floor(Math.random() * tracks.length)
        break
      case PlayMode.REPEAT:
        prevIndex = currentTrackIndex.value
        break
      default: // ORDER
        prevIndex = currentTrackIndex.value - 1
        if (prevIndex < 0) {
          prevIndex = tracks.length - 1 // 循环到最后一首
        }
    }
    
    const prevTrack = tracks[prevIndex]
    if (prevTrack) {
      await playTrack(prevTrack)
    }
  }
  
  /**
   * 设置播放模式
   */
  const setPlayMode = (mode: PlayMode): void => {
    playMode.value = mode
  }
  
  /**
   * 设置音量
   */
  const setVolume = (vol: number): void => {
    volume.value = Math.max(0, Math.min(1, vol))
    if (audio.value) {
      audio.value.volume = isMuted.value ? 0 : volume.value
    }
  }
  
  /**
   * 切换静音
   */
  const toggleMute = (): void => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.volume = isMuted.value ? 0 : volume.value
    }
  }
  
  /**
   * 设置播放进度
   */
  const seek = (time: number): void => {
    if (audio.value && duration.value > 0) {
      const targetTime = Math.max(0, Math.min(duration.value, time))
      audio.value.currentTime = targetTime
      currentTime.value = targetTime
    }
  }
  
  /**
   * 通过百分比设置进度
   */
  const seekByPercentage = (percentage: number): void => {
    if (duration.value > 0) {
      const targetTime = (percentage / 100) * duration.value
      seek(targetTime)
    }
  }
  
  /**
   * 选择播放列表
   */
  const selectPlaylist = (playlist: FolderInfo): void => {
    currentPlaylist.value = playlist
    
    // 如果当前播放的歌曲不在新选择的播放列表中，停止播放
    const playlistTracks = allMusicFiles.value.filter(file => file.folder_id === playlist.id)
    if (currentTrack.value && !playlistTracks.find(track => track.id === currentTrack.value!.id)) {
      stop()
    }
  }
  
  /**
   * 停止播放
   */
  const stop = (): void => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
    }
    playState.value = PlayState.STOPPED
    currentTime.value = 0
    stopProgressTimer()
  }
  
  /**
   * 处理歌曲结束
   */
  const handleTrackEnd = (): void => {
    if (playMode.value === PlayMode.REPEAT) {
      // 单曲循环，重新播放当前歌曲
      if (audio.value) {
        audio.value.currentTime = 0
        audio.value.play()
      }
    } else {
      // 自动播放下一首
      nextTrack()
    }
  }
  
  /**
   * 开始进度计时器
   */
  const startProgressTimer = (): void => {
    stopProgressTimer()
    progressTimer = window.setInterval(() => {
      if (audio.value) {
        currentTime.value = audio.value.currentTime
      }
    }, 1000)
  }
  
  /**
   * 停止进度计时器
   */
  const stopProgressTimer = (): void => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
  
  /**
   * 格式化时间
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  /**
   * 获取播放列表中的歌曲数量
   */
  const getPlaylistTrackCount = (playlistId: number): number => {
    return allMusicFiles.value.filter(file => 
      file.folder_id === playlistId && 
      file.file_status === FileStatusEnum.AVAILABLE
    ).length
  }
  
  /**
   * 重置状态
   */
  const reset = (): void => {
    playlists.value = []
    allMusicFiles.value = []
    currentPlaylist.value = null
    currentTrack.value = null
    playState.value = PlayState.STOPPED
    currentTime.value = 0
    duration.value = 0
    searchQuery.value = ''
    
    if (audio.value) {
      audio.value.pause()
      audio.value = null
    }
    
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
  
  /**
   * 从云盘加载播放列表
   */
  const loadPlaylistsFromDrive = async (): Promise<void> => {
    try {
      isLoading.value = true
      const response = await API.music.getMusicView()
      
      if (response.data) {
                 playlists.value = response.data.playlists || []
         allMusicFiles.value = response.data.files || []
        lastUpdated.value = new Date()
      }
    } catch (error) {
      console.error('加载音乐数据失败:', error)
      toast.error('加载音乐数据失败')
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 从云盘播放指定歌曲
   */
  const playSongFromDrive = async (playlistName: string, songName: string): Promise<void> => {
    // 首先确保数据已加载
    if (playlists.value.length === 0) {
      await loadPlaylistsFromDrive()
    }
    
    // 查找播放列表
    const playlist = playlists.value.find(p => p.folder_name === playlistName)
    if (playlist) {
      currentPlaylist.value = playlist
      
      // 查找歌曲
      const tracks = currentPlaylistTracks.value
      const trackIndex = tracks.findIndex(track => track.file_name === songName)
      
      if (trackIndex !== -1) {
        currentTrack.value = tracks[trackIndex]
        await playTrack(tracks[trackIndex])
      }
    }
  }
  
  // 监听音量变化
  watch(volume, (newVolume) => {
    if (audio.value && !isMuted.value) {
      audio.value.volume = newVolume
    }
  })
  
  // 初始化
  initializeAudio()
  setupWebSocketListeners()
  
  return {
    // === 数据状态 ===
    playlists,
    allMusicFiles,
    isLoading,
    searchQuery,
    lastUpdated,
    
    // === 播放器状态 ===
    currentPlaylist,
    currentTrack,
    playState,
    playMode,
    volume,
    isMuted,
    currentTime,
    duration,
    
    // === 计算属性 ===
    currentPlaylistTracks,
    currentTrackIndex,
    hasNextTrack,
    hasPreviousTrack,
    filteredTracks,
    progressPercentage,
    
    // === 播放控制方法 ===
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    stop,
    setPlayMode,
    setVolume,
    toggleMute,
    seek,
    seekByPercentage,
    
    // === 数据管理方法 ===
    loadMusicData,
    searchMusic,
    selectPlaylist,
    getPlaylistTrackCount,
    formatTime,
    reset,
    loadPlaylistsFromDrive,
    playSongFromDrive,
    
    // === 枚举 ===
    PlayMode,
    PlayState
  }
}) 