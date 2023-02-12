const { src, dest, watch, parallel, series } = require('gulp');

const del 					= require('del');
const webpHtmlNosvg = require('gulp-webp-html-nosvg');
const gcssmq 				= require('gulp-group-css-media-queries');
const scss 					= require('gulp-sass')(require('sass'));
const concat 				= require('gulp-concat');
const browserSync 	= require('browser-sync').create();
const autoprefixer 	= require('gulp-autoprefixer');
const imagemin 			= require('gulp-imagemin');
const webp 					= require('gulp-webp');
const uglify 				= require('gulp-uglify-es').default;



function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		}
	});
}

function html() {
	return src('app/**/*.html')
	.pipe(webpHtmlNosvg())
	.pipe(dest('dist'))
};

function scripts() {
	return src([
		// 'node_modules/jquery/dist/jquery.js',
		'app/js/main.js'
	])
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js'))
	.pipe(browserSync.stream())
}



function images() {
	return src('app/images/**/*')
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(dest('dist/images'))
		.pipe(webp())
		.pipe(dest('dist/images'))
}

function styles() {
	return src('app/scss/style.scss')
		.pipe(scss())
		// expanded(стандартный css), compressed(минифицированный файл)
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 version'],
			grid: true
		}))
		.pipe(gcssmq())
		.pipe(scss({outputStyle: 'compressed'}))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function buildProject() {
	return src([
		'app/css/style.min.css',
		'app/fonts/**/*',
		// 'app/images/**/*',
		'app/js/main.min.js',
		// 'app/*.html'
	], { base: 'app' })
		.pipe(dest('dist'))
}


async function clean() {
  return del.sync('dist/', { force: true })
}


function watching() {
	watch(['app/scss/**/*.scss'], styles);
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
	watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
// exports.build = build;
exports.images = images;
exports.clean = clean;
exports.html = html;
exports.buildProject = buildProject;

exports.default = parallel(styles, scripts, browsersync, watching);

exports.build = series(clean, html, images, buildProject);

