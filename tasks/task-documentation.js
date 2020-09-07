const gulp = require('gulp');
const typedoc = require('gulp-typedoc');

module.exports.generate = () => {
    return gulp
        .src([
            'src/**/*.ts',
            '!src/vendor/**/*'
        ])
        .pipe(typedoc({
            ignoreCompilerErrors: true,
            mode: 'file',
            name: 'Pekka Kana 2 Web Port',
            out: 'doc',
            tsconfig: 'src/tsconfig.json',
            theme: 'default'
        }));
};
