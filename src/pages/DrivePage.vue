<template>
  <div class="min-h-full bg-liteisle-bg p-6">
    <div class="max-w-7xl mx-auto">
      <div class="h-[calc(100vh-12rem)]">
        <!-- 主要内容区域 -->
        <div class="card h-full flex flex-col">
          <!-- 面包屑导航 -->
          <nav class="flex items-center gap-2 text-sm mb-6 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-3 rounded-lg border border-teal-100 shadow-sm">
            <div class="font-semibold text-morandi-800 mr-2 flex-shrink-0">导航栏:</div>
            <button
              v-for="(path, index) in breadcrumbPaths"
              :key="index"
              @click="navigateToPath(index)"
              class="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-white/80 transition-all duration-200 shadow-sm"
              :class="{ 
                'text-teal-700 font-semibold bg-white shadow-md': index === breadcrumbPaths.length - 1,
                'text-morandi-600 hover:text-teal-600': index !== breadcrumbPaths.length - 1
              }"
            >
              <span>{{ path.name }}</span>
              <ChevronRight v-if="index < breadcrumbPaths.length - 1" :size="16" class="text-morandi-400" />
            </button>
          </nav>

          <!-- 文件列表头部 -->
          <div class="mb-6 flex items-center">
            <!-- 左侧区域：标题和统计 -->
            <div class="w-72">
              <h2 class="text-xl font-bold text-morandi-900">
                {{ getCurrentLevelTitle() }}
              </h2>
              <span class="text-sm text-morandi-500">
                {{ filteredItems.length }} 个项目
              </span>
            </div>
            
            <!-- 中间区域：刷新按钮 + 搜索框和控制按钮 -->
            <div class="flex-1 flex justify-center items-center gap-6">
              <button
                @click="refreshItems"
                :disabled="isRefreshing"
                class="p-2 rounded-lg border border-morandi-300 text-morandi-600 hover:bg-morandi-50 hover:border-morandi-400 transition-all duration-200 disabled:opacity-50"
                title="刷新"
              >
                <FolderSync :size="18" :class="{ 'animate-spin': isRefreshing }" />
              </button>
              <input
                v-model="driveStore.searchQuery"
                :placeholder="driveStore.isInRecycleBin ? '搜索回收站...' : '搜索文件...'"
                class="px-4 py-2 w-80 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              
              <!-- 排序按钮 -->
              <div class="relative">
                <button
                  @click.stop="toggleSortMenu"
                  class="flex items-center gap-1 px-3 py-2 rounded-lg border border-morandi-300 text-morandi-700 text-sm bg-white hover:bg-morandi-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  title="排序选项"
                >
                  <ListOrdered :size="20" />
                  <ChevronRight :size="12" :class="{ 'rotate-90': showSortMenu }" class="transition-transform" />
                </button>
                
                <!-- 排序菜单 -->
                <div
                  v-if="showSortMenu"
                  class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-morandi-200 py-2 min-w-[140px] z-50"
                  @click.stop
                >
                  <button
                    v-for="option in sortOptions"
                    :key="option.value"
                    @click="selectSort(option.value)"
                    :class="[
                      'w-full px-4 py-2 text-left text-sm hover:bg-morandi-50 flex items-center gap-2 transition-colors',
                      sortBy === option.value ? 'text-teal-600 bg-teal-50' : 'text-morandi-700'
                    ]"
                  >
                                         <!-- <FileText :size="16" /> -->
                     <span>{{ option.label }}</span>
                     <ChevronRight v-if="sortBy === option.value" :size="14" class="ml-auto text-teal-600" />
                  </button>
                </div>
              </div>
              
              <!-- 视图切换按钮 -->
              <div class="flex items-center border border-morandi-300 rounded-lg">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'px-3 py-2 text-sm transition-colors',
                    viewMode === 'grid' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-morandi-600 hover:bg-morandi-50'
                  ]"
                  class="rounded-l-lg"
                  title="网格视图"
                >
                  <Grid2x2 :size="16" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'px-3 py-2 text-sm transition-colors',
                    viewMode === 'list' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-morandi-600 hover:bg-morandi-50'
                  ]"
                  class="rounded-r-lg"
                  title="列表视图"
                >
                  <Logs :size="16" />
                </button>
              </div>
            </div>
            
            <!-- 右侧区域：固定宽度确保位置一致 -->
            <div class="w-24 flex justify-end">
              <!-- 正常模式：回收站按钮 -->
              <button
                v-if="!driveStore.isInRecycleBin"
                @click="openRecycleBin"
                class="flex items-center justify-center w-10 h-10 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                title="回收站"
              >
                <Trash2 :size="20" />
              </button>
              
              <!-- 回收站模式：操作按钮 -->
              <div v-if="driveStore.isInRecycleBin" class="flex items-center gap-2">
                <button
                  @click="restoreAllItems"
                  class="flex items-center justify-center w-9 h-9 rounded-lg border border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-colors"
                  title="一键还原"
                  :disabled="driveStore.recycleBinItems.length === 0"
                >
                  <RefreshCcw :size="16" />
                </button>
                <button
                  @click="deleteAllItems"
                  class="flex items-center justify-center w-9 h-9 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                  title="一键删除"
                  :disabled="driveStore.recycleBinItems.length === 0"
                >
                  <!-- <OctagonX :size="16" /> -->
                  <Shredder :size="16" />

                </button>
              </div>
            </div>
          </div>

                        <!-- 内容视图 -->
          <div class="flex-1 overflow-auto" @contextmenu.prevent="showEmptyContextMenu">
            <!-- 网格视图 -->
            <div v-if="viewMode === 'grid'" class="grid grid-cols-6 gap-4 pb-4">
              <!-- 现有文件和文件夹 -->
              <div
                v-for="item in filteredItems"
                :key="item.id"
                @click="handleItemClick(item)"
                @contextmenu.prevent="showContextMenu($event, item)"
                class="p-4 rounded-lg border-2 border-transparent hover:border-morandi-300 hover:bg-morandi-50 transition-all duration-200 cursor-pointer"
              >
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 mb-3 flex items-center justify-center">
                    <FolderClosed v-if="item.type === 'folder'" :size="48" class="text-blue-500" />
                    <Music v-else-if="item.type === 'audio'" :size="48" class="text-green-500" />
                    <FileText v-else :size="48" class="text-morandi-500" />
                  </div>

                  <p class="text-sm text-center font-medium text-morandi-900 truncate w-full">
                    {{ item.name }}
                  </p>

                  <p class="text-xs text-morandi-500 mt-1">
                    <span v-if="item.type !== 'folder'">{{ formatFileSize(item.size) }}</span>
                    <span v-else>{{ item.itemCount }} 项</span>
                  </p>
                </div>
              </div>

              <!-- 新建文件夹项（在根目录和第一级都显示，非回收站模式） -->
              <div
                v-if="!driveStore.isInRecycleBin && !driveStore.searchQuery && (getCurrentLevel() === 0 || getCurrentLevel() === 1)"
                @click="createNewFolder"
                class="p-4 rounded-lg border-2 border-dashed border-morandi-300 hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 cursor-pointer"
              >
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 mb-3 flex items-center justify-center">
                    <FolderClosed :size="48" class="text-teal-500" />
                  </div>

                  <p class="text-sm text-center font-medium text-morandi-600">
                    新建文件夹
                  </p>

                  <p class="text-xs text-morandi-400 mt-1">
                    点击创建
                  </p>
                </div>
              </div>

              <!-- 上传文件项（仅在第二级显示，非回收站模式） -->
              <div
                v-if="!driveStore.isInRecycleBin && !driveStore.searchQuery && getCurrentLevel() === 2"
                @click="uploadFiles"
                class="p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer"
              >
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 mb-3 flex items-center justify-center">
                    <Upload :size="48" class="text-green-500" />
                  </div>

                  <p class="text-sm text-center font-medium text-green-600">
                    上传文件
                  </p>

                  <p class="text-xs text-green-400 mt-1">
                    点击上传
                  </p>
                </div>
              </div>
            </div>

            <!-- 列表视图 -->
            <div v-if="viewMode === 'list'" class="space-y-2 pb-4">
              <!-- 列表头部 -->
              <div class="flex items-center px-4 py-2 bg-morandi-50 rounded-lg text-sm font-medium text-morandi-600">
                <div class="flex-1">名称</div>
                <div class="w-20 text-right">大小</div>
                <div class="w-32 text-right">修改时间</div>
                <div class="w-32 text-right">创建时间</div>
              </div>
              
              <!-- 现有文件和文件夹 -->
              <div
                v-for="item in filteredItems"
                :key="item.id"
                @click="handleItemClick(item)"
                @contextmenu.prevent="showContextMenu($event, item)"
                class="flex items-center px-4 py-3 rounded-lg border border-transparent hover:border-morandi-300 hover:bg-morandi-50 transition-all duration-200 cursor-pointer"
              >
                <!-- 图标和名称 -->
                <div class="flex items-center flex-1 gap-3">
                  <div class="w-8 h-8 flex items-center justify-center">
                    <FolderClosed v-if="item.type === 'folder'" :size="20" class="text-blue-500" />
                    <Music v-else-if="item.type === 'audio'" :size="20" class="text-green-500" />
                    <FileText v-else :size="20" class="text-morandi-500" />
                  </div>
                  <span class="text-sm font-medium text-morandi-900 truncate">{{ item.name }}</span>
                </div>
                
                <!-- 文件大小 -->
                <div class="w-20 text-right text-xs text-morandi-500">
                  <span v-if="item.type !== 'folder'">{{ formatFileSize(item.size) }}</span>
                  <span v-else>{{ item.itemCount }} 项</span>
                </div>
                
                <!-- 修改时间 -->
                <div class="w-32 text-right text-xs text-morandi-500">
                  {{ formatDate(item.modifiedAt) }}
                </div>
                
                <!-- 创建时间 -->
                <div class="w-32 text-right text-xs text-morandi-500">
                  {{ formatDate(item.createdAt || item.modifiedAt) }}
                </div>
              </div>
              
              <!-- 新建文件夹项（列表模式） -->
              <div
                v-if="!driveStore.isInRecycleBin && !driveStore.searchQuery && (getCurrentLevel() === 0 || getCurrentLevel() === 1)"
                @click="createNewFolder"
                class="flex items-center px-4 py-3 rounded-lg border-2 border-dashed border-morandi-300 hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 cursor-pointer"
              >
                <div class="flex items-center flex-1 gap-3">
                  <div class="w-8 h-8 flex items-center justify-center">
                    <FolderClosed :size="20" class="text-teal-500" />
                  </div>
                  <span class="text-sm font-medium text-morandi-600">新建文件夹</span>
                </div>
                <div class="w-20 text-right text-xs text-morandi-400">-</div>
                <div class="w-32 text-right text-xs text-morandi-400">-</div>
                <div class="w-32 text-right text-xs text-morandi-400">-</div>
              </div>
              
              <!-- 上传文件项（列表模式） -->
              <div
                v-if="!driveStore.isInRecycleBin && !driveStore.searchQuery && getCurrentLevel() === 2"
                @click="uploadFiles"
                class="flex items-center px-4 py-3 rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer"
              >
                <div class="flex items-center flex-1 gap-3">
                  <div class="w-8 h-8 flex items-center justify-center">
                    <FileText :size="20" class="text-green-500" />
                  </div>
                  <span class="text-sm font-medium text-green-600">上传文件</span>
                </div>
                <div class="w-20 text-right text-xs text-green-400">-</div>
                <div class="w-32 text-right text-xs text-green-400">-</div>
                <div class="w-32 text-right text-xs text-green-400">-</div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredItems.length === 0 && searchQuery" class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 bg-morandi-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderClosed :size="32" class="text-morandi-400" />
                </div>
                <h3 class="text-lg font-medium text-morandi-700 mb-2">
                  {{ isInRecycleBin ? '回收站中未找到匹配的文件' : '未找到匹配的文件' }}
                </h3>
                <p class="text-morandi-500">
                  尝试其他搜索词
                </p>
              </div>
            </div>

            <!-- 完全空状态（无文件且无搜索） -->
            <div v-if="filteredItems.length === 0 && !searchQuery" class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 bg-morandi-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderClosed :size="32" class="text-morandi-400" />
                </div>
                <h3 class="text-lg font-medium text-morandi-700 mb-2">
                  {{ isInRecycleBin ? '回收站为空' : (getCurrentLevel() === 0 ? '云盘为空' : '文件夹为空') }}
                </h3>
                <p class="text-morandi-500">
                  {{ isInRecycleBin ? '没有已删除的文件' : getEmptyStateMessage() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文件夹对话框 -->
    <div v-if="showCreateFolderDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">新建文件夹</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">文件夹名称</label>
            <input
              v-model="newFolderName"
              type="text"
              placeholder="请输入文件夹名称"
              class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              @keydown.enter="confirmCreateFolder"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showCreateFolderDialog = false"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmCreateFolder"
            :disabled="!newFolderName.trim()"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 上传文件对话框 -->
    <div v-if="showUploadDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">上传文件</h3>
        <div class="space-y-4">
          <div class="border-2 border-dashed border-morandi-300 rounded-lg p-8 text-center">
            <FileText :size="32" class="mx-auto mb-3 text-morandi-400" />
            <p class="text-morandi-600 mb-2">点击选择文件或拖拽到此处</p>
            <p class="text-xs text-morandi-400">支持音频、文档等多种格式</p>
            <input 
              type="file" 
              multiple 
              class="hidden" 
              ref="fileInput"
              @change="handleFileSelect"
            />
            <button 
              @click="$refs.fileInput?.click()"
              class="mt-3 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              选择文件
            </button>
          </div>
          
          <!-- 文件列表 -->
          <div v-if="selectedFiles.length > 0" class="max-h-32 overflow-auto">
            <h4 class="text-sm font-medium text-morandi-700 mb-2">待上传文件：</h4>
            <div class="space-y-1">
              <div 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="flex items-center justify-between text-xs bg-morandi-50 p-2 rounded"
              >
                <span class="truncate flex-1">{{ file.name }}</span>
                <span class="text-morandi-500 ml-2">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancelUpload"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmUpload"
            :disabled="selectedFiles.length === 0"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上传 ({{ selectedFiles.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="showContextMenuState" 
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
      class="fixed z-50 bg-white rounded-lg shadow-lg border border-morandi-200 py-2 min-w-[120px]"
      @click.stop="preventHide"
    >

      <!-- 空白区域的右键菜单 -->
      <template v-if="!selectedItem">
        <button 
          v-if="clipboard && clipboardAction"
          @click="pasteItem"
          class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
        >
          <FileText :size="16" />
          粘贴
        </button>
        <button 
          v-if="getCurrentLevel() <= 1"
          @click="createNewFolder"
          class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
        >
          新建文件夹
        </button>
        <button 
          v-if="getCurrentLevel() === 2"
          @click="uploadFiles"
          class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
        >
          <FileText :size="16" />
          上传文件
        </button>
      </template>
      
      <!-- 选中项目的右键菜单 -->
      <template v-else>
        <!-- 回收站模式下的右键菜单 -->
        <template v-if="isInRecycleBin">
          <button 
            @click="restoreItem"
            class="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
          >
            还原
          </button>
          <hr class="my-1 border-morandi-200">
          <button 
            @click="showDeleteConfirm"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            永久删除
          </button>
          <button 
            @click="showItemDetails"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            <FileText :size="16" />
            详细信息
          </button>
        </template>
        
        <!-- 正常模式下的右键菜单 -->
        <template v-else>
          <button 
            @click="openItem"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            打开
          </button>
          <button 
            @click="downloadItem"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            下载
          </button>
          <!-- 分享功能，一级文件夹不显示 -->
          <button 
            v-if="!isFirstLevelFolder(selectedItem)"
            @click="showShareDialog"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            分享
          </button>
          <hr class="my-1 border-morandi-200">
          <button 
            @click="copyItem"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            复制
          </button>
          <button 
            @click="cutItem"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            剪切
          </button>
          <hr class="my-1 border-morandi-200">
          <button 
            @click="showDeleteConfirm"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            删除
          </button>
          <button 
            @click="showRenameDialog"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            重命名
          </button>
          <button 
            @click="showMoveDialog"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            移动到
          </button>
          <hr class="my-1 border-morandi-200">
          <button 
            @click="showItemDetails"
            class="w-full px-4 py-2 text-left text-sm text-morandi-700 hover:bg-morandi-50 flex items-center gap-2"
          >
            详细信息
          </button>
        </template>
      </template>
    </div>

    <!-- 重命名对话框 -->
    <div v-if="showRenameDialogState" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">重命名</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">新名称</label>
            <input
              v-model="renameValue"
              type="text"
              placeholder="请输入新名称"
              class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              @keydown.enter="confirmRename"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancelRename"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmRename"
            :disabled="!renameValue.trim()"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 移动对话框 -->
    <div v-if="showMoveDialogState" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">移动到</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">选择目标文件夹</label>
            <div class="max-h-64 overflow-auto border border-morandi-300 rounded-lg">
              <div 
                @click="selectMoveTarget('/')"
                :class="[
                  'px-4 py-2 cursor-pointer border-b border-morandi-100 hover:bg-morandi-50',
                  moveTargetPath === '/' ? 'bg-teal-50 text-teal-700' : ''
                ]"
              >
                <div class="flex items-center gap-2">
                  <FolderClosed :size="16" />
                  <span>根目录</span>
                </div>
              </div>
              <div 
                v-for="folder in availableFolders" 
                :key="folder.id"
                @click="selectMoveTarget(folder.path)"
                :class="[
                  'px-4 py-2 cursor-pointer border-b border-morandi-100 hover:bg-morandi-50',
                  moveTargetPath === folder.path ? 'bg-teal-50 text-teal-700' : ''
                ]"
              >
                <div class="flex items-center gap-2" :style="{ paddingLeft: (folder.level || 0) * 20 + 'px' }">
                  <FolderClosed :size="16" />
                  <span>{{ folder.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancelMove"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmMove"
            :disabled="!moveTargetPath || moveTargetPath === getParentPath(selectedItem?.path || '')"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            移动
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirmState" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4 text-red-600">确认删除</h3>
        <div class="mb-6">
          <p class="text-morandi-700">
            确定要删除 <span class="font-medium">"{{ selectedItem?.name }}"</span> 吗？
          </p>
          <p class="text-sm text-morandi-500 mt-2">
            {{ selectedItem?.type === 'folder' ? '此操作将删除文件夹及其所有内容，' : '' }}删除后可在回收站中恢复。
          </p>
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 详细信息对话框 -->
    <div v-if="showItemDetailsState" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">详细信息</h3>
        <div v-if="selectedItem" class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-morandi-600">名称：</span>
            <span class="text-sm font-medium">{{ selectedItem.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-morandi-600">类型：</span>
            <span class="text-sm font-medium">
              {{ selectedItem.type === 'folder' ? '文件夹' : 
                  selectedItem.type === 'audio' ? '音频文件' : 
                  selectedItem.type === 'document' ? '文档' : '其他文件' }}
            </span>
          </div>
          <div v-if="selectedItem.type !== 'folder'" class="flex justify-between">
            <span class="text-sm text-morandi-600">大小：</span>
            <span class="text-sm font-medium">{{ formatFileSize(selectedItem.size) }}</span>
          </div>
          <div v-if="selectedItem.type === 'folder'" class="flex justify-between">
            <span class="text-sm text-morandi-600">包含项目：</span>
            <span class="text-sm font-medium">{{ selectedItem.itemCount || 0 }} 项</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-morandi-600">修改时间：</span>
            <span class="text-sm font-medium">{{ formatDate(selectedItem.modifiedAt) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-morandi-600">路径：</span>
            <span class="text-sm font-medium text-morandi-500 break-all">{{ selectedItem.path }}</span>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeItemDetails"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 分享对话框 -->
    <div v-if="showShareDialogState" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-[500px]">
        <h3 class="text-lg font-bold mb-4">分享文件</h3>
        <div v-if="selectedItem" class="space-y-4">
          <!-- 分享项目信息 -->
          <div class="p-4 bg-morandi-50 rounded-lg">
            <div class="flex items-center gap-3">
              <FolderClosed v-if="selectedItem.type === 'folder'" :size="20" class="text-teal-600" />
              <FileText v-else :size="20" class="text-blue-600" />
              <div>
                <div class="font-medium">{{ selectedItem.name }}</div>
                <div class="text-sm text-morandi-600">
                  {{ selectedItem.type === 'folder' ? `文件夹 • ${selectedItem.itemCount || 0} 项` : `文件 • ${formatFileSize(selectedItem.size)}` }}
                </div>
              </div>
            </div>
          </div>

          <!-- 分享链接 -->
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">分享链接</label>
            <div class="flex gap-2">
              <input
                v-model="shareLink"
                type="text"
                readonly
                class="flex-1 px-4 py-2 border border-morandi-300 rounded-lg bg-morandi-50 text-morandi-700"
              />
              <button
                @click="copyShareLink"
                class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                复制
              </button>
            </div>
          </div>

          <!-- 分享设置 -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 有效期设置 -->
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">有效期</label>
              <select
                v-model="shareExpireTime"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option :value="1">1天</option>
                <option :value="7">7天</option>
                <option :value="30">30天</option>
                <option :value="0">永久</option>
              </select>
            </div>

            <!-- 访问密码设置 -->
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">访问密码</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="enableSharePassword"
                    type="checkbox"
                    class="w-4 h-4 text-teal-600 border-morandi-300 rounded focus:ring-teal-500"
                  />
                  <span class="text-sm">设置访问密码</span>
                </label>
                <input
                  v-if="enableSharePassword"
                  v-model="sharePassword"
                  type="text"
                  placeholder="请输入访问密码"
                  class="w-full px-3 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <!-- 分享统计信息 -->
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-sm text-blue-700">
              <div class="flex justify-between mb-1">
                <span>访问次数：</span>
                <span class="font-medium">0</span>
              </div>
              <div class="flex justify-between">
                <span>下载次数：</span>
                <span class="font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeShareDialog"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            关闭
          </button>
          <button
            @click="generateShareLink"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            生成链接
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload,FolderClosed,ChevronRight, Music, FileText,Trash2,Shredder,RefreshCcw,FolderSync,ListOrdered,Logs,Grid2x2} from 'lucide-vue-next'
import { useDriveStore, type DriveItem } from '../store/DriveStore'
import { useRouter } from 'vue-router'

interface BreadcrumbPath {
  name: string
  path: string
}

// 使用 DriveStore
const driveStore = useDriveStore()
const router = useRouter()

// 响应式数据
const showCreateFolderDialog = ref(false)
const showUploadDialog = ref(false)
const newFolderName = ref('')
const selectedFiles = ref<File[]>([])

// 排序和视图相关
const sortBy = ref<'name' | 'size' | 'modifiedAt' | 'createdAt' | 'default'>('default')
const viewMode = ref<'grid' | 'list'>('grid')
const showSortMenu = ref(false)

// 右键菜单相关
const showContextMenuState = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedItem = ref<DriveItem | null>(null)

// 重命名相关
const showRenameDialogState = ref(false)
const renameValue = ref('')

// 移动相关
const showMoveDialogState = ref(false)
const moveTargetPath = ref('')

// 删除确认
const showDeleteConfirmState = ref(false)

// 详细信息
const showItemDetailsState = ref(false)

// 刷新状态
const isRefreshing = ref(false)

// 剪贴板
const clipboard = ref<DriveItem | null>(null)
const clipboardAction = ref<'copy' | 'cut' | null>(null)

// 分享相关
const showShareDialogState = ref(false)
const shareLink = ref('')
const shareExpireTime = ref(7) // 分享链接有效期（天）
const sharePassword = ref('')
const enableSharePassword = ref(false)

// 排序选项
const sortOptions = [
  { value: 'name', label: '按名称' },
  { value: 'modifiedAt', label: '按修改时间' },
  { value: 'createdAt', label: '按创建时间' },
  { value: 'size', label: '按大小' }
] as const

// 预设的第一级大类目录
const predefinedCategories = [
  { id: 'music', name: '音乐', icon: 'Music' },
  { id: 'document', name: '文档', icon: 'FileText' },
  { id: 'video', name: '视频', icon: 'Video' },
  { id: 'image', name: '图片', icon: 'Image' }
]

// 计算属性
const breadcrumbPaths = computed<BreadcrumbPath[]>(() => {
  if (driveStore.isInRecycleBin) {
    return [
      { name: '云盘', path: '/' },
      { name: '回收站', path: '/recycle' }
    ]
  }
  
  const paths = driveStore.currentPath.split('/').filter((p: string) => p)
  const result = [{ name: '云盘', path: '/' }]
  
  let currentFullPath = ''
  paths.forEach((path: string) => {
    currentFullPath += '/' + path
    result.push({ name: path, path: currentFullPath })
  })
  
  return result
})

const currentItems = computed(() => {
  if (driveStore.isInRecycleBin) {
    return driveStore.recycleBinItems
  }
  
  if (driveStore.currentPath === '/') {
    return driveStore.driveItems.filter((item: DriveItem) => item.parentId === null)
  }
  
  const currentFolder = findItemByPath(driveStore.currentPath)
  return currentFolder?.children || []
})

const filteredItems = computed(() => {
  let itemsToDisplay: DriveItem[] = driveStore.isInRecycleBin
    ? [...driveStore.recycleBinItems]
    : [...driveStore.currentLevelItems]

  // 搜索过滤
  if (driveStore.searchQuery && !driveStore.isInRecycleBin) {
    const query = driveStore.searchQuery.toLowerCase()
    const searchInItems = (items: DriveItem[]): DriveItem[] => {
      const results: DriveItem[] = []
      for (const item of items) {
        if (item.name.toLowerCase().includes(query)) {
          results.push(item)
        }
        if (item.type === 'folder' && item.children) {
          results.push(...searchInItems(item.children))
        }
      }
      return results
    }
    itemsToDisplay = searchInItems(driveStore.driveItems)
  } else if (driveStore.searchQuery && driveStore.isInRecycleBin) {
    itemsToDisplay = driveStore.recycleBinItems.filter((item: DriveItem) =>
      item.name.toLowerCase().includes(driveStore.searchQuery.toLowerCase())
    )
  }

  // 排序
  return [...itemsToDisplay].sort((a: DriveItem, b: DriveItem) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1
    if (a.type !== 'folder' && b.type === 'folder') return 1

    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return (b.size || 0) - (a.size || 0) // 通常大文件在前
      case 'modifiedAt':
        return b.modifiedAt.getTime() - a.modifiedAt.getTime()
      case 'createdAt':
        return b.createdAt.getTime() - a.createdAt.getTime()
      default:
        return 0
    }
  })
})

const currentFolder = computed(() => {
  return findItemByPath(driveStore.currentPath)
})

const availableFolders = computed(() => {
  const allFolders: DriveItem[] = []
  
  const collectFolders = (items: DriveItem[], level: number = 1) => {
    items.forEach(item => {
      if (item.type === 'folder' && item.id !== selectedItem.value?.id) {
        allFolders.push({ ...item, level })
        if (item.children) {
          collectFolders(item.children, level + 1)
        }
      }
    })
  }
  
  collectFolders(driveStore.driveItems)
  return allFolders
})

// 辅助函数
const getCurrentLevel = (): number => {
  const pathParts = driveStore.currentPath.split('/').filter((p: string) => p)
  return pathParts.length
}

const getCurrentLevelTitle = (): string => {
  if (driveStore.isInRecycleBin) return '回收站'
  
  const level = getCurrentLevel()
  if (level === 0) return '云盘'
  if (level === 1) return currentFolder.value?.name || '大类'
  if (level === 2) return currentFolder.value?.name || '子文件夹'
  return '文件夹'
}

const getEmptyStateMessage = (): string => {
  const level = getCurrentLevel()
  if (level === 0) return '点击右侧的"新建文件夹"开始创建内容'
  if (level === 1) return '点击右侧的"新建文件夹"创建分类'
  if (level === 2) return '点击右侧的"上传文件"添加内容'
  return '此文件夹为空'
}

const findItemByPath = (path: string): DriveItem | undefined => {
  const pathParts = path.split('/').filter((p: string) => p)
  
  if (pathParts.length === 0) return undefined
  
  let current = driveStore.driveItems.find((item: DriveItem) => item.name === pathParts[0])
  
  for (let i = 1; i < pathParts.length && current; i++) {
    current = current.children?.find((item: DriveItem) => item.name === pathParts[i])
  }
  
  return current
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 事件处理
const navigateToPath = (index: number) => {
  const targetPath = breadcrumbPaths.value[index].path
  
  // 如果在回收站模式下点击面包屑，退出回收站模式
  if (driveStore.isInRecycleBin) {
    driveStore.exitRecycleBin()
    return
  }
  
  driveStore.setCurrentPath(targetPath)
}

const handleItemClick = (item: DriveItem) => {
  if (driveStore.isInRecycleBin) {
    return
  }

  if (item.type === 'folder') {
    const newPath = driveStore.currentPath === '/' ? `/${item.name}` : `${driveStore.currentPath}/${item.name}`
    driveStore.setCurrentPath(newPath)
  } else if (item.type === 'audio') {
    const pathParts = item.path.split('/').filter(p => p)
    // 路径结构: /音乐/歌单名/歌曲名.mp3
    if (pathParts.length >= 3) {
      const playlistName = pathParts[1]
      const songName = item.name
      router.push({
        path: '/music',
        query: { playlist: playlistName, song: songName }
      })
    } else {
      console.warn('该音频文件不在一个有效的歌单目录结构中:', item.path)
      // 如果没有歌单信息，只带歌曲名跳转
      router.push({ path: '/music', query: { song: item.name } })
    }
  } else if (item.type === 'document') {
    router.push({
      path: '/docs',
      query: { path: item.path } // 传递唯一的文档路径
    })
  } else {
    // 文档或其他文件类型的点击逻辑 - 之后实现
    console.log('Clicked on file:', item)
  }
}

const createNewFolder = () => {
  const level = getCurrentLevel()
  if (level > 1) {
    alert('只能在根目录或第一级大类中创建文件夹')
    return
  }
  showCreateFolderDialog.value = true
  newFolderName.value = ''
}

const confirmCreateFolder = () => {
  const folderName = newFolderName.value.trim()
  if (!folderName) return

  const level = getCurrentLevel()
  if (level > 1) {
    alert('只能在根目录或第一级大类中创建文件夹')
    return
  }

  // 生成新文件夹ID
  const newId = Date.now().toString()
  const newPath = driveStore.currentPath === '/' ? `/${folderName}` : `${driveStore.currentPath}/${folderName}`
  
  const newFolder: DriveItem = {
    id: newId,
    name: folderName,
    type: 'folder',
    size: 0,
    modifiedAt: new Date(),
    createdAt: new Date(),
    path: newPath,
    parentId: driveStore.currentPath === '/' ? null : currentFolder.value?.id || null,
    level: level + 1,
    itemCount: 0,
    children: []
  }

  // 添加到对应位置
  if (driveStore.currentPath === '/') {
    // 在根目录创建第一级大类文件夹
    driveStore.driveItems.push(newFolder)
  } else {
    // 在第一级大类中创建第二级文件夹
    const parent = currentFolder.value
    if (parent?.children) {
      parent.children.push(newFolder)
      parent.itemCount = (parent.itemCount || 0) + 1
    }
  }

  showCreateFolderDialog.value = false
  newFolderName.value = ''
}

const uploadFiles = () => {
  const level = getCurrentLevel()
  if (level !== 2) {
    alert('只能在第二级文件夹中上传文件')
    return
  }
  showUploadDialog.value = true
  selectedFiles.value = []
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  selectedFiles.value = files
}

const cancelUpload = () => {
  showUploadDialog.value = false
  selectedFiles.value = []
}

const confirmUpload = () => {
  if (selectedFiles.value.length === 0) return

  const level = getCurrentLevel()
  if (level !== 2) {
    alert('只能在第二级文件夹中上传文件')
    return
  }

  // 模拟文件上传
  const parent = currentFolder.value
  if (parent?.children) {
    selectedFiles.value.forEach((file: File) => {
      const fileType = getFileType(file.name)
      const newFile: DriveItem = {
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        type: fileType,
        size: file.size,
        modifiedAt: new Date(),
        createdAt: new Date(),
        path: `${driveStore.currentPath}/${file.name}`,
        parentId: parent.id
      }
      parent.children!.push(newFile)
    })
    parent.itemCount = (parent.itemCount || 0) + selectedFiles.value.length
  }

  showUploadDialog.value = false
  selectedFiles.value = []
  alert(`成功上传 ${selectedFiles.value.length} 个文件`)
}

const getFileType = (fileName: string): 'audio' | 'document' | 'other' => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) return 'audio'
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) return 'document'
  return 'other'
}

const openRecycleBin = () => {
  driveStore.openRecycleBin()
  driveStore.setSearchQuery('')
}

const exitRecycleBin = () => {
  driveStore.exitRecycleBin()
  driveStore.setSearchQuery('')
}

const getParentPath = (path: string): string => {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

// 右键菜单事件处理
const showContextMenu = (event: MouseEvent, item: DriveItem) => {
  event.stopPropagation() // 阻止事件冒泡
  selectedItem.value = item
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenuState.value = true
  
  // 点击其他地方关闭菜单
  document.addEventListener('click', hideContextMenu, { once: true })
}

const hideContextMenu = () => {
  showContextMenuState.value = false
  selectedItem.value = null
}

const preventHide = () => {
  // 阻止菜单自动隐藏
}

// 下载功能
const downloadItem = () => {
  if (selectedItem.value) {
    if (selectedItem.value.type === 'folder') {
      alert(`开始下载文件夹: ${selectedItem.value.name}`)
    } else {
      alert(`开始下载文件: ${selectedItem.value.name}`)
    }
    console.log('下载:', selectedItem.value.name)
  }
  hideContextMenu()
}

// 复制功能
const copyItem = () => {
  if (selectedItem.value) {
    clipboard.value = { ...selectedItem.value }
    clipboardAction.value = 'copy'
    alert(`已复制 "${selectedItem.value.name}" 到剪贴板`)
  }
  hideContextMenu()
}

// 剪切功能
const cutItem = () => {
  if (selectedItem.value) {
    clipboard.value = { ...selectedItem.value }
    clipboardAction.value = 'cut'
    alert(`已剪切 "${selectedItem.value.name}" 到剪贴板`)
  }
  hideContextMenu()
}

// 重命名功能
const showRenameDialog = () => {
  if (selectedItem.value) {
    renameValue.value = selectedItem.value.name
    showRenameDialogState.value = true
  }
  hideContextMenu()
}

const confirmRename = () => {
  const newName = renameValue.value.trim()
  if (!newName || !selectedItem.value) return

  const item = selectedItem.value
  const oldPath = item.path
  const pathParts = oldPath.split('/')
  pathParts[pathParts.length - 1] = newName
  const newPath = pathParts.join('/')

  // 更新item信息
  item.name = newName
  item.path = newPath

  // 如果是文件夹，需要更新所有子项的路径
  const updateChildrenPaths = (folder: DriveItem, oldBasePath: string, newBasePath: string) => {
    if (folder.children) {
      folder.children.forEach((child: DriveItem) => {
        child.path = child.path.replace(oldBasePath, newBasePath)
        if (child.type === 'folder') {
          updateChildrenPaths(child, oldBasePath, newBasePath)
        }
      })
    }
  }

  if (item.type === 'folder') {
    updateChildrenPaths(item, oldPath, newPath)
  }

  showRenameDialogState.value = false
  renameValue.value = ''
  selectedItem.value = null
  alert(`重命名成功`)
}

const cancelRename = () => {
  showRenameDialogState.value = false
  renameValue.value = ''
  selectedItem.value = null
}

// 移动功能
const showMoveDialog = () => {
  if (selectedItem.value) {
    moveTargetPath.value = ''
    showMoveDialogState.value = true
  }
  hideContextMenu()
}

const selectMoveTarget = (path: string) => {
  moveTargetPath.value = path
}

const confirmMove = () => {
  if (!selectedItem.value || !moveTargetPath.value) return

  const item = selectedItem.value
  const targetPath = moveTargetPath.value
  const oldParentPath = getParentPath(item.path)

  // 不能移动到自己或子目录
  if (targetPath.startsWith(item.path)) {
    alert('不能移动到自己或子目录中')
    return
  }

  // 从原位置移除
  const removeFromParent = (parentPath: string, itemId: string) => {
    if (parentPath === '/') {
      const index = driveStore.driveItems.findIndex((i: DriveItem) => i.id === itemId)
      if (index > -1) {
        driveStore.driveItems.splice(index, 1)
      }
    } else {
      const parent = findItemByPath(parentPath)
      if (parent?.children) {
        const index = parent.children.findIndex((i: DriveItem) => i.id === itemId)
        if (index > -1) {
          parent.children.splice(index, 1)
          parent.itemCount = (parent.itemCount || 1) - 1
        }
      }
    }
  }

  // 添加到新位置
  const addToParent = (parentPath: string, item: DriveItem) => {
    if (parentPath === '/') {
      item.parentId = null
      item.path = `/${item.name}`
      driveStore.driveItems.push(item)
    } else {
      const parent = findItemByPath(parentPath)
      if (parent?.children) {
        item.parentId = parent.id
        item.path = `${parentPath}/${item.name}`
        parent.children.push(item)
        parent.itemCount = (parent.itemCount || 0) + 1
      }
    }
  }

  // 更新子项路径
  const updateChildrenPaths = (folder: DriveItem, newBasePath: string) => {
    if (folder.children) {
      folder.children.forEach((child: DriveItem) => {
        child.path = `${newBasePath}/${child.name}`
        if (child.type === 'folder') {
          updateChildrenPaths(child, child.path)
        }
      })
    }
  }

  removeFromParent(oldParentPath, item.id)
  addToParent(targetPath, item)

  if (item.type === 'folder') {
    updateChildrenPaths(item, item.path)
  }

  showMoveDialogState.value = false
  moveTargetPath.value = ''
  selectedItem.value = null
  alert(`移动成功`)
}

const cancelMove = () => {
  showMoveDialogState.value = false
  moveTargetPath.value = ''
  selectedItem.value = null
}

// 删除功能（移动到回收站）
const showDeleteConfirm = () => {
  if (selectedItem.value) {
    showDeleteConfirmState.value = true
  }
  hideContextMenu()
}

const confirmDelete = () => {
  if (!selectedItem.value) return

  const item = selectedItem.value
  const parentPath = getParentPath(item.path)

  // 如果在回收站模式下，是真正删除
  if (driveStore.isInRecycleBin) {
    const index = driveStore.recycleBinItems.findIndex((i: DriveItem) => i.id === item.id)
    if (index > -1) {
      driveStore.recycleBinItems.splice(index, 1)
    }
    showDeleteConfirmState.value = false
    selectedItem.value = null
    alert(`"${item.name}" 已永久删除`)
    return
  }

  // 正常模式下移动到回收站
  // 从父级移除
  if (parentPath === '/') {
    const index = driveStore.driveItems.findIndex((i: DriveItem) => i.id === item.id)
    if (index > -1) {
      driveStore.driveItems.splice(index, 1)
    }
  } else {
    const parent = findItemByPath(parentPath)
    if (parent?.children) {
      const index = parent.children.findIndex((i: DriveItem) => i.id === item.id)
      if (index > -1) {
        parent.children.splice(index, 1)
        parent.itemCount = (parent.itemCount || 1) - 1
      }
    }
  }

  // 添加到回收站
  driveStore.recycleBinItems.push({
    ...item,
    deletedAt: new Date()
  })

  showDeleteConfirmState.value = false
  selectedItem.value = null
  alert(`"${item.name}" 已移至回收站`)
}

const cancelDelete = () => {
  showDeleteConfirmState.value = false
  selectedItem.value = null
}

// 回收站相关功能
const restoreAllItems = () => {
  if (driveStore.recycleBinItems.length === 0) return

  if (confirm(`确定要还原所有 ${driveStore.recycleBinItems.length} 个项目吗？`)) {
    driveStore.recycleBinItems.forEach((item: DriveItem) => {
      // 移除deletedAt属性
      const { deletedAt, ...restoreItem } = item
      
      // 还原到原位置（简化逻辑，暂时放到根目录）
      const restoredItem: DriveItem = {
        ...restoreItem,
        path: `/${restoreItem.name}`,
        parentId: null
      }
      
      driveStore.driveItems.push(restoredItem)
    })
    
    driveStore.recycleBinItems.length = 0
    alert('所有项目已还原到根目录')
  }
}

const deleteAllItems = () => {
  if (driveStore.recycleBinItems.length === 0) return

  if (confirm(`确定要永久删除所有 ${driveStore.recycleBinItems.length} 个项目吗？此操作不可撤销！`)) {
    driveStore.recycleBinItems.length = 0
    alert('所有项目已永久删除')
  }
}

// 还原单个项目
const restoreItem = () => {
  if (!selectedItem.value) return

  const item = selectedItem.value
  const { deletedAt, ...restoreItem } = item

  // 还原到原位置（简化逻辑，暂时放到根目录）
  const restoredItem: DriveItem = {
    ...restoreItem,
    path: `/${restoreItem.name}`,
    parentId: null
  }

  // 从回收站移除
  const index = driveStore.recycleBinItems.findIndex((i: DriveItem) => i.id === item.id)
  if (index > -1) {
    driveStore.recycleBinItems.splice(index, 1)
  }

  // 添加到根目录
  driveStore.driveItems.push(restoredItem)

  hideContextMenu()
  alert(`"${item.name}" 已还原到根目录`)
}

// 打开功能
const openItem = () => {
  if (selectedItem.value) {
    if (selectedItem.value.type === 'folder') {
      driveStore.setCurrentPath(selectedItem.value.path)
    } else {
      console.log('打开文件:', selectedItem.value.name)
      alert(`打开文件: ${selectedItem.value.name}`)
    }
  }
  hideContextMenu()
}

// 详细信息功能
const showItemDetails = () => {
  if (selectedItem.value) {
    showItemDetailsState.value = true
  }
  hideContextMenu()
}

const closeItemDetails = () => {
  showItemDetailsState.value = false
  selectedItem.value = null
}

// 刷新功能
const refreshItems = async () => {
  isRefreshing.value = true
  
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 根据当前模式显示不同的刷新消息
  if (driveStore.isInRecycleBin) {
    console.log('回收站刷新完成')
    alert('回收站刷新完成')
  } else {
    console.log('云盘刷新完成')
    alert('云盘刷新完成')
  }
  
  isRefreshing.value = false
}

// 排序功能
const selectSort = (criteria: 'name' | 'size' | 'modifiedAt' | 'createdAt') => {
  sortBy.value = criteria
  showSortMenu.value = false
}

// 关闭排序菜单
const closeSortMenu = () => {
  showSortMenu.value = false
}

// 切换排序菜单
const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value
  
  if (showSortMenu.value) {
    // 点击其他地方关闭菜单
    document.addEventListener('click', closeSortMenu, { once: true })
  }
}

// 空白区域右键菜单
const showEmptyContextMenu = (event: MouseEvent) => {
  selectedItem.value = null
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenuState.value = true
  
  // 点击其他地方关闭菜单
  document.addEventListener('click', hideContextMenu, { once: true })
}

// 粘贴功能
const pasteItem = () => {
  if (!clipboard.value || !clipboardAction.value) return

  const item = { ...clipboard.value }
  const newId = Date.now().toString() + Math.random().toString()
  const newPath = driveStore.currentPath === '/' ? `/${item.name}` : `${driveStore.currentPath}/${item.name}`
  
  // 检查名称冲突
  const existingItems = currentItems.value
  let finalName = item.name
  let counter = 1
  
  while (existingItems.some((existing: DriveItem) => existing.name === finalName)) {
    const nameWithoutExt = item.name.split('.').slice(0, -1).join('.')
    const ext = item.name.split('.').pop()
    if (item.name.includes('.') && item.type !== 'folder') {
      finalName = `${nameWithoutExt}_副本${counter > 1 ? counter : ''}.${ext}`
    } else {
      finalName = `${item.name}_副本${counter > 1 ? counter : ''}`
    }
    counter++
  }

  const newItem: DriveItem = {
    ...item,
    id: newId,
    name: finalName,
    path: driveStore.currentPath === '/' ? `/${finalName}` : `${driveStore.currentPath}/${finalName}`,
    parentId: driveStore.currentPath === '/' ? null : currentFolder.value?.id || null,
    modifiedAt: new Date(),
    createdAt: new Date(),
    children: item.type === 'folder' ? [] : undefined,
    itemCount: item.type === 'folder' ? 0 : undefined
  }

  // 添加到当前位置
  if (driveStore.currentPath === '/') {
    driveStore.driveItems.push(newItem)
  } else {
    const parent = currentFolder.value
    if (parent?.children) {
      parent.children.push(newItem)
      parent.itemCount = (parent.itemCount || 0) + 1
    }
  }

  // 如果是剪切操作，从原位置删除
  if (clipboardAction.value === 'cut') {
    const originalParentPath = getParentPath(clipboard.value.path)
    if (originalParentPath === '/') {
      const index = driveStore.driveItems.findIndex((i: DriveItem) => i.id === clipboard.value!.id)
      if (index > -1) {
        driveStore.driveItems.splice(index, 1)
      }
    } else {
      const parent = findItemByPath(originalParentPath)
      if (parent?.children) {
        const index = parent.children.findIndex((i: DriveItem) => i.id === clipboard.value!.id)
        if (index > -1) {
          parent.children.splice(index, 1)
          parent.itemCount = (parent.itemCount || 1) - 1
        }
      }
    }
    
    // 清空剪贴板
    clipboard.value = null
    clipboardAction.value = null
  }

  hideContextMenu()
  alert(`${clipboardAction.value === 'cut' ? '移动' : '复制'}成功`)
}

// 格式化日期
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 判断是否为一级文件夹（不显示分享选项）
const isFirstLevelFolder = (item: DriveItem | null): boolean => {
  if (!item || item.type !== 'folder') return false
  return item.level === 1 // 一级大类文件夹
}

// 分享功能
const showShareDialog = () => {
  if (selectedItem.value) {
    showShareDialogState.value = true
    // 重置分享设置
    shareLink.value = ''
    shareExpireTime.value = 7
    sharePassword.value = ''
    enableSharePassword.value = false
  }
  hideContextMenu()
}

const closeShareDialog = () => {
  showShareDialogState.value = false
  selectedItem.value = null
}

const generateShareLink = () => {
  if (!selectedItem.value) return

  // 生成分享链接（模拟）
  const itemType = selectedItem.value.type === 'folder' ? 'folder' : 'file'
  const baseUrl = 'https://liteisle.com/share'
  const shareId = Math.random().toString(36).substring(2, 15)
  
  let link = `${baseUrl}/${itemType}/${shareId}`
  
  // 添加密码参数（如果启用）
  if (enableSharePassword.value && sharePassword.value) {
    link += `?pwd=${sharePassword.value}`
  }
  
  shareLink.value = link
  
  // 显示成功提示
  alert(`分享链接已生成！\n有效期：${shareExpireTime.value === 0 ? '永久' : shareExpireTime.value + '天'}`)
}

const copyShareLink = async () => {
  if (!shareLink.value) {
    alert('请先生成分享链接')
    return
  }

  try {
    await navigator.clipboard.writeText(shareLink.value)
    alert('分享链接已复制到剪贴板')
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = shareLink.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('分享链接已复制到剪贴板')
  }
}
</script> 