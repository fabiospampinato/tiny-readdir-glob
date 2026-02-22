# Tiny Readdir Glob

A simple promisified recursive readdir function, with support for globs.

## Install

```sh
npm install tiny-readdir-glob
```

## Usage

```ts
import readdir from 'tiny-readdir-glob';

// Let's recursively read into a directory using a glob

const aborter = new AbortController ();
const result = await readdir ( ['src/**/*.js'], {
  cwd: process.cwd (), // Directory to start the search from, defaults to process.cwd()
  depth: 20, // Maximum depth to look at
  limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: ['**/.git', '**/node_modules'], // Globs, or raw function, that if returns true will ignore this particular file or a directory and its descendants
  signal: aborter.signal, // Optional abort signal, useful for aborting potentially expensive operations
  onDirents: dirents => console.log ( dirents ) // Optional callback that will be called as soon as new dirents are available, useful for example for discovering ".gitignore" files while searching
});

// This is how we would abort the recursive read after 10s

setTimeout ( () => aborter.abort (), 10_000 ); // Aborting if it's going to take longer than 10s

// This is what the result object will look like

result.directories; // => Array of absolute paths pointing to directories, filtered by the provided glob
result.files; // => Array of absolute paths pointing to files, filtered by the provided glob
result.symlinks; // => Array of absolute paths pointing to symlinks, filtered by the provided glob
```

## License

MIT © Fabio Spampinato
