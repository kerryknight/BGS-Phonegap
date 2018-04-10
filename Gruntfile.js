module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
            },
            production: {
                nonull: true,
                src: ['www/js/src/index.js',
                    'www/js/src/foursquare.js',
                    'www/js/src/facebook.js',
                    'www/js/src/google.js',
                    'www/js/src/utilities.js',
                    'www/js/src/entities/places.js',
                    'www/js/src/entities/players.js',
                    'www/js/src/entities/holes.js',
                    'www/js/src/entities/rules.js',
                    'www/js/src/entities/scores.js',
                    'www/js/src/apps/start/StartController.js',
                    'www/js/src/apps/start/StartView.js',
                    'www/js/src/apps/start/WelcomeView.js',
                    'www/js/src/apps/start/LoginView.js',
                    'www/js/src/apps/start/SignupView.js',
                    'www/js/src/apps/start/ForgotPasswordView.js',
                    'www/js/src/apps/main/MainController.js',
                    'www/js/src/apps/main/LeftPanelView.js',
                    'www/js/src/apps/main/MainView.js',
                    'www/js/src/apps/places/PlacesController.js',
                    'www/js/src/apps/places/list/PlacesListView.js',
                    'www/js/src/apps/places/list/BarItemView.js',
                    'www/js/src/apps/places/list/TaxiItemView.js',
                    'www/js/src/apps/places/map/PlacesMapView.js',
                    'www/js/src/apps/round-setup/RoundSetupController.js',
                    'www/js/src/apps/round-setup/RoundSetupOptionsView.js',
                    'www/js/src/apps/round-setup/RoundSetupListView.js',
                    'www/js/src/apps/round-setup/RoundSetupItemView.js',
                    'www/js/src/apps/scorecard/ScorecardController.js',
                    'www/js/src/apps/scorecard/ScorecardView.js',
                    'www/js/src/apps/scorecard/ScorecardItemView.js'
                ],
                dest: 'www/bgs-<%= pkg.version %>.js',
            },
        },

        uglify: {
            options: {
                // stripBanners: true,
                beautify: true,
                mangle: true,
                // report: 'gzip',
                banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'www/bgs-<%= pkg.version %>.js',
                dest: 'www/bgs-<%= pkg.version %>.min.js'
            }
        },

        imagemin: { // Task
            dynamic: { // Another target
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: '../images-uncompressed/', // Src matches are relative to this path
                    src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
                    dest: 'images/' // Destination path prefix
                }]
            }
        },
        
        "phonegap-build": {
            upload: {
                options: {
                    archive: "for-phonegap-build.zip",
                    "appId": "<ADOBE_PHONEGAP_APP_ID>",
                    "user": {
                        "email": "<ADOBE_PHONEGAP_EMAIL>",
                        "password": "<ADOBE_PHONEGAP_PASSWORD>",
                    },
                    timeout: 500000 // default is 60 secs but that time's out too often so I'll override
                }
            }
        },

        phonegap: {
          config: {
            root: 'for-phonegap-build',
            config: 'for-phonegap-build/config.xml',
            cordova: '../.cordova',
            path: 'grunt-phonegap-builds',
            plugins: [//'../../plugins/com.adobe.plugins.GAPlugin/',
                      '../../plugins/org.apache.cordova.device/',
                      '../../plugins/org.apache.cordova.network-information/',
                      '../../plugins/org.apache.cordova.battery-status/',
                      '../../plugins/org.apache.cordova.camera/',
                      '../../plugins/org.apache.cordova.contacts/',
                      '../../plugins/org.apache.cordova.dialogs/',
                      '../../plugins/org.apache.cordova.file/',
                      '../../plugins/org.apache.cordova.file-transfer/',
                      '../../plugins/org.apache.cordova.geolocation/',
                      '../../plugins/org.apache.cordova.inappbrowser/',
                      '../../plugins/org.apache.cordova.splashscreen/',
                      '../../plugins/org.apache.cordova.console/',
                      '../../plugins/com.phonegap.plugins.revmob'],
            platforms: ['ios'],
            verbose: false
          }
        },

        // zip pertinent files so we can upload to phone-gap build
        compress: {
          main: {
            options: {
              mode: 'zip',
              archive: 'for-phonegap-build.zip'
            },
            // pretty: true,
            // expand: true,
            files: [
              {src: ["index.html", 
                    "config.xml",
                    "bgs-<%= pkg.version %>.min.js",
                    "templates/*.html", 
                    "js/libs/*.js", 
                    "css/css/**/*.css",
                    "css/css/**/*.otf",
                    "css/css/**/*.png",
                    "css/css/**/*.svg",
                    "css/fonts/anton.woff", 
                    "res/**/**/*.png", 
                    "images/**/*.png",
                    "images/buttons/fb/*.png"], dest: "www/", filter:"isFile"}
            ]
          }
        },

        //clean out temporary files
        clean: ["www/bgs-<%= pkg.version %>.js"],

        //copy our icon/splash screen files to proper place
        copy: {
          main: {
            files: [
              {expand: true, flatten: true, src: ['res/screen/ios/*'], dest: '../Bar-Golf-Stars/Resources/splash/', filter: 'isFile'}, // includes files in path
              {expand: true, flatten: true, src: ['res/icons/ios/*'], dest: '../Bar-Golf-Stars/Resources/icons/', filter: 'isFile'} 
            ]
          }
        },

        jshint: {
            files: ['www/bgs-<%= pkg.version %>.js'],
            options: {
              globals: {
                jQuery: true
              },
              '-W030': true, //ignore W030 warnings
              '-W083': true, //ignore don't make functions withing a loop warning
            }, 

            src:     ['www/js/src/**/',
                     'www/js/src/*.js',
                     'www/js/src/apps/**/',
                     'www/js/src/apps/**/**/',
                     'www/js/src/apps/**/**/*.js',
                     'www/js/src/apps/**/*.js']
          }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-imagemin');
    // grunt.loadNpmTasks('grunt-phonegap-build');
    // grunt.loadNpmTasks('grunt-contrib-compress');
    // grunt.loadNpmTasks('grunt-phonegap');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s). These run whenever simply typing 'grunt' in terminal within project folder

    //use this one to push up to Adobe Phonegap Build (sans Facebook)
    // grunt.registerTask('default', ['concat', 'uglify', 'compress', 'phonegap-build:upload', 'clean']);

    //keep the concatenated js file to help with debugging crashes
    // grunt.registerTask('default', ['concat', 'compress', 'phonegap-build:upload']);

    //use this one for local phonegap cli building
    // grunt.registerTask('default', ['concat', 'uglify', 'zip', 'unzip', 'phonegap:build', 'clean', 'copy:main']);

    //use this one if we already have an xcode project but made js or css updates we need to implement
    // grunt.registerTask('default', ['concat', 'uglify', 'copy:update_www']);

    //use this when working with and already created Phonegap 2.9.0 local project
    grunt.registerTask('default', ['concat', 'jshint:src', 'uglify', 'copy:main', 'clean']);

};