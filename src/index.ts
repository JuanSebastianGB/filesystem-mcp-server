import * as fs from 'fs-extra';
import * as path from 'path';
import { FileSystemService } from './services/FileSystemService';
import { FileWatcherService } from './services/FileWatcherService';
import { FileChangeEvent } from './types/fileWatcher';

const fileSystem = new FileSystemService();
const fileWatcher = new FileWatcherService();

// Example usage
async function main() {
  try {
    const testDir = './test-dir';
    
    // Set up file watcher
    fileWatcher.on('change', (event: FileChangeEvent) => {
      console.log('File system event:', event);
    });
    
    // Create test directory
    await fileSystem.createDirectory(testDir);
    
    // Start watching the directory
    const watchHandle = await fileWatcher.watch(testDir, {
      recursive: true,
      ignoreInitial: false
    });
    
    console.log(`Watching directory: ${watchHandle.path}`);
    
    // Perform some file operations to trigger events
    setTimeout(async () => {
      // Create a file
      await fileSystem.writeFile(
        path.join(testDir, 'test.txt'),
        'Hello, File System!'
      );
      
      // Modify the file
      setTimeout(async () => {
        await fileSystem.writeFile(
          path.join(testDir, 'test.txt'),
          'Updated content!'
        );
        
        // Create a subdirectory
        setTimeout(async () => {
          await fileSystem.createDirectory(path.join(testDir, 'subdir'));
          
          // Clean up after 2 seconds
          setTimeout(async () => {
            await watchHandle.close();
            await fileSystem.delete(testDir, true);
            console.log('Cleanup complete');
          }, 2000);
        }, 1000);
      }, 1000);
    }, 1000);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the example
main().catch(console.error);

async function getFileInfo(filePath: string) {
  try {
    const stats = await fs.stat(path.resolve(filePath));
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile()
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}

// TODO: Implement MCP server functionality
console.log('File System MCP Server starting...');

// Example usage
async function main() {
  try {
    const currentDir = process.cwd();
    console.log('Current directory contents:', await listDirectory(currentDir));
    
    const packageInfo = await getFileInfo('package.json');
    console.log('Package.json info:', packageInfo);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();