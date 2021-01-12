const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass"),
    prefix = require("gulp-autoprefixer"),
    sync = require("browser-sync").create(),
    imagemin = require("gulp-imagemin"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fileinclude = require('gulp-file-include'),
    fs = require("fs");

//create files

function createFiles() {
    createFolders();
    setTimeout(() => {
        fs.writeFile('./newfolder/index.html', '', function(err) {
            if (err) throw err;
            console.log('Replaced!');
        });

    }, 500)

}


//create folders

function createFolders() {
    return src("*.*", { read: false })
        .pipe(dest("app /scss/"))
        .pipe(dest("app /fonts/"))
        .pipe(dest("app /css/"))
        .pipe(dest("app /js/"))
        .pipe(dest("app /img/"))
        .pipe(dest("dist /"))
}

function convertStyles() {
    return src("app/scss/style.scss")
        .pipe(scss({
            outputStyle: 'compressed',
        }))
        .pipe(prefix({
            cascade: true,

        }))
        .pipe(dest("app/css"))
};

function browserSync() {
    sync.init({
        server: {
            baseDir: "app",
            open: "local"
        }
    });
}

function imgCompressed() {
    return src("app/_image/*.{jpg,png,svg}")
        .pipe(imagemin())
        .pipe(dest("app/image"))

}

function htmlInclude() {
    return src(["app/pages/*.html"])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest("app/"))
}

function watchFiles() {
    watch('app/scss/**/*.scss', convertStyles);

    watch("app/*.html").on('change', sync.reload);
    watch("app/css/*.css").on('change', sync.reload);

    watch("app/_image", imgCompressed);
    watch("app/pages/*.html", htmlInclude);

    //Fonts
    watch("app/fonts/**.ttf", series(convertFonts, fontsStyle))

}

exports.convertStyles = convertStyles;
exports.watchFiles = watchFiles;
exports.browserSync = browserSync;
exports.imgCompressed = imgCompressed;


//files
exports.struct = createFiles;




exports.default = parallel(htmlInclude, convertStyles, watchFiles, browserSync);



// build
function moveHtml() {
    return src("app/*.html")
        .pipe(dest("dist"))
}

function moveCss() {
    return src("app/css/*.css")
        .pipe(dest("dist/css"))
}

function moveJs() {
    return src("app/js/*.js")
        .pipe(dest("dist/js"))
}

function moveImg() {
    return src("app/image/*")
        .pipe(dest("dist/image"))
}

exports.moveHtml = moveHtml;
exports.moveCss = moveCss;
exports.moveJs = moveJs;
exports.moveImg = moveImg;
exports.htmlInclude = htmlInclude;

exports.build = series(moveHtml, moveCss, moveJs, moveImg);


//convert fonts

function convertFonts() {
    src(["app/fonts/**.ttf"])
        .pipe(ttf2woff())
        .pipe(dest("app/fonts/"))
    return src(["app/fonts/**.ttf"])
        .pipe(ttf2woff2())
        .pipe(dest("app/fonts/"))
}

exports.convertFonts = convertFonts;
exports.fontsStyle = fontsStyle;


const cb = () => {};

let srcFonts = "app/scss/_fonts.scss";
let appFonts = "app/fonts";

function fontsStyle() {
    let file_content = fs.readFileSync(srcFonts);

    fs.writeFile(srcFonts, "", cb);
    fs.readdir(appFonts, function(err, items) {
        if (items) {
            let c_fontname;
            for (let i = 0; i < items.length; i++) {
                let fontname = items[i].split(".");
                fontname = fontname[0];
                if (c_fontname != fontname) {
                    fs.appendFile(
                        srcFonts,
                        '@include font-face("' +
                        fontname +
                        '", "' +
                        fontname +
                        '", 400);\r\n',
                        cb
                    );
                }
                c_fontname = fontname;
            }
        }
    });
}