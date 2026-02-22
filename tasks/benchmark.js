
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
  name: 'tiny-readdir-glob (full)',
  fn: async () => {
    await readdir ( '**/*.js', { cwd, followSymlinks: true } );
  }
});

benchmark ({
  name: 'tiny-readdir-glob (partial)',
  fn: async () => {
    await readdir ( 'packages/**/src/**/*.js', { cwd, followSymlinks: true } );
  }
});

benchmark ({
  name: 'fs.glob (full)',
  fn: async () => {
    await Array.fromAsync ( fs.glob ( '**/*.js', { cwd } ) );
  }
});

benchmark ({
  name: 'fs.glob (partial)',
  fn: async () => {
    await Array.fromAsync ( fs.glob ( 'packages/**/src/**/*.js', { cwd } ) );
  }
});
