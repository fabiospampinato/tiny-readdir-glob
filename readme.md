# Tiny Readdir Glob

A simple promisified recursive readdir function, with support for globs.

## Install

```sh
npm install --save tiny-readdir-glob
```

## Usage

```ts
import readdir from 'tiny-readdir-glob';

// Let's recursively read into a directory using a glob

const aborter = new AbortController ();
const result = await readdir ( ['src/**/*.js'], {
  depth: 20, // Maximum depth to look at
  limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: ['**/.git', '**/node_modules'], // Globs, or raw function, that if returns true will ignore this particular file or a directory and its descendants
  signal: aborter.signal, // Optional abort signal, useful for aborting potentially expensive operations
  onDirents: dirents => console.log ( dirents ) // Optional callback that will be called as soon as new dirents are available, useful for example for discovering ".gitignore" files while searching
});

// This is the basic information we'll get

result.directories; // => Array of absolute paths pointing to directories, filtered by the provided glob
result.files; // => Array of absolute paths pointing to files, filtered by the provided glob
result.symlinks; // => Array of absolute paths pointing to symlinks, filtered by the provided glob

// This is more advanced information we'll get, which is useful in some cases

result.directoriesFound; // => Array of absolute paths pointing to directories, not fully filtered by the provided glob yet
result.filesFound; // => Array of absolute paths pointing to files, not fully filtered by the provided glob yet
result.symlinksFound; // => Array of absolute paths pointing to symlinks, not fully filtered by the provided glob yet

result.directoriesFoundNames; // => Set of directories names found
result.filesFoundNames; // => Set of files name found
result.symlinksFoundNames; // => Set of symlinks names found

result.directoriesFoundNamesToPaths; // => Record of directories names found to their paths
result.filesFoundNamesToPaths; // => Record of files name found to their paths
result.symlinksFoundNamesToPaths; // => Record of symlinks names found to their paths

setTimeout ( () => aborter.abort (), 10000 ); // Aborting if it's going to take longer than 10s
```

## License

MIT © Fabio Spampinato
