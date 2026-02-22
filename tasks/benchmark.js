
/* IMPORT */

import benchmark from 'benchloop';
import fs from 'node:fs/promises';
import path from 'node:path';
import readdir from '../dist/index.js';

/* HELPERS */

const cwd = path.resolve ( 'tasks/babel' );

/* MAIN */

benchmark.config ({
  iterations: 1
});

benchmark ({
  name: 'tiny-readdir',
  fn: async () => {
    await readdir ( '**/*.js', { cwd, followSymlinks: true } );
  }
});

benchmark ({
  name: 'fs.glob',
  fn: async () => {
    await Array.fromAsync ( fs.glob ( '**/*.js', { cwd } ) );
  }
});
