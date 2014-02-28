/*
 * grunt-css-splitter
 * https://github.com/felipedeboni/grunt-css-splitter
 *
 * Copyright (c) 2014 Felipe K. De Boni
 * Licensed under the MIT license.
 */

'use strict';

var _path = require('path');

module.exports = function(grunt) {
  grunt.registerMultiTask('css_splitter', 'Extract css blocks to another files.', function() {
    // =============================================================================================
    // VARS
    // =============================================================================================
    var regex               = {};

    regex.groupBegin        =  "\\/\\* ?SPLITTER BEGIN: {{GROUP}} ?\\*\\/";
    regex.groupEnd          = "\\/\\* ?SPLITTER END: {{GROUP}} ?\\*\\/";

    regex.getGroups         = new RegExp( regex.groupBegin.replace(/{{GROUP}}/, '(.+)' ), "g" );
    regex.groupContent      = regex.groupBegin + "[\\S\\s]*?" + regex.groupEnd;

    // =============================================================================================
    // UTILITIES
    // =============================================================================================
    var fileExists = function( src ) {
      if ( !grunt.file.exists( src ) ) {
        grunt.log.error( "Source file \"" + src + "\" not fount." );
        return false;
      }
      return true;
    };

    // create a personalized regex for group
    // -------------------------------------
    var makeGroupRegex = function( group, rgx, modifiers ) {
      return new RegExp( rgx.replace( /{{GROUP}}/g, group, modifiers ) );
    };

    // search for existent groups inside file content
    // ----------------------------------------------
    var findGroups = function( fileContent ) {
      var groups,
          match;

      groups = [];
      match = regex.getGroups.exec( fileContent );
      while ( match !== null ) {
        groups.push( match[1].trim() );
        match = regex.getGroups.exec( fileContent );
      }

      return groups;
    };

    // get contents from group
    // -----------------------
    var getGroupContent = function( fileContent, group ) {
      var rgxBegin,
          rgxContent,
          rgxEnd;

      rgxBegin = makeGroupRegex( group, regex.groupBegin );
      rgxContent = makeGroupRegex( group, regex.groupContent );
      rgxEnd = makeGroupRegex( group, regex.groupEnd );

      return fileContent.match( rgxContent ).toString().replace( rgxBegin, '' ).replace( rgxEnd, '' ).toString().trim();
    };

    // get a group content from original file
    // --------------------------------------
    var removeGroupContent = function( group, fileContent ) {
      var rgxContent = makeGroupRegex( group, regex.groupContent );
      return fileContent.replace( rgxContent, '' );
    };

    // write original file
    // -------------------
    var writeOriginal = function( filePath, fileContent ) {
      if ( grunt.file.write( filePath, fileContent.toString().trim() ) ) {
        grunt.log.ok( "File \"" + filePath + "\" updated." );
        return true;
      } else {
        grunt.log.warn( "Unable to update \"" + filePath + "\"." );
        return false;
      }
    };

    // =============================================================================================
    // PROCESSING
    // =============================================================================================
    // process group
    // -------------
    var processGroup = function( group, dest, fileContent ) {
      var content;

      content = getGroupContent( fileContent, group );

      if ( content.length > 0 ) {
        // write new file
        if ( grunt.file.write( _path.join(_path.dirname(dest), group), content ) ) {
          grunt.log.ok( "File \"" + group + "\" created." );
        } else {
          grunt.log.warn( "Unable to create \"" + group + "\"." );
        }
      } else {
        grunt.log.warn( "Empty group: \"" + group + "\"." );
      }
    };

    // process a file
    // --------------
    var process = function( file, fileContent ) {
      var groups;

      findGroups( fileContent ).forEach(function( group ) {
        processGroup( group, file.dest, fileContent );
        fileContent = removeGroupContent( group, fileContent );
      });

      return writeOriginal( file.src[0], fileContent );
    };

    // =============================================================================================
    // CSS SPLITTER
    // =============================================================================================
    this.files.forEach(function(file) {
      if ( fileExists( file.src[0] ) ) {
        process( file, grunt.file.read(file.src[0]) );
      } else {
        grunt.log.warn('Source file "' + filepath + '" not found.');
      }
    });

  });
};
