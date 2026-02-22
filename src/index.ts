
/* IMPORT */

import path from 'node:path';
import process from 'node:process';
import readdir from 'tiny-readdir';
import zeptomatch from 'zeptomatch';
import {castArray, getGlobsPartition, isFunction, isRegExp, isString} from './utils';
import type {Dirent, DirentLike, Options, Result} from './types';

/* MAIN */

const readdirGlob = async ( glob: string | string[], options?: Options ): Promise<Result> => {

  const cwd = options?.cwd ?? process.cwd ();

  const globsPartition = getGlobsPartition ( castArray ( glob ) );
  const globsPositive = globsPartition[0];
  const ignores = [...castArray ( options?.ignore ?? [] ), ...globsPartition[1]];
  const globsNegative = ignores.filter ( ignore => isString ( ignore ) );
  const regexesNegative = ignores.filter ( ignore => isRegExp ( ignore ) );
  const functionsNegative = ignores.filter ( ignore => isFunction ( ignore ) );

  const resultEmpty: Result = { directories: [], files: [], symlinks: [] };
  const result: Result = { directories: [], files: [], symlinks: [] };

  const isIgnored = ( targetPath: string, dirent: DirentLike ): boolean => {
    const isDirectory = dirent.isDirectory ();
    const isSymbolicLink = dirent.isSymbolicLink ();
    const targetRelativePath = path.relative ( cwd, targetPath );

    if (
      // Ignored by some negative functions
      functionsNegative.some ( fn => fn ( targetPath, dirent ) ) ||
      // Ignored by some negative regex
      regexesNegative.some ( re => re.test ( targetPath ) ) ||
      // Ignored by some negative glob
      zeptomatch ( globsNegative, targetRelativePath, { partial: false } ) ||
      // Doesn't match and can't match in the future any positive globs
      !zeptomatch ( globsPositive, targetRelativePath, { partial: isDirectory } )
    ) {
      return true;
    }

    // Manually populating directories and symlinks, as they might get ignored early
    if ( targetPath !== cwd ) {
      if ( isDirectory || isSymbolicLink ) {
        if ( zeptomatch ( globsPositive, targetRelativePath, { partial: false } ) ) {
          if ( isDirectory ) {
            result.directories.push ( targetPath );
          } else if ( isSymbolicLink ) {
            result.symlinks.push ( targetPath );
          }
        }
      }
    }

    return false;
  };

  const {files} = await readdir ( cwd, {
    depth: options?.depth,
    limit: options?.limit,
    followSymlinks: options?.followSymlinks,
    ignore: isIgnored,
    signal: options?.signal,
    onDirents: options?.onDirents
  });

  if ( options?.signal?.aborted ) return resultEmpty;

  result.files = files;

  return result;

};

/* EXPORT */

export default readdirGlob;
export type {Dirent, DirentLike, Options, Result};
