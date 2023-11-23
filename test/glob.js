
/* IMPORT */

import {describe} from 'fava';
import {globIsStatic, globUnescape, globExplode, globsExplode} from '../dist/utils.js';

/* MAIN */

describe ( 'Glob', it => {

  it ( 'globIsStatic', t => {

    t.true ( globIsStatic ( 'foo' ) );
    t.true ( globIsStatic ( 'foo/bar' ) );
    t.true ( globIsStatic ( 'foo / bar' ) );
    t.true ( globIsStatic ( './foo' ) );
    t.true ( globIsStatic ( '\\foo' ) );
    t.true ( globIsStatic ( '\\f\\o\\o' ) );
    t.true ( globIsStatic ( '\\.' ) );
    t.true ( globIsStatic ( '\\$' ) );
    t.true ( globIsStatic ( '\\.' ) );
    t.true ( globIsStatic ( '\\*' ) );
    t.true ( globIsStatic ( '\\+' ) );
    t.true ( globIsStatic ( '\\?' ) );
    t.true ( globIsStatic ( '\\^' ) );
    t.true ( globIsStatic ( '\\(' ) );
    t.true ( globIsStatic ( '\\)' ) );
    t.true ( globIsStatic ( '\\{' ) );
    t.true ( globIsStatic ( '\\}' ) );
    t.true ( globIsStatic ( '\\[' ) );
    t.true ( globIsStatic ( '\\]' ) );
    t.true ( globIsStatic ( '\\|' ) );

    t.false ( globIsStatic ( '?(foo)' ) );
    t.false ( globIsStatic ( '*(foo)' ) );
    t.false ( globIsStatic ( '+(foo)' ) );
    t.false ( globIsStatic ( '!(foo)' ) );

    t.false ( globIsStatic ( '!foo' ) );
    t.false ( globIsStatic ( '!!foo' ) );

    t.false ( globIsStatic ( '*foo' ) );
    t.false ( globIsStatic ( 'foo*' ) );
    t.false ( globIsStatic ( 'foo*bar' ) );

    t.false ( globIsStatic ( '**/*' ) );
    t.false ( globIsStatic ( '**/foo' ) );
    t.false ( globIsStatic ( 'foo/**' ) );

    t.false ( globIsStatic ( '?foo' ) );
    t.false ( globIsStatic ( 'foo?' ) );
    t.false ( globIsStatic ( 'foo?bar' ) );

    t.false ( globIsStatic ( '[abc]' ) );
    t.false ( globIsStatic ( '[!abc]' ) );
    t.false ( globIsStatic ( '[^abc]' ) );

    t.false ( globIsStatic ( '[a-z]' ) );
    t.false ( globIsStatic ( '[!a-z]' ) );
    t.false ( globIsStatic ( '[^a-z]' ) );

    t.false ( globIsStatic ( '{foo,bar}' ) );
    t.false ( globIsStatic ( '{a..zz}' ) );
    t.false ( globIsStatic ( '{01..99}' ) );

  });

  it ( 'globUnescape', t => {

    t.is ( globUnescape ( 'foo' ), 'foo' );
    t.is ( globUnescape ( 'foo/bar' ), 'foo/bar' );
    t.is ( globUnescape ( 'foo / bar' ), 'foo / bar' );
    t.is ( globUnescape ( './foo' ), './foo' );
    t.is ( globUnescape ( '\\foo' ), 'foo' );
    t.is ( globUnescape ( '\\f\\o\\o' ), 'foo' );
    t.is ( globUnescape ( '\\.' ), '.' );
    t.is ( globUnescape ( '\\$' ), '$' );
    t.is ( globUnescape ( '\\.' ), '.' );
    t.is ( globUnescape ( '\\*' ), '*' );
    t.is ( globUnescape ( '\\+' ), '+' );
    t.is ( globUnescape ( '\\?' ), '?' );
    t.is ( globUnescape ( '\\^' ), '^' );
    t.is ( globUnescape ( '\\(' ), '(' );
    t.is ( globUnescape ( '\\)' ), ')' );
    t.is ( globUnescape ( '\\{' ), '{' );
    t.is ( globUnescape ( '\\}' ), '}' );
    t.is ( globUnescape ( '\\[' ), '[' );
    t.is ( globUnescape ( '\\]' ), ']' );
    t.is ( globUnescape ( '\\|' ), '|' );

    t.is ( globUnescape ( '?(foo)' ), '?(foo)' );
    t.is ( globUnescape ( '*(foo)' ), '*(foo)' );
    t.is ( globUnescape ( '+(foo)' ), '+(foo)' );
    t.is ( globUnescape ( '!(foo)' ), '!(foo)' );

    t.is ( globUnescape ( '!foo' ), '!foo' );
    t.is ( globUnescape ( '!!foo' ), '!!foo' );

    t.is ( globUnescape ( '*foo' ), '*foo' );
    t.is ( globUnescape ( 'foo*' ), 'foo*' );
    t.is ( globUnescape ( 'foo*bar' ), 'foo*bar' );

    t.is ( globUnescape ( '**/*' ), '**/*' );
    t.is ( globUnescape ( '**/foo' ), '**/foo' );
    t.is ( globUnescape ( 'foo/**' ), 'foo/**' );

    t.is ( globUnescape ( '?foo' ), '?foo' );
    t.is ( globUnescape ( 'foo?' ), 'foo?' );
    t.is ( globUnescape ( 'foo?bar' ), 'foo?bar' );

    t.is ( globUnescape ( '[abc]' ), '[abc]' );
    t.is ( globUnescape ( '[!abc]' ), '[!abc]' );
    t.is ( globUnescape ( '[^abc]' ), '[^abc]' );

    t.is ( globUnescape ( '[a-z]' ), '[a-z]' );
    t.is ( globUnescape ( '[!a-z]' ), '[!a-z]' );
    t.is ( globUnescape ( '[^a-z]' ), '[^a-z]' );

    t.is ( globUnescape ( '{foo,bar}' ), '{foo,bar}' );
    t.is ( globUnescape ( '{a..zz}' ), '{a..zz}' );
    t.is ( globUnescape ( '{01..99}' ), '{01..99}' );

  });

  it ( 'globExplode', t => {

    t.deepEqual ( globExplode ( '' ), [[''], ''] );
    t.deepEqual ( globExplode ( 'foo' ), [['foo'], ''] );
    t.deepEqual ( globExplode ( '/foo' ), [['/foo'], ''] );
    t.deepEqual ( globExplode ( 'foo/bar' ), [['foo/bar'], ''] );
    t.deepEqual ( globExplode ( '/foo/bar' ), [['/foo/bar'], ''] );
    t.deepEqual ( globExplode ( 'foo\\+/bar\\*' ), [['foo+/bar*'], ''] );

    t.deepEqual ( globExplode ( 'src/**/*.js' ), [['src/'], '**/*.js'] );
    t.deepEqual ( globExplode ( '/src/**/*.js' ), [['/src/'], '**/*.js'] );
    t.deepEqual ( globExplode ( '{foo,bar}/**/*.js' ), [['foo/', 'bar/'], '**/*.js'] );
    t.deepEqual ( globExplode ( '/{foo,bar}/**/*.js' ), [['/foo/', '/bar/'], '**/*.js'] );
    t.deepEqual ( globExplode ( 'src/{foo,bar}/**/baz.js' ), [['src/foo/', 'src/bar/'], '**/baz.js'] );
    t.deepEqual ( globExplode ( 'src/{foo,bar}/{baz,qux}/**/baz.js' ), [['src/foo/baz/', 'src/foo/qux/', 'src/bar/baz/', 'src/bar/qux/'], '**/baz.js'] );

    t.deepEqual ( globExplode ( 'src?/**/*.js' ), [[''], 'src?/**/*.js'] );
    t.deepEqual ( globExplode ( 'src+/**/*.js' ), [[''], 'src+/**/*.js'] );
    t.deepEqual ( globExplode ( 'src*/**/*.js' ), [[''], 'src*/**/*.js'] );
    t.deepEqual ( globExplode ( 'src[abc]/**/*.js' ), [[''], 'src[abc]/**/*.js'] );
    t.deepEqual ( globExplode ( 'src{a,b}/**/*.js' ), [[''], 'src{a,b}/**/*.js'] );

  });

  it ( 'globsExplode', t => {

    t.deepEqual ( globsExplode ( ['src/**/*.js', 'src/**/*.txt'] ), [[['src/'], ['**/*.js', '**/*.txt']]] );
    t.deepEqual ( globsExplode ( ['foo/**/*.js', 'bar/**/*.js'] ), [[['foo/'], ['**/*.js']], [['bar/'], ['**/*.js']]] );

  });

});
