module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                globals: {

                },
                curly: true,
                eqeqeq: true,
                forin: true,
                undef: true,
                unused: true
            }
        },
        watch: {
            files: [
                'Gruntfile.js', 
                'src/**/*.js',
            ],
            tasks: ['dev']
        }
    });
    

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Faster build task for dev builds on watch
    grunt.registerTask('dev', ['jshint']);

    // Full build task
    grunt.registerTask('default', ['jshint']);
};
