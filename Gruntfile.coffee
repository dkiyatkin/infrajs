fs = require 'fs'
files = [
    'src/core.coffee'
    'src/props/events.coffee'
    'src/props/loader.coffee'
    'src/props/load.coffee'
    'src/props/check.coffee'
    'src/props/compile1lvl.coffee'
    'src/props/compile2lvl.coffee'
    'src/props/external.coffee'
    'src/props/template.coffee'
    'src/props/layer.coffee'
    'src/props/links.coffee'
    'src/props/addressBar.coffee'
    'src/props/cache.coffee'
    'src/props/tools.coffee'
    'src/props/title.coffee'
    'src/props/proptpl.coffee'
]
test_files = [
    'test/core.coffee'
    'test/props/logger.coffee'
    'test/props/selector.coffee'
    'test/props/events.coffee'
    'test/props/loader.coffee'
    'test/props/load.coffee'
    'test/props/check.coffee'
    'test/props/compile1lvl.coffee'
    'test/props/compile2lvl.coffee'
    'test/props/checkLayer.coffee'
    'test/props/layer.coffee'
]
module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    watch:
      files: [ 'Gruntfile.coffee', 'src/infra.coffee', 'test/**/*.coffee' ]
      tasks: 'default'
    nodeunit: test_files
    coffeelint: [ 'src/infra.coffee', 'test/**/*.coffee' ]
    coffee:
      'dist/infra.js': 'src/infra.coffee'
    jsdoc:
      'doc': 'dist/infra.js'
    uglify:
      'dist/infra.min.js': 'dist/infra.js'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-nodeunit'
  grunt.loadNpmTasks 'grunt-jsdoc-plugin'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.registerTask 'default', ['nodeunit']
  grunt.registerTask 'optimize', 'optimize', ->
    dist = 'dist/infra.coffee'
    console.log 'optimize: ', dist
  grunt.registerTask 'make', ['nodeunit', 'coffee', 'uglify']
