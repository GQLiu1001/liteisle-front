import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDriveStore } from './DriveStore'

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
  const playMode = ref<'order' | 'shuffle' | 'repeat'>('order') // 播放模式：顺序播放、随机播放、单曲循环
  
  // 播放定时器
  let playTimer: number | null = null

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

  // 定时器管理
  const startPlayTimer = () => {
    if (playTimer) {
      clearInterval(playTimer)
    }
    
    playTimer = setInterval(() => {
      if (isPlaying.value && currentTime.value < duration.value) {
        currentTime.value += 1
      } else if (currentTime.value >= duration.value) {
        // 歌曲播放结束，自动切换下一首
        nextTrack()
      }
    }, 1000) // 每秒更新一次
  }

  const stopPlayTimer = () => {
    if (playTimer) {
      clearInterval(playTimer)
      playTimer = null
    }
  }

  // 播放控制方法
  const togglePlay = () => {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  const play = () => {
    isPlaying.value = true
    startPlayTimer()
  }

  const pause = () => {
    isPlaying.value = false
    stopPlayTimer()
  }

  const stop = () => {
    isPlaying.value = false
    currentTime.value = 0
    stopPlayTimer()
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

  const togglePlayMode = () => {
    if (playMode.value === 'order') {
      playMode.value = 'shuffle'
    } else if (playMode.value === 'shuffle') {
      playMode.value = 'repeat'
    } else {
      playMode.value = 'order'
    }
  }

  // 播放列表控制
  const setCurrentPlaylist = (playlist: Playlist) => {
    currentPlaylist.value = playlist
    currentTrackIndex.value = 0
  }

  const setCurrentTrack = (trackIndex: number) => {
    if (currentPlaylist.value && trackIndex >= 0 && trackIndex < currentPlaylist.value.tracks.length) {
      currentTrackIndex.value = trackIndex
      // 重置播放时间并设置新歌曲的时长
      currentTime.value = 0
      duration.value = currentPlaylist.value.tracks[trackIndex].duration
    }
  }

  const nextTrack = () => {
    if (!currentPlaylist.value || currentPlaylist.value.tracks.length === 0) return

    const wasPlaying = isPlaying.value
    
    if (playMode.value === 'shuffle') {
      setCurrentTrack(Math.floor(Math.random() * currentPlaylist.value.tracks.length))
    } else if (playMode.value === 'repeat') {
      // 单曲循环：重置当前歌曲
      currentTime.value = 0
    } else {
      // 顺序播放
      const nextIndex = (currentTrackIndex.value + 1) % currentPlaylist.value.tracks.length
      setCurrentTrack(nextIndex)
    }
    
    if (wasPlaying) {
      play()
    }
  }

  const previousTrack = () => {
    if (!currentPlaylist.value || currentPlaylist.value.tracks.length === 0) return

    const wasPlaying = isPlaying.value
    
    if (playMode.value === 'shuffle') {
      setCurrentTrack(Math.floor(Math.random() * currentPlaylist.value.tracks.length))
    } else if (playMode.value === 'repeat') {
      // 单曲循环：重置当前歌曲
      currentTime.value = 0
    } else {
      // 顺序播放
      const prevIndex = currentTrackIndex.value === 0 
        ? currentPlaylist.value.tracks.length - 1 
        : currentTrackIndex.value - 1
      setCurrentTrack(prevIndex)
    }
    
    if (wasPlaying) {
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

  // 从网盘数据加载播放列表
  const loadPlaylistsFromDrive = async () => {
    const driveStore = useDriveStore()
    const newPlaylists: Playlist[] = []
    
    // 查找音乐文件夹
    const musicFolder = driveStore.driveItems.find((item: any) => item.name === '音乐' && item.type === 'folder')
    
    if (musicFolder && musicFolder.children) {
      // 遍历音乐文件夹下的子文件夹作为歌单
      musicFolder.children.forEach((subfolder: any) => {
        if (subfolder.type === 'folder' && subfolder.children) {
          const tracks: Track[] = []
          
          // 遍历子文件夹中的音频文件
          subfolder.children.forEach((file: any, index: number) => {
            if (file.type === 'audio') {
              tracks.push({
                id: file.id,
                name: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
                artist: extractArtistFromFileName(file.name),
                album: subfolder.name,
                duration: estimateDurationFromSize(file.size),
                filePath: file.path,
                coverUrl: '',
                lyrics: getLyricsForTrack(file.name)
              })
            }
          })
          
          // 创建歌单
          if (tracks.length > 0) {
            const playlist: Playlist = {
              id: subfolder.id,
              name: subfolder.name,
              folderPath: subfolder.path,
              tracks: tracks
            }
            newPlaylists.push(playlist)
          }
        }
      })
    }
    
    // 如果网盘中没有音乐数据，使用Mock数据
    if (newPlaylists.length === 0) {
      console.log('网盘中未找到音乐数据，使用Mock数据')
      return // 保持现有的Mock数据
    }
    
    playlists.value = newPlaylists
    
    // 设置第一个播放列表为当前播放列表
    if (newPlaylists.length > 0) {
      setCurrentPlaylist(newPlaylists[0])
    }
  }

  // 从文件名提取艺术家信息
  const extractArtistFromFileName = (fileName: string): string => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    
    // 尝试匹配 "艺术家 - 歌名" 格式
    const match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+)$/)
    if (match) {
      return match[1].trim()
    }
    
    // 根据歌名匹配已知艺术家
    const artistMap: { [key: string]: string } = {
      '夜曲': '周杰伦',
      '晴天': '周杰伦',
      '稻香': '周杰伦',
      '青花瓷': '周杰伦',
      '七里香': '周杰伦',
      '东风破': '周杰伦',
      '蓝莲花': '许巍',
      '贝多芬第九交响曲': '贝多芬',
      '月光奏鸣曲': '贝多芬',
      '土耳其进行曲': '莫扎特',
      '致爱丽丝': '贝多芬',
      '卡农': '帕赫贝尔',
      '小夜曲': '莫扎特',
      '光辉岁月': 'Beyond',
      '海阔天空': 'Beyond',
      '真的爱你': 'Beyond',
      '喜欢你': 'Beyond',
      '不再犹豫': 'Beyond',
      '冷雨夜': 'Beyond',
      '南山南': '马頔',
      '成都': '赵雷',
      '理想': '赵雷',
      '董小姐': '宋冬野'
    }
    
    return artistMap[nameWithoutExt] || '未知艺术家'
  }

  // 根据文件大小估算时长（粗略估算）
  const estimateDurationFromSize = (sizeInBytes: number): number => {
    // 假设平均比特率为128kbps
    const averageBitrate = 128 * 1024 / 8 // 128kbps转换为字节/秒
    return Math.round(sizeInBytes / averageBitrate)
  }

  // 获取歌曲歌词
  const getLyricsForTrack = (fileName: string): string => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    
    const lyricsMap: { [key: string]: string } = {
      '夜曲': '一群嗜血的蚂蚁 被腐肉所吸引\n我面无表情 看孤独的风景',
      '晴天': '故事的小黄花 从出生那年就飘着\n童年的荡秋千 随记忆一直摇到现在\n吹着前奏 望着天空\n我想起花瓣试着掉落',
      '蓝莲花': '没有什么能够阻挡\n你对自由的向往\n天马行空的生涯\n你的心了无牵挂',
      '光辉岁月': '钟声响起归家的讯号\n在他生命里 彷佛带点唏嘘\n黑色肌肤给他的意义',
      '海阔天空': '今天我 寒夜里看雪飘过\n怀着冷却了的心窝飘远方',
      '南山南': '你在南方的艳阳里 大雪纷飞\n我在北方的寒夜里 四季如春',
      '成都': '让我掉下眼泪的 不止昨夜的酒\n让我依依不舍的 不止你的温柔'
    }
    
    return lyricsMap[nameWithoutExt] || ''
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

  // 拖动重排歌曲
  const reorderTracks = (fromIndex: number, toIndex: number) => {
    if (!currentPlaylist.value || fromIndex === toIndex) return
    
    const tracks = [...currentPlaylist.value.tracks]
    const [movedTrack] = tracks.splice(fromIndex, 1)
    tracks.splice(toIndex, 0, movedTrack)
    
    currentPlaylist.value.tracks = tracks
    
    // 更新当前播放歌曲的索引
    if (currentTrackIndex.value === fromIndex) {
      currentTrackIndex.value = toIndex
    } else if (fromIndex < currentTrackIndex.value && toIndex >= currentTrackIndex.value) {
      currentTrackIndex.value--
    } else if (fromIndex > currentTrackIndex.value && toIndex <= currentTrackIndex.value) {
      currentTrackIndex.value++
    }
  }

  // 初始化Mock数据
  const initializeMockData = () => {
    const mockPlaylists: Playlist[] = [
      {
        id: 'pop-hits',
        name: '流行金曲',
        folderPath: '/music/pop',
        tracks: [
          {
            id: 'pop-1',
            name: '晴天',
            artist: '周杰伦',
            album: '叶惠美',
            duration: 269,
            filePath: '/music/pop/sunny-day.mp3',
            coverUrl: '',
            lyrics: '故事的小黄花 从出生那年就飘着\n童年的荡秋千 随记忆一直摇到现在\n吹着前奏 望着天空\n我想起花瓣试着掉落'
          },
          {
            id: 'pop-2',
            name: '稻香',
            artist: '周杰伦',
            album: '魔杰座',
            duration: 222,
            filePath: '/music/pop/rice-fragrance.mp3',
            coverUrl: '',
            lyrics: '对这个世界如果你有太多的抱怨\n跌倒了 就不敢继续往前走\n为什么人要这么的脆弱 堕落'
          },
          {
            id: 'pop-3',
            name: '青花瓷',
            artist: '周杰伦',
            album: '我很忙',
            duration: 237,
            filePath: '/music/pop/blue-and-white-porcelain.mp3',
            coverUrl: '',
            lyrics: '素胚勾勒出青花笔锋浓转淡\n瓶身描绘的牡丹一如你初妆\n冉冉檀香透过窗心事我了然'
          },
          {
            id: 'pop-4',
            name: '七里香',
            artist: '周杰伦',
            album: '七里香',
            duration: 275,
            filePath: '/music/pop/common-jasmin-orange.mp3',
            coverUrl: '',
            lyrics: '窗外的麻雀 在电线杆上多嘴\n你说这一句 很有夏天的感觉\n手中的铅笔 在纸上来来回回'
          },
          {
            id: 'pop-5',
            name: '夜曲',
            artist: '周杰伦',
            album: '十一月的萧邦',
            duration: 256,
            filePath: '/music/pop/nocturne.mp3',
            coverUrl: '',
            lyrics: '一群嗜血的蚂蚁 被腐肉所吸引\n我面无表情 看孤独的风景'
          },
          {
            id: 'pop-6',
            name: '东风破',
            artist: '周杰伦',
            album: '叶惠美',
            duration: 243,
            filePath: '/music/pop/east-wind-breaks.mp3',
            coverUrl: '',
            lyrics: '一盏离愁 孤单伫立在窗口\n我在门后 假装你人还没走'
          }
        ]
      },
      {
        id: 'classical',
        name: '古典音乐',
        folderPath: '/music/classical',
        tracks: [
          {
            id: 'classical-1',
            name: '月光奏鸣曲第一乐章',
            artist: '贝多芬',
            album: '钢琴奏鸣曲',
            duration: 365,
            filePath: '/music/classical/moonlight-sonata.mp3',
            coverUrl: '',
            lyrics: ''
          },
          {
            id: 'classical-2',
            name: '土耳其进行曲',
            artist: '莫扎特',
            album: 'K331奏鸣曲',
            duration: 234,
            filePath: '/music/classical/turkish-march.mp3',
            coverUrl: '',
            lyrics: ''
          },
          {
            id: 'classical-3',
            name: '致爱丽丝',
            artist: '贝多芬',
            album: '钢琴小品',
            duration: 198,
            filePath: '/music/classical/fur-elise.mp3',
            coverUrl: '',
            lyrics: ''
          },
          {
            id: 'classical-4',
            name: '卡农',
            artist: '帕赫贝尔',
            album: '室内乐',
            duration: 298,
            filePath: '/music/classical/canon.mp3',
            coverUrl: '',
            lyrics: ''
          },
          {
            id: 'classical-5',
            name: '小夜曲',
            artist: '莫扎特',
            album: 'K525',
            duration: 412,
            filePath: '/music/classical/serenade.mp3',
            coverUrl: '',
            lyrics: ''
          }
        ]
      },
      {
        id: 'rock',
        name: '摇滚音乐',
        folderPath: '/music/rock',
        tracks: [
          {
            id: 'rock-1',
            name: '光辉岁月',
            artist: 'Beyond',
            album: '光辉岁月',
            duration: 256,
            filePath: '/music/rock/glorious-years.mp3',
            coverUrl: '',
            lyrics: '钟声响起归家的讯号\n在他生命里 彷佛带点唏嘘\n黑色肌肤给他的意义'
          },
          {
            id: 'rock-2',
            name: '海阔天空',
            artist: 'Beyond',
            album: '乐与怒',
            duration: 326,
            filePath: '/music/rock/boundless-oceans-vast-skies.mp3',
            coverUrl: '',
            lyrics: '今天我 寒夜里看雪飘过\n怀着冷却了的心窝飘远方'
          },
          {
            id: 'rock-3',
            name: '真的爱你',
            artist: 'Beyond',
            album: 'Beyond IV',
            duration: 297,
            filePath: '/music/rock/really-love-you.mp3',
            coverUrl: '',
            lyrics: '无法可修饰的一对手\n带出温暖永远在背后\n纵使罗嗦始终关注'
          },
          {
            id: 'rock-4',
            name: '喜欢你',
            artist: 'Beyond',
            album: '现代舞台',
            duration: 245,
            filePath: '/music/rock/like-you.mp3',
            coverUrl: '',
            lyrics: '细雨带风湿透黄昏的街道\n抹去雨水双眼无故地仰望'
          },
          {
            id: 'rock-5',
            name: '不再犹豫',
            artist: 'Beyond',
            album: '犹豫',
            duration: 267,
            filePath: '/music/rock/no-more-hesitation.mp3',
            coverUrl: '',
            lyrics: '无聊望见了犹豫 达到理想不太易\n即使有信心 斗志却抑制'
          },
          {
            id: 'rock-6',
            name: '冷雨夜',
            artist: 'Beyond',
            album: '旧日的足迹',
            duration: 298,
            filePath: '/music/rock/cold-rainy-night.mp3',
            coverUrl: '',
            lyrics: '雨夜怎么怪 我怎么感慨\n伴我今夜的 风声撩动窗台'
          }
        ]
      },
      {
        id: 'folk',
        name: '民谣音乐',
        folderPath: '/music/folk',
        tracks: [
          {
            id: 'folk-1',
            name: '南山南',
            artist: '马頔',
            album: '孤岛',
            duration: 277,
            filePath: '/music/folk/nan-shan-nan.mp3',
            coverUrl: '',
            lyrics: '你在南方的艳阳里 大雪纷飞\n我在北方的寒夜里 四季如春'
          },
          {
            id: 'folk-2',
            name: '成都',
            artist: '赵雷',
            album: '无法长大',
            duration: 327,
            filePath: '/music/folk/chengdu.mp3',
            coverUrl: '',
            lyrics: '让我掉下眼泪的 不止昨夜的酒\n让我依依不舍的 不止你的温柔'
          },
          {
            id: 'folk-3',
            name: '理想',
            artist: '赵雷',
            album: '赵小雷',
            duration: 298,
            filePath: '/music/folk/ideal.mp3',
            coverUrl: '',
            lyrics: '理想总是遥不可及\n是不是应该放弃\n花开花落又是雨季'
          },
          {
            id: 'folk-4',
            name: '董小姐',
            artist: '宋冬野',
            album: '安和桥北',
            duration: 234,
            filePath: '/music/folk/miss-dong.mp3',
            coverUrl: '',
            lyrics: '董小姐 你从来不知道\n我为什么离开'
          }
        ]
      }
    ]

    playlists.value = mockPlaylists
    
    // 设置默认播放列表和歌曲
    if (mockPlaylists.length > 0) {
      setCurrentPlaylist(mockPlaylists[0])
      // 设置第三首歌为当前播放（测试播放状态显示）
      if (mockPlaylists[0].tracks.length > 2) {
        setCurrentTrack(2)
        currentTime.value = 45 // 模拟播放了45秒
        // 默认不自动播放，让用户手动点击播放
      }
    }
  }

  // 清理定时器的方法（用于组件卸载时）
  const cleanup = () => {
    stopPlayTimer()
  }

  // 默认初始化Mock数据，网盘数据加载成功后会替换
  initializeMockData()

  return {
    // 状态
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
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
    togglePlayMode,
    setCurrentPlaylist,
    setCurrentTrack,
    nextTrack,
    previousTrack,
    addPlaylist,
    removePlaylist,
    loadPlaylistsFromDrive,
    setSearchQuery,
    formatTime,
    reorderTracks,
    initializeMockData,
    cleanup
  }
}) 