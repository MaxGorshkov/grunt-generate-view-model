module.exports = function(grunt) {
    "use strict";
  
    grunt.initConfig({
      
      ts: {
        app: {
          files: [{
            src: [
              "./src/tasks/**/*.ts",
              "!./dist/**"
            ],
            dest: "./dist"
          },],
          tsconfig: true
        },
      },
      
      tslint: {
        options: {
          configuration: "tslint.json"
        },
        files: {
          src: [
            "./src/\*\*/\*.ts",
          ]
        }
      },

      copy: {
        template:{
          expand: true,
          cwd: './src/tasks',
          src: ['**/*.njk'],
          dest: './dist/src/tasks'
        }
      },

    });
  
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask("build", [
      "ts:app", "tslint", "copy"
    ]);

  };