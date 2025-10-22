import * as fs from 'fs-extra';
import * as path from 'path';
import {
  FileStats,
  FileOperationResult,
  DirectoryContent,
  CopyOptions,
  WriteOptions,
  ReadOptions,
} from '../types/fileSystem';

export class FileSystemService {
  /**
   * Read the contents of a file
   */
  public async readFile(
    filePath: string,
    options: ReadOptions = {}
  ): Promise<FileOperationResult<string | Buffer>> {
    try {
      const content = await fs.readFile(path.resolve(filePath), options);
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Write content to a file
   */
  public async writeFile(
    filePath: string,
    content: string | Buffer,
    options: WriteOptions = {}
  ): Promise<FileOperationResult> {
    try {
      await fs.writeFile(path.resolve(filePath), content, options);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * List contents of a directory
   */
  public async listDirectory(dirPath: string): Promise<FileOperationResult<DirectoryContent[]>> {
    try {
      const absolutePath = path.resolve(dirPath);
      const entries = await fs.readdir(absolutePath, { withFileTypes: true });
      
      const contents = await Promise.all(
        entries.map(async (entry) => {
          const entryPath = path.join(absolutePath, entry.name);
          const stats = await this.getStats(entryPath);
          
          if (!stats.success || !stats.data) {
            throw new Error(`Failed to get stats for ${entryPath}`);
          }

          return {
            name: entry.name,
            path: entryPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            stats: stats.data,
          };
        })
      );

      return { success: true, data: contents };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Create a directory
   */
  public async createDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      await fs.mkdir(path.resolve(dirPath), { recursive: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Delete a file or directory
   */
  public async delete(targetPath: string, recursive = true): Promise<FileOperationResult> {
    try {
      const absolutePath = path.resolve(targetPath);
      await fs.remove(absolutePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Copy a file or directory
   */
  public async copy(
    sourcePath: string,
    destinationPath: string,
    options: CopyOptions = {}
  ): Promise<FileOperationResult> {
    try {
      await fs.copy(
        path.resolve(sourcePath),
        path.resolve(destinationPath),
        options
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Move/rename a file or directory
   */
  public async move(
    sourcePath: string,
    destinationPath: string,
    options: CopyOptions = {}
  ): Promise<FileOperationResult> {
    try {
      await fs.move(
        path.resolve(sourcePath),
        path.resolve(destinationPath),
        options
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get stats for a file or directory
   */
  public async getStats(targetPath: string): Promise<FileOperationResult<FileStats>> {
    try {
      const stats = await fs.stat(path.resolve(targetPath));
      
      const fileStats: FileStats = {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        permissions: stats.mode.toString(8),
      };

      return { success: true, data: fileStats };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}