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
var es = require('event-stream');

var header;
var i = 0;

fileIn.pipe(es.split())                  //split stream to break on newlines
    .pipe(es.mapSync(function (data) { //turn this async function into a stream
        data = JSON.parse(data);
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
        return csvChunk;
    }))
    .pipe(fileOut);