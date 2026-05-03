
/* IMPORT */

import isGlobStatic from 'zeptomatch-is-static';

/* MAIN */

const castArray = <T> ( value: T | T[] ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const getGlobNormalized = ( glob: string ): string => {

  if ( isGlobStatic ( glob ) ) { // It's actually an absolute path, let's append a globstar

    const globWithoutTrailingSlash = glob.replace ( /[\\\/]+$/, '' );
    const globWithGlobstar = `${globWithoutTrailingSlash}/**`;

    return globWithGlobstar;

  } else {

    return glob;

  }

};

const getGlobsPartition = ( globs: string[] ): [positives: string[], negatives: string[]] => {

  const positives: string[] = [];
  const negatives: string[] = [];
  const bangsRe = /^!+/;

  for ( const glob of globs ) {

    const match = glob.match ( bangsRe );

    if ( match ) {

      const bangsNr = match[0].length;
      const bucket = bangsNr % 2 === 0 ? positives : negatives;

      bucket.push ( getGlobNormalized ( glob.slice ( bangsNr ) ) );

    } else {

      positives.push ( getGlobNormalized ( glob ) );

    }

  }

  if ( globs.length && !positives.length ) {

    positives.push ( '**' );

  }

  return [uniq ( positives ), uniq ( negatives )];

};

const isFunction = ( value: unknown ): value is Function => {

  return typeof value === 'function';

};

const isRegExp = ( value: unknown ): value is RegExp => {

  return value instanceof RegExp;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const uniq = <T> ( values: T[] ): T[] => {

  if ( values.length < 2 ) return values;

  return Array.from ( new Set ( values ) );

};

/* EXPORT */

export {castArray, getGlobNormalized, getGlobsPartition, isFunction, isRegExp, isString, uniq};
