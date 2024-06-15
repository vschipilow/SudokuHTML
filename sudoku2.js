
"use strict";

const g = { };
const calculated = '#00CCCC';
const entered = '#FFFF00';

function back() {
    const a = g.entries.pop();
    console.log(JSON.stringify(a));
    document.getElementById(a.id).value = numToChar(a.num);
    g.enteredNos[a.i][a.j] = a.num;
}

function changeGrid() {
    deconstructGridType(document.getElementById('gridType').value);
    let innerHTML = ['<table>'];
    const inSize = (navigator.userAgent.includes('(iPad;')) ? '1' : '2';
    g.enteredNos = [];
    for (let i = 0; i < g.size; i++) {
        innerHTML.push('<tr>');
        let row = [];
        for (let j = 0; j < g.size; j++) {
            const id = createId(i, j);
            innerHTML.push(sql(`/**
                <td style="${createBorderStyle(i, j)}">
                    <input type="text" id="${id}" size="${inSize}" value=""
                           style="color: ${calculated};" onkeyup="cleanseInput('${id}', ${i}, ${j});">
                </td> */`
            ));
            row.push(0);
        }
        innerHTML.push('</tr>');
        g.enteredNos.push(row);
    }
    innerHTML.push('</table>');
    document.getElementById('theGrid').innerHTML = innerHTML.join('');
    g.entries = [];
}

function check (xFrom, xTo, yFrom, yTo) {
    let foundX = 0;
    let foundY = 0;
    for (let n = 1; n <= g.size; n++) {
        let timesFound = 0;
        for (let i = xFrom; i <= xTo; i++) { // for each row
            for (let j = yFrom; j <= yTo; j++) { // for each column
                for (let k = 0; k < g.x[i][j].length; k++) { // for each valid value in the cell
                    if (g.x[i][j][k] == n) {
                        timesFound++;
                        foundX = i;
                        foundY = j;
                    }
                }
            }
        }
        if (timesFound == 1) {
            g.found[foundX][foundY] = n;
            document.getElementById(createId(foundX, foundY)).value = numToChar(n);
            return true;
        }
    }
    return false;
}

function cleanseInput(id, i, j) {
    let tag = document.getElementById(id);
    let char = tag.value.trim();
    if (char == '') {
        char = '0';
    } else {
        char = char.substr(0, 1).toUpperCase();
    }
    if (g.pattern.includes(char)) {
        if (char == '') console.log(1);
        tag.style.color = entered;
        tag.value = char;
        g.entries.push( { id, i, j, num: g.enteredNos[i][j] } );
        g.enteredNos[i][j] = g.pattern.indexOf(char) + 1;
    } else if (g.pattern == '123456789' && 'ABCDEFGHI'.includes(char)) {
        if (char == '') console.log(2);
        let tempInt = 'ABCDEFGHI'.indexOf(char) + 1;
        tag.style.color = entered;
        tag.value = tempInt.toString();
        g.entries.push( { id, i, j, num: g.enteredNos[i][j] } );
        g.enteredNos[i][j] = tempInt;
    } else {
        if (char == '') console.log(3);
        tag.style.color = calculated;
        tag.value = '';
        g.entries.push( { id, i, j, num: g.enteredNos[i][j] } );
        g.enteredNos[i][j] = 0;
    }
    setupFoundArray();
    document.getElementById(createNextId(i, j)).focus();
}

function clearGrid() {
    g.entries = [];
    for (let i = 0; i < g.size; i++) {
        for (let j = 0; j < g.size; j++) {
            g.enteredNos[i][j] = 0;
            document.getElementById(createId(i, j)).value = '';
        }
    }
}

function createBorderStyle (i, j) {
    let left = ((j + 1) % g.width == 1) ? 'solid' : 'hidden';
    let right = ((j + 1) % g.width == 0) ? 'solid' : 'hidden';
    let top = ((i + 1) % g.height == 1) ? 'solid' : 'hidden';
    let bottom = ((i + 1) % g.height == 0) ? 'solid' : 'hidden';
    return ['border-style:', top, right, bottom, left.concat(';'), 'border-color:', '#555555;'].join(' ');
}

function createId(i, j) {
    return String.fromCharCode('a'.charCodeAt(0) + i)
           .concat(j + 1);
}

function createNextId(i, j) {
    let n = j + 1;
    let m = i;
    if (n >= g.size) {
        n = 0;
        m++;
        if (m >= g.size) {
            m = 0;
        }
    }
    return createId(m, n);
}

function deconstructGridType(gridType) {
    g.gridType = gridType;
    g.width = parseInt(g.gridType[0]);
    g.height = parseInt(g.gridType[1]);
    g.size = g.width * g.height;
    g.numeric = g.gridType[2] == 'N';
    g.pattern = (g.numeric ? '123456789ABCDEFGHIJK' : 'ABCDEFGHIJKLMNOPQRST').substr(0, g.size);
}

function isValid(i, j, n) {
    // true if "n" does not exist in same row, column and box as cell[i, j]
    for (let k = 0; k < g.size; k++) {
        if (g.found[i][k] == n) {
            return false;
        }
        if (g.found[k][j] == n) {
            return false;
        }
    }
    // x & y are top left corner of width X height square surrounding cell 'i j'
    let x = Math.trunc(i / g.height) * g.height;
    let y = Math.trunc(j / g.width) * g.width;
    for (let p = x; p < x + g.height; p++) {
        for (let q = y; q < y + g.width; q++) {
            if (g.found[p][q] == n) {
                return false;
            }
        }
    }
    return true;
}

function numToChar(num) {
    return num == 0
           ? ''
           : g.pattern.charAt(num - 1);
}

function setupFoundArray() {
    // first setup new "found" array
    g.found = [];
    for (let i = 0; i < g.size; i++) {
        let row = [];
        for (let j = 0; j < g.size; j++) {
            let tempInt = g.enteredNos[i][j];
            row.push(tempInt);
            if (tempInt == 0) {
                let id = createId(i, j);
                let tag = document.getElementById(id);
                tag.value = '';
                tag.style.color = calculated;
            }
        }
        g.found.push(row);
    }
    sudoku();
}

function sql(text) {
    return text
           .substr(3, text.length - 6);
}

//
// "found" contains sudoku 2 dimensional array of numbers
// if alpha sudoku or numeric sudoku with more than 9 numbers,
// then alphas have been converted to numbers
// ie A, B, C, D........ => 1, 2, 3, 4..........
// or ....8, 9, A, B...... => ...8, 9, 10, 11.....
//
function sudoku() {
    let changed = true;
    while (changed) {
        changed = false;
        g.x = []; // array of rows
        for (let i = 0; i < g.size; i++) { // for each row
            let y = []; // array of columns
            for (let j = 0; j < g.size; j++) { // for each column
                let z = [];  // list of candidates for given cell
                if (g.found[i][j] == 0) {
                    for (let n = 1; n <= g.size; n++) {
                        if (isValid(i, j, n)) {
                            // true if "n" does not exist in same row, column and box as cell[i][j]
                            z.push(n);
                        }
                    }
                }
                y.push(z);
            }
            g.x.push(y);
        }
        for (let i = 0; i < g.size; i++) {
            for (let j = 0; j < g.size; j++) {
                // true if number is only valid number in that cell
                if (g.x[i][j].length == 1) {
                    g.found[i][j] = g.x[i][j][0];
                    document.getElementById(createId(i, j)).value = numToChar(g.found[i][j]);
                    changed = true;
                    break;
                }
            }
            if (changed) break;
        }
        if (changed == false) {
            for (let i = 0; i < g.size; i++) {
                // true if number can only appear once in a row
                changed = check(i, i, 0, g.size - 1);
                if (changed) break;
                // true if number can only appear once in a column
                changed = check(0, g.size - 1, i, i);
                if (changed) break;
            }
        }
        if (changed == false) {
            for (let i = 0; i < g.size; i += g.height) {
                for (let j = 0; j < g.size; j += g.width) {
                    // true if number can only appear once in a box
                    changed = check(i, i + g.height - 1, j, j + g.width - 1);
                    if (changed) break;
                }
                if (changed) break;
            }
        }
    }
}

/*

"use strict";

const fs = require('fs');

exports.processRequest = ((parms, res) => {
    let g = { pos: 0, res, parms, r: function (x) { this.res.write(x.substr(3, x.length - 6)); } };
    g.gridType = parms.size[0] + parms.size[1] + parms.type;
    deconstructGridType(g);
    switch (parms.command) {
        case 'init':
            doSudoku(g);
            break;
        case 'save': {
            populateFoundArray(g, false);
            let filename = 'Sudoku/sudoku'.concat(g.gridType, '.csv');
            fs.writeFile(filename, JSON.stringify({ "found": g.found }), err => {
                g.errMsg = (err) ? `${err}` : '"'.concat(filename, '" saved successfully');
                doSudoku(g);
            });
            break;
        }
        case 'reload':{
            let filename = 'Sudoku/sudoku'.concat(g.gridType, '.csv');
            fs.readFile(filename, (err, data) => {
                if (err) {
                    g.errMsg = `${err}`;
                    populateFoundArray(g, false);
                } else {
                    let jsn = JSON.parse(data);
                    g.found = jsn.found;
                }
                doSudoku(g);
            });
            break;
        }
        case 'query':
            populateFoundArray(g, false);
            doSudoku(g);
            break;
    }
});

function check (g, xFrom, xTo, yFrom, yTo) {
    let foundX = 0;
    let foundY = 0;
    for (let n = 1; n <= g.size; n++) {
        let timesFound = 0;
        for (let i = xFrom; i <= xTo; i++) { // for each row
            for (let j = yFrom; j <= yTo; j++) { // for each column
                for (let k = 0; k < g.x[i][j].length; k++) { // for each valid value in the cell
                    if (g.x[i][j][k] == n) {
                        timesFound++;
                        foundX = i;
                        foundY = j;
                    }
                }
            }
        }
        if (timesFound == 1) {
//        if (isValid(g, foundX, foundY, n)) {
            g.found[foundX][foundY] = n;
            return true;
//        }
        }
    }
    return false;
}

function createBorderStyle (g, i, j) {
    let left = ((j + 1) % g.width == 1) ? 'solid' : 'hidden';
    let right = ((j + 1) % g.width == 0) ? 'solid' : 'hidden';
    let top = ((i + 1) % g.height == 1) ? 'solid' : 'hidden';
    let bottom = ((i + 1) % g.height == 0) ? 'solid' : 'hidden';
    return 'border-style: ' + `${top} ${right} ${bottom} ${left}` + '; border-color: #DDDDDD;';
}

function createId(i, j) {

    return String.fromCharCode('a'.charCodeAt(0) + i) + (j + 1);
}

function createNextId(g, i, j) {
    let n = j + 1;
    let m = i;
    if (n >= g.size) {
        n = 0;
        m++;
        if (m >= g.size) {
            m = 0;
        }
    }
    return createId(m, n);
}

function deconstructGridType(g) {
    g.width = parseInt(g.gridType[0]);
    g.height = parseInt(g.gridType[1]);
    g.size = g.width * g.height;
    g.numeric = g.gridType[2] == 'N';
    g.pattern = (g.numeric ? '123456789ABCDEFGHIJK' : 'ABCDEFGHIJKLMNOPQRST').substr(0, g.size);
    g.found = [];
    for (let i = 0; i < g.size; i++) {
        let row = [];
        for (let j = 0; j < g.size; j++) {
            row.push(0);
        }
        g.found.push(row);
    }
}

function doSudoku(g) {
    headerHTML(g);
    if (g.errMsg) {
        g.r(`/**
        ${g.errMsg} * /`
        );
    }
    g.r(`/**
    <input type="hidden" name="size" id="size" value="${g.parms.size}">
    <input type="hidden" name="type" id="type" value="${g.parms.type}">
    <table> * /`
    );
    const inSize = (process.env.USER == 'mobile') ? '1' : '2';
    for (let i = 0; i < g.size; i++) {
        g.r(`/**
        <tr> * /`
        );
        for (let j = 0; j < g.size; j++) {
            const id = createId(i, j);
            g.r(`/**
            <td style="${createBorderStyle(g, i, j)}">
                <input type="text" id="${id}" name="${id}" size="${inSize}" value="${numToChar(g, i, j)}"
                       onkeyup="cleanseInput('${id}', '${createNextId(g, i, j)}', '${g.pattern}');">
            </td> * /`
            );
        }
        g.r(`/**
        </tr> * /`
        );
    }
    g.r(`/**
    </table> * /`
    );
    g.r(`/**
    </form>
    <br>
    <input type="button" value="Submit" onclick="submitForm('query');">&nbsp;
    <input type="button" value="Save" onclick="submitForm('save');">&nbsp;
    <input type="button" value="Reload" onclick="submitForm('reload');">&nbsp;
    <input type="button" value="Clear" onclick="clearSudoku();">
    <div id="outputTable"> * /`
    );
    if (g.parms.command != 'init') {
        sudoku(g);
        g.r(`/**
        <br>
        <table> * /`
        );
        for (let i = 0; i < g.size; i++) {
            g.r(`/**
            <tr> * /`
            );
            for (let j = 0; j < g.size; j++) {
                g.r(`/**
                <td class="result" style="${createBorderStyle(g, i, j)} padding: 0.5em;">
                    ${numToChar(g, i, j)}
                </td> * /`
                );
            }
            g.r(`/**
            </tr> * /`
            );
        }
        g.r(`/**
        </table> * /`
        );
    }
    g.r(`/**
    </div>
    <br>
    <a href="sudoku.html">
        back
    </a>
</body>
</html> * /`
    );
    g.res.end();
}

function headerHTML (g) {
    g.r(`/*
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" charset="UTF-8">
        <title>Sudoku</title>
        <link rel="stylesheet" href="../Stylesheet/stylesheet.css">
    </head>
    <body>
        <script>
            function submitForm(command) {
                document.getElementById('command').value = command;
                document.getElementById('formId').submit();
            }
            function cleanseInput(id, nextId, validInputs) {
                let test = document.getElementById(id).value.trim().toUpperCase();
                if (validInputs.includes(test)) {
                    document.getElementById(id).value = test;
                } else if (validInputs == '123456789' && 'ABCDEFGHI'.includes(test)) {
                    document.getElementById(id).value = ('ABCDEFGHI'.indexOf(test) + 1).toString();
                } else {
                    document.getElementById(id).value = '';
                }
                document.getElementById(nextId).focus();
            }
            function clearSudoku() {
                document.getElementById('outputTable').innerHTML = '';
                let parmSize = document.getElementById('size').value;
                let size = parseInt(parmSize[0]) * parseInt(parmSize[1]);
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        let id = String.fromCharCode('a'.charCodeAt(0) + i) + (j + 1);
                        document.getElementById(id).value = '';
                    }
                }
            }
        </script>
        <h1>
            Sudoku
        </h1>
        <form id="formId" action="/Sudoku/sudoku.do" method="post">
            <input type="hidden" value="" name="command" id="command"> * /`
    );
}

function isValid(g, i, j, n) {
    // true if "n" does not exist in same row, column and box as cell[i, j]
    for (let k = 0; k < g.size; k++) {
        if (g.found[i][k] == n) {
            return false;
        }
        if (g.found[k][j] == n) {
            return false;
        }
    }
    // x & y are top left corner of width X height square surrounding cell 'i j'
    let x = Math.trunc(i / g.height) * g.height;
    let y = Math.trunc(j / g.width) * g.width;
    for (let p = x; p < x + g.height; p++) {
        for (let q = y; q < y + g.width; q++) {
            if (g.found[p][q] == n) {
                return false;
            }
        }
    }
    return true;
}

function numToChar(g, i, j) {
    let num = g.found[i][j];
    return num == 0 ? '' : g.pattern.charAt(num - 1);
}

function populateFoundArray(g, sourceIsHTML) {
    for (let i = 0; i < g.size; i++) {
        for (let j = 0; j < g.size; j++) {
            let id = createId(i, j);
            let value = (sourceIsHTML) ? document.getElementById(id).value : g.parms[id];
            let char = (value) ? value.trim().substr(0, 1).toUpperCase() : '?';
            let num = g.pattern.indexOf(char) + 1; // zero represents null value in sudoku function
            g.found[i][j] = num;
        }
    }
}

//
// "found" contains sudoku 2 dimensional array of numbers
// if alpha sudoku or numeric sudoku with more than 9 numbers,
// then alphas have been converted to numbers
// ie A, B, C, D........ => 1, 2, 3, 4..........
// or ....8, 9, A, B...... => ...8, 9, 10, 11.....
//
function sudoku(g) {
    let changed = true;
    while (changed) {
        changed = false;
        g.x = []; // array of rows
        for (let i = 0; i < g.size; i++) { // for each row
            let y = []; // array of columns
            for (let j = 0; j < g.size; j++) { // for each column
                let z = [];  // list of candidates for given cell
                if (g.found[i][j] == 0) {
                    for (let n = 1; n <= g.size; n++) {
                        if (isValid(g, i, j, n)) {
                            // true if "n" does not exist in same row, column and box as cell[i, j]
                            z.push(n);
                        }
                    }
                }
                y.push(z);
            }
            g.x.push(y);
        }
        for (let i = 0; i < g.size; i++) {
            for (let j = 0; j < g.size; j++) {
                // true if number is only valid number in that cell
                if (g.x[i][j].length == 1) {
                    g.found[i][j] = g.x[i][j][0];
                    changed = true;
                    break;
                }
            }
            if (changed) break;
        }
        if (changed == false) {
            for (let i = 0; i < g.size; i++) {
                // true if number can only appear once in a row
                changed = check(g, i, i, 0, g.size - 1);
                if (changed) break;
                // true if number can only appear once in a column
                changed = check(g, 0, g.size - 1, i, i);
                if (changed) break;
            }
        }
        if (changed == false) {
            for (let i = 0; i < g.size; i += g.height) {
                for (let j = 0; j < g.size; j += g.width) {
                    // true if number can only appear once in a box
                    changed = check(g, i, i + g.height - 1, j, j + g.width - 1);
                    if (changed) break;
                }
                if (changed) break;
            }
        }
    }
}

/ * Test
let ra = [[6, 0, 0, 0, 0, 0, 0, 0, 9],
          [7, 0, 0, 1, 6, 0, 0, 2, 0],
          [0, 2, 0, 0, 0, 0, 0, 0, 0],
          [0, 1, 0, 7, 0, 0, 9, 0, 5],
          [0, 0, 2, 0, 0, 0, 8, 0, 0],
          [0, 3, 5, 0, 0, 9, 0, 1, 2],
          [0, 0, 3, 0, 5, 0, 0, 0, 0],
          [5, 4, 0, 2, 1, 0, 0, 0, 6],
          [0, 0, 0, 0, 8, 0, 5, 0, 0]];
ra.forEach(x => {console.log(`${x[0]} ${x[1]} ${x[2]} ${x[3]} ${x[4]} ${x[5]} ${x[6]} ${x[7]} ${x[8]}`)});
sudoku(ra, '33N');
console.log();
ra.forEach(x => {console.log(`${x[0]} ${x[1]} ${x[2]} ${x[3]} ${x[4]} ${x[5]} ${x[6]} ${x[7]} ${x[8]}`)});
// test end * /


*/
