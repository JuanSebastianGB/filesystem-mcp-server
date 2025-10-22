import path from 'path';

export type PathOptions = {
  root?: string; // allowed root base for resolution
};

/**
 * Normalize a path and remove redundant separators.
 */
export function normalize(p: string): string {
  return path.normalize(p);
}

/**
 * Resolve a user-supplied path against an optional root. If root is provided,
 * the returned resolved path will be within the root or an error is thrown.
 */
export function safeResolve(input: string, opts: PathOptions = {}): string {
  const { root } = opts;
  const resolved = root ? path.resolve(root, input) : path.resolve(input);

  if (root) {
    const rootResolved = path.resolve(root);
    if (!isInsideRoot(resolved, rootResolved)) {
      throw new Error(`Resolved path is outside of the allowed root: ${resolved}`);
    }
  }

  return resolved;
}

/**
 * Return true when `candidate` is inside `root` (or equal to it).
 * Both paths should be absolute.
 */
export function isInsideRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  // path.relative returns '' when same, or paths that start with '..' when outside
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * Validate an individual path segment (no traversal characters, no null bytes).
 */
export function validateSegment(segment: string): boolean {
  if (segment.length === 0) return false;
  if (segment.includes('\0')) return false;
  if (segment === '.' || segment === '..') return false;
  // Disallow path separators in a single segment
  if (segment.includes(path.sep) || segment.includes('/')) return false;
  return true;
}

export default {
  normalize,
  safeResolve,
  isInsideRoot,
  validateSegment,
};
