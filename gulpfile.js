var jade_path = 'app/markups/_pages/*.jade',
	scss_path = 'app/scss/*.scss',
	modernizrSettings = require('./modernizr_config.json');

//Инициализация плагинов
var gulp = require('gulp'),
	browserSync = require('browser-sync'),//модуль запуска сервера
	wiredep = require('wiredep').stream,//модуль слежки за bower
	useref = require('gulp-useref'),//модуль конкатенации css и js
	rimraf = require('gulp-rimraf'),//модуль удаления файлов
	size = require('gulp-size'),//модуль подсчёта размера файлов
	gulpif = require('gulp-if'),//модуль фильтрации
	uglify = require('gulp-uglify'),//модуль минификации js
	csso = require('gulp-csso'),//модуль минификации css
	filter = require('gulp-filter'),//модуль фильтраци
	imagemin = require('gulp-imagemin'),//модуль сжатия картинок
	jade = require('gulp-jade'),//модуль компиляции jade
	modernizr = require('customizr'),//модуль компиляции modernizr.js
	autoprefixer = require('gulp-autoprefixer'),//модуль добавления префиксов в CSS
	sass = require('gulp-sass');//модуль компиляции sass


//Задача запуска сервера
gulp.task('server', function () {
	browserSync({
		port: 9000,
		server: {
			baseDir: 'app'
		}
	});
});

//Задача слежки за файлами проекта
gulp.task('watch', ['wiredep', 'prefix-css'], function () {
	gulp.watch([
		'app/*.html',
		'app/js/**/*.js',
		'app/css/**/*.css',
		'app/php/**/*.php'
	]).on('change', browserSync.reload);
	gulp.watch('bower.json', ['wiredep']);
	gulp.watch('app/markups/**/*.jade').on('change', function () {
		gulp.start('wiredep')
	});
	gulp.watch('modernizr-config.json').on('change', function () {
		gulp.start('modernizr')
	})
});

////Задача слежки за файлами jade
gulp.task('jade_watch', function () {
	gulp.watch(jade_path).on('change', function () {
		gulp.start('jade')
	})
});

//Задача слежки за файлами scss
gulp.task('sass_watch', function () {
	gulp.watch(scss_path, ['sass']);
});

//Задача компиляции *.jade в *.html
gulp.task('jade', function () {
	var YOUR_LOCALS = {};
	return gulp.src(jade_path)
		.pipe(jade({
			locals: YOUR_LOCALS,
			pretty: '\t'
		}))
		.pipe(gulp.dest('app'));
});

//Задача компиляции *.scss в *.css
gulp.task('sass', function () {
	return gulp.src(scss_path)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('app/css'));
});

//Задача добавления префиксов в CSS
gulp.task('prefix-css', ['sass'], function () {
	return gulp.src('app/css/*.css')
		.pipe(autoprefixer({
			browsers: ['last 4 version'],
			cascade: false
		}))
		.pipe(gulp.dest('app/css'));
});

//Задача слежки за bower и вставки нужных скриптов в html
gulp.task('wiredep', ['jade'], function () {
	return gulp.src('app/*.html')
		.pipe(wiredep())
		.pipe(gulp.dest('app'))
});

//Задача объединения, минификации css и js файлов, и переноса их вместе с html в директорию public_html
gulp.task('useref', ['wiredep', 'prefix-css', 'modernizr'], function () {
	return gulp.src('app/*.*')
		.pipe(gulpif('*.html', useref()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', csso()))
		.pipe(gulp.dest('public_html'))
});

//Задача переноса шрифтов
gulp.task('move_fonts', function () {
	return gulp.src('app/fonts/*')
		.pipe(filter(['*.eot', '*.svt', '*.ttf', '*.woff', '*.woff2']))
		.pipe(gulp.dest('public_html/fonts'))
});

//Задача минификации картинок
gulp.task('imagemin', function () {
	return gulp.src('app/images/**/*')
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('public_html/images'))
});

//Задача компиляции файла Modernizr.json
gulp.task('modernizr', function () {
	modernizr(modernizrSettings)
});

//Задача переноса php файлов
gulp.task('move_php', function () {
	return gulp.src('app/**/*.php')
		.pipe(gulp.dest('public_html'))
});


//Задача сборки проекта и вывода размера окончательной директории
gulp.task('create_public_html', ['move_fonts', 'useref', 'imagemin', 'move_php'], function () {
	return gulp.src('public_html/**/*')
		.pipe(size({title: 'build'}))
});

//Задача удаления папки с проектом
gulp.task('delete_public_html', function () {
	return gulp.src('public_html', {read: false})
		.pipe(rimraf())
});

//Задача полной сборки проекта
gulp.task('build', ['delete_public_html'], function () {
	gulp.start('create_public_html')
});

//Задача по умолчанию
gulp.task('default', ['server', 'watch']);