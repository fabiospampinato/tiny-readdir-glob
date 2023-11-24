
/* MAIN */

type Options = {
  cwd?: string,
  depth?: number,
  limit?: number,
  followSymlinks?: boolean,
  ignore?: (( targetPath: string ) => boolean) | RegExp | string | string[],
  signal?: { aborted: boolean }
};

type Result = {
  /* MATCHED */
  directories: string[],
  files: string[],
  symlinks: string[],
  /* FOUND */
  directoriesFound: string[],
  filesFound: string[],
  symlinksFound: string[]
};

/* EXPORT */

export type {Options, Result};