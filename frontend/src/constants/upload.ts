/** File extensions that are blocked from upload. */
export const BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.msi',
  '.com',
  '.scr',
  '.ps1',
  '.vbs',
  '.jar',
] as const;

/** Maximum file size in bytes (50 MB). */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Maximum number of files per upload. */
export const MAX_FILES = 10;
