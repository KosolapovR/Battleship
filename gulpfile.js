const { src, dest, parallel, task } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const minifyCss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const image = require('gulp-image');

const css = () => {
    return src('src/css/*.css')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(minifyCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(dest('output/css/'));

}

const js = () => {
    return src('src/js/*.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest('output/js/'));
}

const optimizeImg = () => {
    return src('src/img/*')
        .pipe(image({
            pngquant: true,
            optipng: false,
            zopflipng: true,
            jpegRecompress: false,
            mozjpeg: true,
            guetzli: false,
            gifsicle: true,
            svgo: true,
            concurrent: 10,
            quiet: true // defaults to false
        }))
        .pipe(dest('output/img/'));
}


exports.build = parallel(js, css, optimizeImg);