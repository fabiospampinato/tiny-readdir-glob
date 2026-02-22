
/* IMPORT */

import {describe, t} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import readdir from '../dist/index.js';

/* HELPERS */

const deepEqualResults = ( result, expected ) => {
  t.deepEqual ( result.directories.sort (), expected.directories.sort () );
  t.deepEqual ( result.files.sort (), expected.files.sort () );
  t.deepEqual ( result.symlinks.sort (), expected.symlinks.sort () );
};

const withFixtures = async fn => {

  const cwdPath = process.cwd ();
  const root1Path = path.join ( cwdPath, 'test', 'root1' );
  const root2Path = path.join ( cwdPath, 'test', 'root2' );
  const folder1Path = path.join ( root1Path, 'folder1' );
  const folder2Path = path.join ( root1Path, 'folder2' );
  const folder1DeepPath = path.join ( folder1Path, 'deep' );
  const file1aPath = path.join ( folder1Path, 'file1a.txt' );
  const file1bPath = path.join ( folder1Path, 'file1b.txt' );
  const file2Path = path.join ( folder2Path, 'file2.txt' );
  const fileDeep1Path = path.join ( folder1DeepPath, 'file1.js' );
  const symlink1FromPath = path.join ( root1Path, 'symlink' );
  const symlink1ToPath = root2Path;
  const symlink2FromPath = path.join ( root2Path, 'symlink' );
  const symlink2ToPath = root1Path;

  fs.mkdirSync ( root1Path );
  fs.mkdirSync ( root2Path );
  fs.mkdirSync ( folder1Path );
  fs.mkdirSync ( folder2Path );
  fs.mkdirSync ( folder1DeepPath );
  fs.writeFileSync ( file1aPath, '' );
  fs.writeFileSync ( file1bPath, '' );
  fs.writeFileSync ( file2Path, '' );
  fs.writeFileSync ( fileDeep1Path, '' );
  fs.symlinkSync ( symlink1ToPath, symlink1FromPath );
  fs.symlinkSync ( symlink2ToPath, symlink2FromPath );

  try {

    await fn ({ root1Path, root2Path, folder1Path, folder2Path, file1aPath, file1bPath, file2Path, fileDeep1Path, symlink1FromPath, symlink2FromPath });

  } finally {

    fs.rmSync ( root1Path, { recursive: true } );
    fs.rmSync ( root2Path, { recursive: true } );

  }

};

/* MAIN */

describe ( 'Tiny Readdir Glob', it => {

  it ( 'finds .txt files with a glob', async t => {

    await withFixtures ( async ({ root1Path, file1aPath, file1bPath, file2Path }) => {

      const expected = {
        files: [file1aPath, file1bPath, file2Path],
        directories: [],
        symlinks: []
      };

      const result = await readdir ( '**/*.txt', { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result, expected );

    });

  });

  it ( 'finds .txt files with multiple patterns and braces', async t => {

    await withFixtures ( async ({ root1Path, file1aPath, file1bPath, file2Path }) => {

      const expected = {
        files: [file1aPath, file1bPath, file2Path],
        directories: [],
        symlinks: []
      };

      const result2a = await readdir ( ['folder1/**/*.txt', 'folder2/**/*.txt'], { cwd: root1Path, followSymlinks: true } );
      const result2b = await readdir ( '{folder1,folder2}/**/*.txt', { cwd: root1Path, followSymlinks: true } );
      const result2c = await readdir ( ['{folder1,folder2}/**/*.txt', '{folder1,folder2}/**/*.txt'], { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result2a, expected );
      deepEqualResults ( result2b, expected );
      deepEqualResults ( result2c, expected );

    });

  });

  it ( 'finds .js files with a glob', async t => {

    await withFixtures ( async ({ root1Path, fileDeep1Path }) => {

      const expected = {
        files: [fileDeep1Path],
        directories: [],
        symlinks: []
      };

      const result = await readdir ( '**/*.js', { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result, expected );

    });

  });

  it ( 'finds .js files with multiple patterns and braces', async t => {

    await withFixtures ( async ({ root1Path, fileDeep1Path }) => {

      const expected = {
        files: [fileDeep1Path],
        directories: [],
        symlinks: []
      };

      const result4a = await readdir ( ['folder1/**/*.js', 'folder2/**/*.js'], { cwd: root1Path, followSymlinks: true } );
      const result4b = await readdir ( '{folder1,folder2}/**/*.js', { cwd: root1Path, followSymlinks: true } );
      const result4c = await readdir ( ['{folder1,folder2}/**/*.js', '{folder1,folder2}/**/*.js'], { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result4a, expected );
      deepEqualResults ( result4b, expected );
      deepEqualResults ( result4c, expected );

    });

  });

  it ( 'finds all files with "**/*"', async t => {

    await withFixtures ( async ({ root1Path }) => {

      const result = await readdir ( '**/*', { cwd: root1Path, followSymlinks: true } );

      t.is ( result.files.length, 4 );

    });

  });

  it ( 'excludes files via negation patterns and the ignore option', async t => {

    await withFixtures ( async ({ root1Path }) => {

      const expected = {
        files: [],
        directories: [],
        symlinks: []
      };

      const result6a = await readdir ( ['folder1/**/*.js', 'folder2/**/*.js', '!**/deep/**'], { cwd: root1Path, followSymlinks: true, ignore: 'file1b.txt' } );
      const result6b = await readdir ( ['folder1/**/*.js', 'folder2/**/*.js', '!**/deep/**', '!file1b.txt'], { cwd: root1Path, followSymlinks: true } );
      const result6c = await readdir ( ['!!folder1/**/*.js', '!!!!folder2/**/*.js', '!!!**/deep/**', '!!!!!file1b.txt'], { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result6a, expected );
      deepEqualResults ( result6b, expected );
      deepEqualResults ( result6c, expected );

    });

  });

  it ( 'returns all entries except excluded ones with only a negation pattern', async t => {

    await withFixtures ( async ({ root1Path, root2Path, folder1Path, folder2Path, file1aPath, file1bPath, file2Path, symlink1FromPath, symlink2FromPath }) => {

      const expected = {
        files: [file1aPath, file1bPath, file2Path],
        directories: [folder1Path, folder2Path, root2Path],
        symlinks: [symlink1FromPath, symlink2FromPath]
      };

      const result = await readdir ( ['!**/deep/**'], { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result, expected );

    });

  });

  it ( 'returns nothing with an empty array', async t => {

    await withFixtures ( async ({ root1Path }) => {

      const expected = {
        files: [],
        directories: [],
        symlinks: []
      };

      const result = await readdir ( [], { cwd: root1Path, followSymlinks: true } );

      deepEqualResults ( result, expected );

    });

  });

});
