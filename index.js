'use strict';

var path = require('path');
var fs = require('fs');
var jsonPath = process.argv[2];

var JSONStream = require('JSONStream');
var Iconv  = require('iconv').Iconv;
var iconv = new Iconv('UTF-8', 'ISO-8859-1');

var fileIn = fs.createReadStream(jsonPath, 'utf8');
var fileOut = fs.createWriteStream(__dirname + '/out.csv', 'utf8');
var jsonStream = JSONStream.parse();

fileIn.pipe(jsonStream);

var header;
var i = 0;
jsonStream
    .on('data', function(data) {
        if (!header) {
            header = Object.keys(data);
            fileOut.write(header.map(function(name) {return '"' + name + '"'}).join(',') + '\n');
        }
        var csvChunk = header.map(function(name) {
            var dataChunk = data[name];
            if (dataChunk === null) {
                return '';
            } else if (dataChunk === undefined) {
                return '';
            } else if (typeof dataChunk === 'string' ) {
                return '"' + iconv.convert(dataChunk).toString() + '"';
            } else {
                return dataChunk;
            }
        }).join(',') + '\n';
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("line " + i++);
        fileOut.write(csvChunk);
    });