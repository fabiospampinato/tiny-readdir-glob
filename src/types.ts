
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
  directories: string[],
  files: string[],
  symlinks: string[]
};

/* EXPORT */

export type {ArrayMaybe, PromiseMaybe, Dirent, Options, Result};
