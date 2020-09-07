const path = require('path');
const gulp = require('gulp');
const taskDocumentation = require('./task-documentation');

// Root directory is always project directory
process.chdir(path.join(__dirname, '..'));

gulp.task('Generate documentation', () => {
    return taskDocumentation.generate();
});
