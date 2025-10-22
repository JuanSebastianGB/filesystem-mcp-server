import * as chokidar from 'chokidar';
import * as path from 'path';
import { EventEmitter } from 'events';
import {
  FileChangeEvent,
  FileChangeEventType,
  WatchOptions,
  WatchHandle,
} from '../types/fileWatcher';

export class FileWatcherService extends EventEmitter {
  private watchers: Map<string, chokidar.FSWatcher>;
  private static readonly DEFAULT_OPTIONS: WatchOptions = {
    recursive: true,
    ignoreInitial: false,
    followSymlinks: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  };

  constructor() {
    super();
    this.watchers = new Map();
  }

  /**
   * Watch a file or directory for changes
   * @param targetPath Path to watch
   * @param options Watch options
   * @returns A handle to control the watch
   */
  public async watch(
    targetPath: string,
    options: WatchOptions = {}
  ): Promise<WatchHandle> {
    const absolutePath = path.resolve(targetPath);
    
    // Don't create duplicate watchers
    if (this.watchers.has(absolutePath)) {
      throw new Error(`Already watching path: ${absolutePath}`);
    }

    const mergedOptions = { ...FileWatcherService.DEFAULT_OPTIONS, ...options };
    const watcher = chokidar.watch(absolutePath, {
      persistent: true,
      ignoreInitial: mergedOptions.ignoreInitial,
      followSymlinks: mergedOptions.followSymlinks,
      ignored: mergedOptions.ignored,
      depth: mergedOptions.recursive ? undefined : 0,
      awaitWriteFinish: mergedOptions.awaitWriteFinish,
      interval: mergedOptions.interval,
    });

    // Set up event handlers
    const eventHandler = (type: FileChangeEventType) => (filePath: string, stats?: any) => {
      const event: FileChangeEvent = {
        type,
        path: filePath,
        stats: stats ? {
          size: stats.size,
          mtime: stats.mtime,
          ctime: stats.ctime,
        } : undefined,
      };
      this.emit('change', event);
    };

    // Watch for all types of events
    watcher
      .on('add', eventHandler('add'))
      .on('change', eventHandler('change'))
      .on('unlink', eventHandler('unlink'))
      .on('addDir', eventHandler('addDir'))
      .on('unlinkDir', eventHandler('unlinkDir'))
      .on('error', (error) => this.emit('error', error));

    // Store the watcher
    this.watchers.set(absolutePath, watcher);

    // Create and return the watch handle
    return {
      path: absolutePath,
      async close(): Promise<void> {
        await watcher.close();
      },
      isWatching(): boolean {
        return !watcher.closed;
      },
      getOptions(): WatchOptions {
        return mergedOptions;
      },
    };
  }

  /**
   * Stop watching a specific path
   * @param targetPath Path to stop watching
   */
  public async unwatch(targetPath: string): Promise<void> {
    const absolutePath = path.resolve(targetPath);
    const watcher = this.watchers.get(absolutePath);
    
    if (watcher) {
      await watcher.close();
      this.watchers.delete(absolutePath);
    }
  }

  /**
   * Stop all file watchers
   */
  public async unwatchAll(): Promise<void> {
    const closePromises = Array.from(this.watchers.values()).map((watcher) =>
      watcher.close()
    );
    await Promise.all(closePromises);
    this.watchers.clear();
  }

  /**
   * Get all currently watched paths
   */
  public getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }

  /**
   * Check if a path is being watched
   */
  public isWatching(targetPath: string): boolean {
    const absolutePath = path.resolve(targetPath);
    return this.watchers.has(absolutePath);
  }
}