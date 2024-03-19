
/* IMPORT */

import type {Dirent} from 'tiny-readdir';

/* HELPERS */

type ArrayMaybe<T> = T[] | T;

type PromiseMaybe<T> = Promise<T> | T;

/* MAIN */

type Options = {
  cwd?: string,
  depth?: number,
  limit?: number,
  followSymlinks?: boolean,
  ignore?: ArrayMaybe<(( targetPath: string ) => boolean) | RegExp | string>,
  signal?: { aborted: boolean },
  onDirents?: ( dirents: Dirent[] ) => PromiseMaybe<undefined>
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

export type {ArrayMaybe, PromiseMaybe, Dirent, Options, Result};
