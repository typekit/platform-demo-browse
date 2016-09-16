var jsFiles = ['./js/modules/**/*.js'];
var scssFile = 'scss/style.scss';
var watchFiles = jsFiles.concat([scssFile, 'scss/font-variations.scss']);

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'css/style.css': scssFile
                }
            }
        },
        autoprefixer: {
            options: {
                map: true
            },
            dist: {
                files: {
                    'css/style.css': 'css/style.css'
                }
            }
        },
        watch: {
            css: {
                files: watchFiles,
                tasks: ['sass', 'autoprefixer', 'browserify']
            },
            options: {
              livereload: true
            }
        },
        connect: {
          server: {
            options: {
              port: 8443,
              hostname: '*',
              protocol: 'https'
            }
          }
        },
        browserify: {
            dist: {
                files: {
                    './bundle.js': jsFiles
                }
            },
            options: {
                browserifyOptions: {
                    debug: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['connect', 'sass', 'autoprefixer', 'browserify', 'watch']);
    grunt.registerTask('compile', ['autoprefixer', 'browserify']);
}
