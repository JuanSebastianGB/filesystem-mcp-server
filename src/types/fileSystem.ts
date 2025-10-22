export interface FileStats {
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
  isDirectory: boolean;
  isFile: boolean;
  permissions?: string;
}

export interface FileOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface DirectoryContent {
  name: string;
  path: string;
  type: 'file' | 'directory';
  stats: FileStats;
}

export interface CopyOptions {
  overwrite?: boolean;
  preserveTimestamps?: boolean;
  errorOnExist?: boolean;
}

export interface WriteOptions {
  encoding?: BufferEncoding;
  mode?: number;
  flag?: string;
}

export interface ReadOptions {
  encoding?: BufferEncoding;
  flag?: string;
}
