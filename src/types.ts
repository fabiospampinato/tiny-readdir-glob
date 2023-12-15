
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
  symlinksFound: string[],
  directoriesFoundNames: Set<string>,
  filesFoundNames: Set<string>,
  symlinksFoundNames: Set<string>,
  directoriesFoundNamesToPaths: Record<string, string[]>,
  filesFoundNamesToPaths: Record<string, string[]>,
  symlinksFoundNamesToPaths: Record<string, string[]>
};

/* EXPORT */

export type {Options, Result};
