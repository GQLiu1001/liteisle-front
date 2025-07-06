export interface ElectronAPI {
  // 窗口控制
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // 文件系统操作
  selectDirectory: () => Promise<Electron.OpenDialogReturnValue>;

  // 窗口状态监听
  onMaximize: (callback: () => void) => void;
  onUnmaximize: (callback: () => void) => void;
}

// 声明全局window对象上的electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}