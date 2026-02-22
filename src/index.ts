
/* IMPORT */

import path from 'node:path';
import process from 'node:process';
import readdir from 'tiny-readdir';
import {castArray, globsExplode, globsCompile, globsPartition, ignoreCompile, uniqFlat} from './utils';
import type {Dirent, Options, Result} from './types';

/* MAIN */

const readdirGlob = async ( glob: string | string[], options?: Options ): Promise<Result> => {

  const [globsPositive, globsNegative] = globsPartition ( castArray ( glob ) );

  const cwd = options?.cwd ?? process.cwd ();
  const ignore = [...castArray ( options?.ignore ?? [] ), ...globsNegative];

  const bucketDirectories: string[][] = [];
  const bucketFiles: string[][] = [];
  const bucketSymlinks: string[][] = [];

  for ( const [folders, foldersGlobs] of globsExplode ( globsPositive ) ) {

    const isMatch = globsCompile ( foldersGlobs );

    for ( const folder of folders ) {

      const rootPath = path.join ( cwd, folder ).replace ( /\/$/, '' );
      const isIgnored = ignoreCompile ( rootPath, ignore );
      const isRelativeMatch = ( targetPath: string ) => isMatch ( rootPath, targetPath );

      const result = await readdir ( rootPath, {
        depth: options?.depth,
        limit: options?.limit,
        followSymlinks: options?.followSymlinks,
        ignore: isIgnored,
        signal: options?.signal,
        onDirents: options?.onDirents
      });

      bucketDirectories.push ( result.directories.filter ( isRelativeMatch ) );
      bucketFiles.push ( result.files.filter ( isRelativeMatch ) );
      bucketSymlinks.push ( result.symlinks.filter ( isRelativeMatch ) );

    }

  }

  const directories = uniqFlat ( bucketDirectories );
  const files = uniqFlat ( bucketFiles );
  const symlinks = uniqFlat ( bucketSymlinks );

  return { directories, files, symlinks };

};

/* EXPORT */

export default readdirGlob;
export type {Dirent, Options, Result};
