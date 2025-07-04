export interface ElectronAPI {
  // 窗口控制
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // 文件系统操作
  selectDirectory: () => Promise<{
    canceled: boolean;
    filePaths?: string[];
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}