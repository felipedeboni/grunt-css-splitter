'use strict';

var grunt = require('grunt');

exports.css_splitter = {

  run: function( test ) {
    var tests = [
      [ 'one-group.css', 'one-group-theme.css' ],
      [ 'multiple-groups.css', 'multiple-groups-theme.css', 'multiple-groups-theme-2.css' ],
      [ 'comments.css', 'comments.css', 'comments-theme.css' ]
    ];

    tests.forEach(function( files ) {
      var name = files[0].replace(/-/g, " ").replace(/\.css$/, "");

      files.forEach(function( file ) {
        var expected,
            output;

        expected = grunt.file.read( 'test/expected/' + file );
        output   = grunt.file.read( 'tmp/' + file );

        test.equal( output, expected, name );
      });
    });

    test.done();
  }

};