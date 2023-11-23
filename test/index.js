
/* IMPORT */

import {describe} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import readdir from '../dist/index.js';

/* MAIN */

describe ( 'Tiny Readdir Glob', it => {

  it ( 'finds folders, files and symlinks', async t => {

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

      const expected1 = {
        files: [file1aPath, file1bPath, file2Path],
        directories: [],
        symlinks: [],
        filesFound: [file1aPath, file1bPath, file2Path, fileDeep1Path],
        directoriesFound: [folder1Path, folder2Path, folder1DeepPath, root2Path],
        symlinksFound: [symlink1FromPath, symlink2FromPath]
      };

      const result1 = await readdir ( '**/*.txt', { cwd: root1Path, followSymlinks: true } );

      t.deepEqual ( result1, expected1 );

      const expected2 = {
        files: [file1aPath, file1bPath, file2Path],
        directories: [],
        symlinks: [],
        filesFound: [file1aPath, file1bPath, fileDeep1Path, file2Path],
        directoriesFound: [folder1DeepPath],
        symlinksFound: []
      };

      const result2a = await readdir ( ['folder1/**/*.txt', 'folder2/**/*.txt'], { cwd: root1Path, followSymlinks: true } );
      const result2b = await readdir ( '{folder1,folder2}/**/*.txt', { cwd: root1Path, followSymlinks: true } );
      const result2c = await readdir ( ['{folder1,folder2}/**/*.txt', '{folder1,folder2}/**/*.txt'], { cwd: root1Path, followSymlinks: true } );

      t.deepEqual ( result2a, expected2 );
      t.deepEqual ( result2b, expected2 );
      t.deepEqual ( result2c, expected2 );

      const expected3 = {
        files: [fileDeep1Path],
        directories: [],
        symlinks: [],
        filesFound: [file1aPath, file1bPath, file2Path, fileDeep1Path],
        directoriesFound: [folder1Path, folder2Path, folder1DeepPath, root2Path],
        symlinksFound: [symlink1FromPath, symlink2FromPath],
      };

      const result3 = await readdir ( '**/*.js', { cwd: root1Path, followSymlinks: true } );

      t.deepEqual ( result3, expected3 );

      const expected4 = {
        files: [fileDeep1Path],
        directories: [],
        symlinks: [],
        filesFound: [file1aPath, file1bPath, fileDeep1Path, file2Path],
        directoriesFound: [folder1DeepPath],
        symlinksFound: []
      };

      const result4a = await readdir ( ['folder1/**/*.js', 'folder2/**/*.js'], { cwd: root1Path, followSymlinks: true } );
      const result4b = await readdir ( '{folder1,folder2}/**/*.js', { cwd: root1Path, followSymlinks: true } );
      const result4c = await readdir ( ['{folder1,folder2}/**/*.js', '{folder1,folder2}/**/*.js'], { cwd: root1Path, followSymlinks: true } );

      t.deepEqual ( result4a, expected4 );
      t.deepEqual ( result4b, expected4 );
      t.deepEqual ( result4c, expected4 );

    } finally {

      fs.rmSync ( root1Path, { recursive: true } );
      fs.rmSync ( root2Path, { recursive: true } );

    }

  });

});
