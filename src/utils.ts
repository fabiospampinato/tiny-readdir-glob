
/* IMPORT */

import path from 'node:path';
import zeptomatch from 'zeptomatch';

/* MAIN */

//TODO: Maybe promote some of these to standalone reusable packages

const castArray = <T> ( value: T | T[] ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const globIsStatic = ( glob: string ): boolean => { //TODO: Make this perfect, grammar-based, rather than letting some glob-looking paths slip through

  return /^(?:\\.|[ a-zA-Z0-9/._-])*$/.test ( glob );

};

const globUnescape = ( glob: string ): string => {

  return glob.replace ( /\\?(.)/g, '$1' );

};

const globExplode = ( glob: string ): [paths: string[], glob: string] => { //TODO: Account for more things, like classes and ranges

  if ( glob && globIsStatic ( glob ) ) {

    return [[globUnescape(glob)], ''];

  }

  let roots: string[] = [];
  let remainder = glob;

  while ( true ) {

    const groupRe = /^(\/?)\{([ a-zA-Z0-9._-]+(?:,[ a-zA-Z0-9._-]+)*)\}((?:\/|(?=$)))/;
    const groupMatch = remainder.match ( groupRe );

    if ( groupMatch ) {

      const options = groupMatch[2].split ( ',' ).map ( option => `${groupMatch[1]}${option}${groupMatch[3]}` );

      roots = roots.length ? roots.flatMap ( folder => options.map ( option => `${folder}${option}` ) ) : options;
      remainder = remainder.slice ( groupMatch[0].length );

      continue;

    }

    const simpleRe = /^(\/?[ a-zA-Z0-9._-]*(?:\/|(?=$)))/;
    const simpleMatch = remainder.match ( simpleRe );

    if ( simpleMatch && simpleMatch[0].length ) {

      roots = roots.length ? roots.map ( folder => `${folder}${simpleMatch[0]}` ) : [simpleMatch[0]];
      remainder = remainder.slice ( simpleMatch[0].length );

      continue;

    }

    break;

  }

  if ( !roots.length ) {

    roots.push ( '' );

  }

  return [roots, remainder];

};

const globsExplode = ( globs: string[] ): [paths: string[], globs: string[]][] => { //TODO: Optimize this more, avoiding searching both in src/ and src/foo with the same glob

  const results: [string[], string[]][] = [];

  for ( const glob of globs ) {

    const [paths, pathsGlob] = globExplode ( glob );

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

const globCompile = ( glob: string ): (( rootPath: string, targetPath: string ) => boolean) => {

  if ( !glob || glob === '**/*' ) {

    return () => true;

  }

  const simpleRe = /^\*\*\/(\*)?([ a-zA-Z0-9._-]+)$/;
  const simpleMatch = glob.match ( simpleRe );

  if ( simpleMatch ) {

    const fullWidth = !simpleMatch[1];
    const extension = simpleMatch[2];

    return ( rootPath, targetPath ) => targetPath.endsWith ( extension ) && ( !fullWidth || ( ( targetPath.length === extension.length ) || isPathSep ( targetPath[targetPath.length - extension.length - 1] ) ) );

  }

  const simpleGroupRe = /^\*\*\/(\*)?([ a-zA-Z0-9._-]*)\{([ a-zA-Z0-9._-]+(?:,[ a-zA-Z0-9._-]+)*)\}$/;
  const simpleGroupMatch = glob.match ( simpleGroupRe );

  if ( simpleGroupMatch ) {

    const fullWidth = !simpleGroupMatch[1];
    const prefix = simpleGroupMatch[2];
    const extensions = simpleGroupMatch[3].split ( ',' ).map ( extension => `${prefix}${extension}` );

    return ( rootPath, targetPath ) => extensions.some ( extension => targetPath.endsWith ( extension ) && ( !fullWidth || ( ( targetPath.length === extension.length ) || isPathSep ( targetPath[targetPath.length - extension.length - 1] ) ) ) );

  }

  const re = zeptomatch.compile ( glob );

  return ( rootPath, targetPath ) => re.test ( path.relative ( rootPath, targetPath ) );

};

const globsCompile = ( globs: string[] ): (( rootPath: string, targetPath: string ) => boolean) => {

  const fns = globs.map ( globCompile );

  return ( rootPath, targetPath ) => fns.some ( fn => fn ( rootPath, targetPath ) );

};

const ignoreCompile = ( rootPath: string, ignore?: (( targetPath: string ) => boolean) | RegExp | string | string[] ): (( targetPath: string ) => boolean) | RegExp | undefined => {

  if ( Array.isArray ( ignore ) || typeof ignore === 'string' ) {

    const fn = globsCompile ( castArray ( ignore ) );

    return ( targetPath: string ) => fn ( rootPath, targetPath );

  } else {

    return ignore;

  }

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

export {castArray, globIsStatic, globUnescape, globExplode, globsExplode, globCompile, globsCompile, ignoreCompile, intersection, isPathSep, uniq, uniqFlat, uniqMergeConcat};
