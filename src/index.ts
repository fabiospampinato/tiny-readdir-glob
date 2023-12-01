
/* IMPORT */

import path from 'node:path';
import process from 'node:process';
import readdir from 'tiny-readdir';
import {castArray, globsExplode, globsCompile, ignoreCompile, intersection, uniqFlat} from './utils';
import type {Options, Result} from './types';

/* MAIN */

const readdirGlob = async ( glob: string | string[], options?: Options ): Promise<Result> => {

  const globs = castArray ( glob );
  const cwd = options?.cwd ?? process.cwd ();

  const bucketDirectories: string[][] = [];
  const bucketFiles: string[][] = [];
  const bucketSymlinks: string[][] = [];

  const bucketDirectoriesFound: string[][] = [];
  const bucketFilesFound: string[][] = [];
  const bucketSymlinksFound: string[][] = [];

  const bucketDirectoriesFoundNames: Set<string>[] = [];
  const bucketFilesFoundNames: Set<string>[] = [];
  const bucketSymlinksFoundNames: Set<string>[] = [];

  for ( const [folders, foldersGlobs] of globsExplode ( globs ) ) {

    const isMatch = globsCompile ( foldersGlobs );

    for ( const folder of folders ) {

      const rootPath = path.join ( cwd, folder ).replace ( /\/$/, '' );
      const isIgnored = ignoreCompile ( rootPath, options?.ignore );
      const isRelativeMatch = ( targetPath: string ) => isMatch ( rootPath, targetPath );

      const result = await readdir ( rootPath, {
        depth: options?.depth,
        limit: options?.limit,
        followSymlinks: options?.followSymlinks,
        ignore: isIgnored,
        signal: options?.signal
      });

      bucketDirectories.push ( result.directories.filter ( isRelativeMatch ) );
      bucketFiles.push ( result.files.filter ( isRelativeMatch ) );
      bucketSymlinks.push ( result.symlinks.filter ( isRelativeMatch ) );

      bucketDirectoriesFound.push ( result.directories );
      bucketFilesFound.push ( result.files );
      bucketSymlinksFound.push ( result.symlinks );

      bucketDirectoriesFoundNames.push ( result.directoriesNames );
      bucketFilesFoundNames.push ( result.filesNames );
      bucketSymlinksFoundNames.push ( result.symlinksNames );

    }

  }

  const directories = uniqFlat ( bucketDirectories );
  const files = uniqFlat ( bucketFiles );
  const symlinks = uniqFlat ( bucketSymlinks );

  const directoriesFound = uniqFlat ( bucketDirectoriesFound );
  const filesFound = uniqFlat ( bucketFilesFound );
  const symlinksFound = uniqFlat ( bucketSymlinksFound );

  const directoriesFoundNames = intersection ( bucketDirectoriesFoundNames );
  const filesFoundNames = intersection ( bucketFilesFoundNames );
  const symlinksFoundNames = intersection ( bucketSymlinksFoundNames );

  return { directories, files, symlinks, directoriesFound, filesFound, symlinksFound, directoriesFoundNames, filesFoundNames, symlinksFoundNames };

};

/* EXPORT */

export default readdirGlob;
