# Tiny Readdir Glob

A simple promisified recursive readdir function, with support for globs.

## Install

```sh
npm install --save tiny-readdir-glob
```

## Usage

```ts
import readdir from 'tiny-readdir-glob';

const aborter = new AbortController ();

const result = await readdir ( ['src/**/*.js'], {
  depth: 20, // Maximum depth to look at
  limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: ['**/.git', '**/node_modules'], // Globs, or raw function, that if returns true will ignore this particular file or a directory and its descendants
  signal: aborter.signal // Optional abort signal, useful for aborting potentially expensive operations
});

console.log ( result.directories ); // => Array of absolute paths pointing to directories, filtered by the provided glob
console.log ( result.files ); // => Array of absolute paths pointing to files, filtered by the provided glob
console.log ( result.symlinks ); // => Array of absolute paths pointing to symlinks, filtered by the provided glob

console.log ( result.directoriesFound ); // => Array of absolute paths pointing to directories, not fully filtered by the provided glob yet
console.log ( result.filesFound ); // => Array of absolute paths pointing to files, not fully filtered by the provided glob yet
console.log ( result.symlinksFound ); // => Array of absolute paths pointing to symlinks, not fully filtered by the provided glob yet

console.log ( result.directoriesFoundNames ); // => Set of directories names found
console.log ( result.filesFoundNames ); // => Set of files name found
console.log ( result.symlinksFoundNames ); // => Set of symlinks names found

setTimeout ( () => aborter.abort (), 10000 ); // Aborting if it's going to take longer than 10s
```

## License

MIT © Fabio Spampinato
