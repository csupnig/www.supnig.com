/**
 * Define dependencies
 */
var Q = require("q"),
    glob = require("glob"),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    path = require('path'),
    bowerFiles = require('gulp-bower-files'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish-ex'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    inject = require("gulp-inject"),
    gulpFilter = require("gulp-filter"),
    autoprefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    typescript = require('gulp-tsc'),
    tslint = require('gulp-tslint'),
    ngHtml2Js = require("gulp-ng-html2js"),
    runSequence = require('run-sequence'),
    coffee = require('gulp-coffee'),
    print = require('gulp-print'),
    ts = require('gulp-typescript'),
    uncss = require('gulp-uncss'),
    cliArgs = require('yargs').argv,
    moment = require('moment');

/**
 * Load config files
 */
var pkg = require('./package.json');
var cfg = require('./build.config.js');
// ----------------------------------------------------------------------------
// COMMON TASKS
// ----------------------------------------------------------------------------
/**
 * Clean build (bin) and compile (compile) directories
 */
    gulp.task('clean', function () {
        return gulp.src(['public/assets/*'], {read: false})
            .pipe(clean());
    });
var builddate = moment().format("YYYYMMDD_HHmm");

// ----------------------------------------------------------------------------
// COMPILE TASKS
// ----------------------------------------------------------------------------

gulp.task('images', function() {
	return gulp.src('public/media/**/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: []
		}))
		.pipe(gulp.dest('public/media_small/'));
});


/**
 * Merge vendor js files to a single minifed file
 */
gulp.task('vendor:compile', function () {
    var destDir = path.join(cfg.dir.compile, cfg.dir.assets, 'js', 'vendorfiles');
    var jsFilter = gulpFilter('**/*.js');
    return bowerFiles()
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min.' + pkg.version}))
        .pipe(gulp.dest(destDir));
});


/**
 * LESS: compile
 */
gulp.task('less:compile', function () {
    var destDir = path.join(cfg.dir.compile, cfg.dir.assets, 'css');
    return gulp.src(cfg.src.less)
        .pipe(less({
            cleancss: true,
            compress: true
        }))
        //.pipe(uncss({
        //    html: glob.sync('app/**/*.html')
        //}))
        .pipe(rename({suffix: '.min.' + pkg.version}))
        .pipe(gulp.dest(destDir));
});


/**
 * Typescript / JS: ts lint and compile
 */
gulp.task('app:ts:compile', function () {
    var destDir = path.join(cfg.dir.compile, cfg.dir.assets, 'js','app');
    logHighlight("Compiling Typescript files to js files to dir: " + destDir);
    var src = cfg.src.ts;
    src.push(cfg.src.tslibs);
    src.push('!' + cfg.src.assets);
    var tsResult = gulp.src(src)
        .pipe(ts({
            outFile: 'main.js'
        }));

    //tsResult.dts.pipe(gulp.dest('release/definitions'));
    return tsResult.js.pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min.' + pkg.version}))
        .pipe(gulp.dest(destDir));
});

/**
 * posts.html: inject css and js files
 */
gulp.task('html:compile', function () {
    var src = {
        css: path.join(cfg.dir.compile, cfg.dir.assets, 'css', '**', '*.css'),
        js: path.join(cfg.dir.compile, cfg.dir.assets, 'js', 'app','**', '*.js'),
        vendor: path.join(cfg.dir.compile, cfg.dir.assets, 'js', 'vendorfiles','**', '*.js')
    };
    var destDir = path.join(cfg.dir.views);
    var ignorePath = path.join(cfg.dir.compile);

    return gulp.src(cfg.src.index)
        .pipe(inject(gulp.src(src.vendor, {read: false}), {ignorePath: ignorePath, starttag: '<!-- inject:vendor:{{ext}} -->'}))
        .pipe(inject(gulp.src(src.js, {read: false}), {ignorePath: ignorePath, starttag: '<!-- inject:app:{{ext}} -->'}))
        .pipe(inject(gulp.src(src.css, {read: false}), {ignorePath: ignorePath}))
        .pipe(gulp.dest(destDir));
});

/**
 *
 */
gulp.task('app:compile', function () {
    var deferred = Q.defer();

    runSequence(
        'clean',
        'less:compile',
        'vendor:compile',
        'app:ts:compile',
        'html:compile',
        function () {
            deferred.resolve();
        });

    return deferred.promise;
});


gulp.task('watch', ['app:compile'], function () {
    var server = livereload();

    // .less files
    gulp.watch('app/src/less/**/*.less', ['less:compile']);
    // .js files
    gulp.watch('app/src/**/*.ts', ['app:ts:compile']);
    // Languages
    gulp.watch('app/src/html/**/*.html', ['html:compile']);

    var buildDir = path.join(cfg.dir.compile, '**');
    gulp.watch(buildDir).on('change', function (file) {
        console.log("File changed ", file.path);
        server.changed(file.path);
    });
});


// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Highlight debug messages in log
 * @param message
 */
function logHighlight(message) {
    gutil.log(gutil.colors.black.bgWhite(message));
};
