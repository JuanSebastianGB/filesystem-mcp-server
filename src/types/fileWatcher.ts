export type FileChangeEventType = 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';

export interface FileChangeEvent {
  type: FileChangeEventType;
  path: string;
  stats?: {
    size: number;
    mtime: Date;
    ctime: Date;
  };
}

export interface WatchOptions {
  /** Whether to watch files and directories in subdirectories */
  recursive?: boolean;
  /** File/directory patterns to ignore (glob patterns) */
  ignored?: string | RegExp | Array<string | RegExp>;
  /** How often to poll for changes in milliseconds (default: 100) */
  interval?: number;
  /** Whether to ignore initial scan (default: false) */
  ignoreInitial?: boolean;
  /** Whether to follow symlinks (default: true) */
  followSymlinks?: boolean;
  /** Maximum delay in milliseconds before emitting events (default: 50) */
  awaitWriteFinish?: boolean | { 
    /** Delay in milliseconds (default: 2000) */
    stabilityThreshold?: number;
    /** Time to wait before starting stability timer (default: 100) */
    pollInterval?: number;
  };
}

export interface WatchHandle {
  /** The path being watched */
  path: string;
  /** Stop watching the path */
  close(): Promise<void>;
  /** Check if the watcher is still active */
  isWatching(): boolean;
  /** Get current watch options */
  getOptions(): WatchOptions;
}