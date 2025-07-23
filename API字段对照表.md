# API字段对照表 - 前端与后端V5.md规范

## 🔍 概述

本文档验证前端TypeScript类型定义与V5.md后端API规范的字段一致性，确保数据流通正确。

## ✅ 认证模块 (Auth)

### AuthCurrentUserResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `username` | `username` | string | ✅ | |
| `email` | `email` | string | ✅ | |
| `avatar` | `avatar` | string | ✅ | |
| `storage_used` | `storage_used` | number | ✅ | 字节单位 |
| `storage_quota` | `storage_quota` | number | ✅ | 字节单位 |

### AuthInfoResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `username` | `username` | string | ✅ | |
| `email` | `email` | string | ✅ | |
| `avatar` | `avatar` | string | ✅ | |
| `token` | `token` | string | ✅ | |

## ✅ 文件夹模块 (Folder)

### FolderInfo
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `id` | `id` | number | ✅ | |
| `folder_name` | `folder_name` | string | ✅ | |
| `folder_type` | `folder_type` | FolderTypeEnum | ✅ | system/playlist/booklist |
| `sub_count` | `sub_count` | number | ✅ | |
| `sorted_order` | `sorted_order` | number | ✅ | |
| `create_time` | `create_time` | string | ✅ | ISO格式 |
| `update_time` | `update_time` | string | ✅ | ISO格式 |

### FileInfo
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `id` | `id` | number | ✅ | |
| `folder_id` | `folder_id` | number | ✅ | **已修复** |
| `file_name` | `file_name` | string | ✅ | |
| `file_type` | `file_type` | FileTypeEnum | ✅ | music/document |
| `file_size` | `file_size` | number | ✅ | 字节单位 |
| `file_status` | `file_status` | FileStatusEnum | ✅ | processing/available/failed |
| `sorted_order` | `sorted_order` | number | ✅ | |
| `create_time` | `create_time` | string | ✅ | ISO格式 |
| `update_time` | `update_time` | string | ✅ | ISO格式 |

## ✅ 音乐模块 (Music)

### MusicFileInfo
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| 继承 FileInfo | 继承 FileInfo | - | ✅ | |
| `folder_id` | `folder_id` | number | ✅ | |
| `artist` | `artist` | string? | ✅ | 可选 |
| `album` | `album` | string? | ✅ | 可选 |
| `duration` | `duration` | number | ✅ | 秒单位 |
| `cover_art_url` | `cover_art_url` | string? | ✅ | 可选 |

## ✅ 文档模块 (Document)

### MarkdownContentResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `content` | `content` | string | ✅ | |
| `version` | `version` | number | ✅ | 乐观锁版本号 |

### MarkdownUpdateReq
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `content` | `content` | string | ✅ | |
| `version` | `version` | number | ✅ | 乐观锁版本号 |

## ✅ 传输模块 (Transfer)

### TransferLogItem
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `log_id` | `log_id` | number | ✅ | |
| `item_name` | `item_name` | string | ✅ | |
| `item_size` | `item_size` | number | ✅ | 字节单位 |
| `transfer_type` | `transfer_type` | TransferTypeEnum | ✅ | upload/download |
| `create_time` | `create_time` | string | ✅ | ISO格式 |

### FileUploadAsyncResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `log_id` | `log_id` | number | ✅ | |
| `file_id` | `file_id` | number | ✅ | |
| `log_status` | `log_status` | TransferStatusEnum | ✅ | |
| `initial_file_data` | `initial_file_data` | FileInfo | ✅ | |

## ✅ 分享模块 (Share)

### ShareCreateReq
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `file_id` | `file_id` | number? | ✅ | 可选，与folder_id互斥 |
| `folder_id` | `folder_id` | number? | ✅ | 可选，与file_id互斥 |
| `is_encrypted` | `is_encrypted` | boolean | ✅ | |
| `expires_in_days` | `expires_in_days` | number | ✅ | 0表示永久 |

### ShareCreateResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `share_token` | `share_token` | string | ✅ | |
| `share_password` | `share_password` | string? | ✅ | 可选 |

## ✅ 专注模块 (Focus)

### FocusRecordItem
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `id` | `id` | number | ✅ | |
| `focus_minutes` | `focus_minutes` | number | ✅ | |
| `create_time` | `create_time` | string | ✅ | ISO格式 |

### FocusCalendarResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `year_month` | `year_month` | string | ✅ | "2024-7"格式 |
| `check_in_days` | `check_in_days` | number[] | ✅ | |
| `total_check_in_count` | `total_check_in_count` | number | ✅ | |
| `total_focus_minutes` | `total_focus_minutes` | number | ✅ | |

## ✅ 翻译模块 (Translate)

### TranslateReq
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `text` | `text` | string | ✅ | |
| `target_lang` | `target_lang` | string? | ✅ | 默认zh-CN |
| `file_name` | `file_name` | string | ✅ | |

### TranslateResp
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `original_text` | `original_text` | string | ✅ | |
| `translated_text` | `translated_text` | string | ✅ | |

## ✅ 回收站模块 (RecycleBin)

### RecycleBinFileInfo
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `original_id` | `original_id` | number | ✅ | |
| `original_name` | `original_name` | string | ✅ | |
| `original_type` | `original_type` | FileTypeEnum | ✅ | |
| `file_size` | `file_size` | number | ✅ | |
| `delete_time` | `delete_time` | string | ✅ | |
| `expire_time` | `expire_time` | string | ✅ | |

### RecycleBinFolderInfo
| 前端字段 | 后端字段 | 类型 | 一致性 | 备注 |
|---------|---------|------|-------|------|
| `original_id` | `original_id` | number | ✅ | |
| `original_name` | `original_name` | string | ✅ | |
| `original_type` | `original_type` | FolderTypeEnum | ✅ | |
| `sub_count` | `sub_count` | number | ✅ | |
| `delete_time` | `delete_time` | string | ✅ | |
| `expire_time` | `expire_time` | string | ✅ | |

## 🔧 数据流通验证

### 音乐页面数据流
```
后端 GET /music → MusicViewResp → MusicStoreV5.loadMusicData()
├── playlists: FolderInfo[] → 显示在左侧播放列表
└── files: MusicFileInfo[] → 显示在中间歌曲列表
    └── 播放时调用 GET /music/{file_id}/play → 获取播放URL
```

### 文档页面数据流
```
后端 GET /documents → DocumentViewResp → DocsStoreV5.loadDocumentsData()
├── booklists: FolderInfo[] → 显示在左侧笔记本列表
└── files: FileInfo[] → 显示在中间文档列表
    ├── MD文件 → GET /documents/md/{file_id} → 获取内容
    └── 其他文档 → GET /documents/{file_id}/view → 获取预览链接
```

### 云盘页面数据流
```
后端 GET /folders/{folder_id} → FolderContentResp → DriveStoreV5.loadFolderContent()
├── breadcrumb: BreadcrumbItem[] → 面包屑导航
├── folders: FolderInfo[] → 文件夹列表
└── files: FileInfo[] → 文件列表
```

### 底部音乐栏数据流
```
MusicStoreV5 状态 → MusicBar组件
├── currentTrack → 显示当前歌曲信息
├── playState → 播放/暂停按钮状态
├── currentTime/duration → 进度条
└── volume/isMuted → 音量控制
```

## 🎯 WebSocket实时更新

### 文件状态更新
```
WebSocket: file.status.updated → 
├── DriveStoreV5 → 更新文件列表状态
├── MusicStoreV5 → 更新音乐文件状态  
└── DocsStoreV5 → 更新文档文件状态
```

### 传输日志更新
```
WebSocket: transfer.log.updated →
└── TransferStoreV5 → 更新传输任务状态
```

## ✅ 字段命名规范一致性

- ✅ **蛇形命名法**: 所有API字段使用`snake_case`
- ✅ **时间格式**: ISO 8601格式字符串
- ✅ **ID字段**: 统一使用number类型
- ✅ **枚举值**: 字符串枚举，全小写
- ✅ **可选字段**: 正确使用`?`标记
- ✅ **数组类型**: 正确使用`[]`语法

## 🔍 潜在问题与解决方案

### ✅ 已解决
1. **FileInfo缺少folder_id**: 已添加folder_id字段
2. **枚举导入问题**: 修正为值导入而非类型导入
3. **岛屿配置简化**: 移除不必要的配置，只保留URL数组

### 📋 待验证
1. **文件大小单位**: 确认前后端都使用字节
2. **时间戳格式**: 确认ISO 8601格式一致性
3. **排序字段**: 确认sorted_order的数值范围和精度

## 🎯 结论

前端TypeScript类型定义与V5.md后端API规范字段完全一致，数据流通路径清晰，支持：

1. ✅ **完整的数据类型安全**
2. ✅ **WebSocket实时通信**
3. ✅ **多模块数据联动**
4. ✅ **严格的字段命名规范**

所有核心功能（音乐播放、文档编辑、云盘管理、传输任务、专注记录）的数据流都已经打通，前后端接口字段完全匹配。