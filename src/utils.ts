
/* IMPORT */

import path from 'node:path';
import zeptomatch from 'zeptomatch';
import {explodeStart, explodeEnd} from 'zeptomatch-explode';
import isStatic from 'zeptomatch-is-static';
import unescape from 'zeptomatch-unescape';
import type {ArrayMaybe} from './types';

/* MAIN */

const castArray = <T> ( value: T | T[] ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const globExplode = ( glob: string ): [paths: string[], glob: string] => {

  if ( isStatic ( glob ) ) { // Handling it as a relative path, not a glob

    return [[unescape ( glob )], '**/*'];

  } else { // Handling it as an actual glob

    const {statics, dynamic} = explodeStart ( glob );

    return [statics, dynamic];

  }

};

const globsExplode = ( globs: string[] ): [paths: string[], globs: string[]][] => { //TODO: Optimize this more, avoiding searching both in src/ and src/foo with the same glob

  const results: [string[], string[]][] = [];

  for ( const glob of globs ) {

    const [paths, pathsGlob] = globExplode ( glob );

    if ( !paths.length ) {

      paths.push ( '' );

    }

    for ( const path of paths ) {

      const existing = results.find ( result => result[0].includes ( path ) );

      if ( existing ) {

        if ( !existing[1].includes ( pathsGlob ) ) {

          existing[1].push ( pathsGlob );

        }

      } else {

        results.push ([ [path], [pathsGlob] ]);

      }

    }

  }

  return results;

};

const globCompile = ( glob: string ): (( rootPath: string, targetPath: string ) => boolean) => { //TODO: Optimize this more, accounting for more scenarios

  if ( !glob || glob === '**/*' ) { // Trivial case

    return () => true;

  }

  const {flexibleStart, flexibleEnd, statics, dynamic} = explodeEnd ( glob );

  if ( dynamic === '**/*' && statics.length && !flexibleEnd ) { // Optimized case

    return ( rootPath: string, targetPath: string ): boolean => {

      for ( let i = 0, l = statics.length; i < l; i++ ) {

        const end = statics[i];

        if ( !targetPath.endsWith ( end ) ) continue;

        if ( flexibleStart ) return true;

        if ( targetPath.length === end.length ) return true;

        if ( isPathSep ( targetPath[targetPath.length - end.length - 1 ] ) ) return true;

      }

      return false;

    };

  } else { // Unoptimized case

    const re = zeptomatch.compile ( glob );

    return ( rootPath: string, targetPath: string ): boolean => {

      return re.test ( path.relative ( rootPath, targetPath ) );

    };

  }

};

const globsCompile = ( globs: string[] ): (( rootPath: string, targetPath: string ) => boolean) => {

  const fns = globs.map ( globCompile );

  return ( rootPath, targetPath ) => fns.some ( fn => fn ( rootPath, targetPath ) );

};

const ignoreCompile = ( rootPath: string, ignore?: ArrayMaybe<(( targetPath: string ) => boolean) | RegExp | string> ): ArrayMaybe<(( targetPath: string ) => boolean) | RegExp> | undefined => {

  if ( !ignore ) return;

  return castArray ( ignore ).map ( ignore => {

    if ( !isString ( ignore ) ) return ignore;

    const fn = globCompile ( ignore );

    return ( targetPath: string ) => fn ( rootPath, targetPath );

  });

};

const intersection = <T> ( sets: Set<T>[] ): Set<T> => {

  if ( sets.length === 1 ) return sets[0];

  const result = new Set<T> ();

  for ( let i = 0, l = sets.length; i < l; i++ ) {

    const set = sets[i];

    for ( const value of set ) {

      result.add ( value );

    }

  }

  return result;

};

const isPathSep = ( char: string ): boolean => {

  return char === '/' || char === '\\';

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const uniq = <T> ( values: T[] ): T[] => {

  if ( values.length < 2 ) return values;

  return Array.from ( new Set ( values ) );

};

const uniqFlat = <T> ( values: T[][] ): T[] => {

  if ( values.length === 1 ) return values[0];

  return uniq ( values.flat () );

};

const uniqMergeConcat = <T> ( values: Record<string, T[]>[] ): Record<string, T[]> => {

  if ( values.length === 1 ) return values[0];

  const merged: Record<string, T[]> = {};

  for ( let i = 0, l = values.length; i < l; i++ ) {

    const value = values[i];

    for ( const key in value ) {

      const prev = merged[key];
      const next = Array.isArray ( prev ) ? prev.concat ( value[key] ) : value[key];

      merged[key] = next;

    }

  }

  for ( const key in merged ) {

    merged[key] = uniq ( merged[key] );

  }

  return merged;

};

/* EXPORT */

export {castArray, globExplode, globsExplode, globCompile, globsCompile, ignoreCompile, intersection, isPathSep, isString, uniq, uniqFlat, uniqMergeConcat};
