import * as fs from 'fs-extra';
import * as path from 'path';

// Basic file system operations
async function listDirectory(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(path.resolve(dirPath));
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
}

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