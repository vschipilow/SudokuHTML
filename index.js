
"use strict";

const http = require('http');
const fs = require('fs');
console.log('http://localhost:8081/sudoku2.html');

http.createServer((req, res) => {
    console.log('loading = '.concat(req.url.substr(1)));
    fs.readFile(req.url.substr(1), (err, data) => {
        if (err) return console.log(err);
        res.end(data);
    });
}).listen(8081);