/**
 * GULPFILE - By Ross Bennett
 */

var $         = require('gulp-load-plugins')(),
	gulp        = require('gulp'),
  gutil       = require('gulp-util'),
	del         = require('del'),
	runSequence = require('run-sequence')

	// Base Paths
	basePaths = {
		src: 'assets/',
		dest: 'public/'
	},

  onError = function (error) {
    gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
    this.emit('end');
  }

/*----------------------------------------------------*\
	 SASS - LIBSASS COMPILE, MINIFY, OUTPUT
\*----------------------------------------------------*/
gulp.task('styles', function() {
	return gulp.src(basePaths.src + 'scss/*.scss')
   .pipe($.plumber({errorHandler: onError}))
   .pipe($.sass({
				includePaths: ['scss']
		}))
		.pipe($.autoprefixer('last 4 versions') )
		.pipe($.minifyCss())
		.pipe(gulp.dest(basePaths.dest + '_css'))
    .pipe( $.size({title: 'Styles', gzip: true}));
  });

/*----------------------------------------------------*\
	 SCRIPTS - COMPILE, MINIFY, OUTPUT
\*----------------------------------------------------*/
gulp.task('scripts', function() {
	return gulp.src(basePaths.src + 'js/*.js')
		.pipe($.jshint())
		.pipe($.jshint.reporter('default'))
		.pipe(gulp.dest(basePaths.dest + '_js'))
    .pipe( $.size({title: 'Scripts', gzip: true}));
});

/*----------------------------------------------------*\
	 INLINE SVG - CREATES <SYMBOL> BLOCK OF SVG GOODNESS
\*----------------------------------------------------*/
gulp.task('svgstore', function () {
	return gulp.src(basePaths.src + 'img/svg/*.svg')
		.pipe($.svgmin())
		.pipe($.svgstore())
		.pipe(gulp.dest(basePaths.dest + '_img/svg'))
});

// Inject SVG Block into DOM
gulp.task('inject', function () {
	var symbols = gulp
		.src(basePaths.dest + '_img/svg/svg.svg')

	function fileContents (filePath, file) {
			return file.contents.toString();
	}

	return gulp
		.src(basePaths.dest + 'svg-defs.php')
		.pipe($.inject(symbols, { transform: fileContents }))
		.pipe(gulp.dest(basePaths.dest));
});

// Create PNG sprite fallback for no-svg browsers, IE8 etc.
gulp.task('svgfallback', function () {
	return gulp
		.src(basePaths.src + '/img/svg/*.svg', {base: basePaths.src + 'img/svg/'})
		// .pipe($.rename({prefix: 'icon-'}))
		.pipe($.svgfallback())
		.pipe(gulp.dest(basePaths.dest + '_img/png/sprite'))
});

/*------------------------------------------*\
	 COPY FONTS
\*------------------------------------------*/
gulp.task('fonts', function () {
	return gulp.src(basePaths.src + 'fonts/*')
		.pipe(gulp.dest(basePaths.dest + '_fonts'))
});

/*------------------------------------------*\
	 COPY IMAGES
\*------------------------------------------*/
gulp.task('images', function () {
	return gulp.src(basePaths.src + 'img/*')
		.pipe(gulp.dest(basePaths.dest + '_img'))
});

/*------------------------------------------------*\
	 MODERNIZR
	 MOVE FROM ASSETS INTACT (BOWER v. NOT AVAILABLE)
\*------------------------------------------------*/
gulp.task('modernizr', function () {
	return gulp.src(basePaths.src + 'js/vendor/modernizr.custom.js')
		.pipe(gulp.dest(basePaths.dest + '_js'))
});

/*-----------------------------------------*\
		BOWER/VENDOR SCRIPTS
\*-----------------------------------------*/
gulp.task('vendorScripts', function() {
	var bower = [
		basePaths.dest + '_bower-packages/jquery/dist/jquery.min.js',
	]
	return gulp.src(bower)
		.pipe($.concat('vendor.js'))
		.pipe($.uglify() )
		.pipe(gulp.dest(basePaths.dest + '_js'))
});

gulp.task('bower', function() {
	return $.bower()
		.pipe(gulp.dest(basePaths.dest + '_bower-packages'))
    .pipe( $.size({title: 'Vendor Scripts', gzip: true}));
 });

/*-----------------------------------------*\
	 CLEAN OUTPUT DIRECTORIES
\*-----------------------------------------*/
gulp.task('clean', function() {
	del(['public/_css', 'public/_js', 'public/_img', 'public/_fonts', 'public/_bower-packages'], { read: false })
});

/*---------------------------------------------*\
	 WATCHING...
\*---------------------------------------------*/
gulp.task('watch', function() {
	gulp.watch('assets/scss/**/*.scss', ['styles']);
	gulp.watch('assets/js/*.js', ['scripts']);
	gulp.watch('assets/img/*', ['images']);
});

/*---------------------------------------------*\
	 DEFAULT TASK - COMPILES, BUILDS, RELOADS
\*---------------------------------------------*/
gulp.task('default', ['clean'], function(cb) {
	runSequence( 'bower', 'styles', 'vendorScripts', 'scripts', 'modernizr', 'images', 'fonts', ['svgstore'], 'inject', 'svgfallback', 'watch', cb);
});
