
"use strict";

let ctrl;

function onload() {
    ctrl = new Control();
    ctrl.changeGrid();
}

class Control {
    constructor () {
        this.model = new Model();
        this.view = new View();
    }

    changeGrid() {
        this.model.initialiseGrid(this.view.gridType);
        this.view.buildGrid(this.model.size, this.model.width, this.model.height);
    }

    cleanseInput(id, i, j) {
        const convertToNum = (this.model.gridType == '33N');
        const char = this.view.getCleanInput(id, i, j, convertToNum, this.model.pattern);
        this.model.changeInput(char, i, j, id);
        this.view.updateGrid('', this.model.enteredNos, this.model.found, this.model.pattern);
    }

    clearGrid() {
        this.model.clearGrid();
        this.view.clearGrid();
    }

    back() {
        this.view.updateGrid(this.model.back().id, this.model.enteredNos, this.model.found, this.model.pattern);
    }
}

class Model {
    constructor() {
        this.func = new ModelFunctions(this);
    }

    initialiseGrid(gridType) {
        this.gridType = gridType;
        this.width = parseInt(gridType[0]);
        this.height = parseInt(gridType[1]);
        this.size = this.width * this.height;
        this.numeric = this.gridType[2] == 'N';
        this.pattern = (this.numeric ? '123456789ABCDEFGHIJK' : 'ABCDEFGHIJKLMNOPQRST').substr(0, this.size);
        this.enteredNos = [];
        for (let i = 0; i < this.size; i++) {
            const row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(0);
            }
            this.enteredNos.push(row);
        }
        this.entries = [];
    }

    changeInput(char, row, col, id) {
        this.entries.push( { id, row,  col, num: this.enteredNos[row][col] } );
        this.enteredNos[row][col] = (char == '') ? 0 : this.pattern.indexOf(char) + 1;
        this.func.search();
    }

    back() {
        const entry = this.entries.pop();
        if (entry) {
            this.enteredNos[entry.row][entry.col] = entry.num;
            this.func.search();
            return entry;
        }
        return { id: '' };
    }

    clearGrid(size) {
        this.enteredNos.forEach((value, i) => {
            value.forEach((x, j) => {
                this.enteredNos[i][j] = 0;
            });
        });
        this.entries = [];
    }
}

class ModelFunctions {
    constructor (model) {
        this.model = model;
    }

    search() {
        this.model.found = [];
        for (let i = 0; i < this.model.size; i++) {
            const foundRow = [];
            for (let j = 0; j < this.model.size; j++) {
                let tempInt = this.model.enteredNos[i][j];
                foundRow.push(tempInt);
            }
            this.model.found.push(foundRow);
        }
        this.sudoku();
    }

    sudoku() {
        //
        // "found" contains sudoku 2 dimensional array of numbers
        // if alpha sudoku or numeric sudoku with more than 9 numbers,
        // then alphas have been converted to numbers
        // ie A, B, C, D........ => 1, 2, 3, 4..........
        // or ....8, 9, A, B...... => ...8, 9, 10, 11.....
        //
        // SUDOKU
        //
        let rax;
        let changed = true;
        while (changed) {
            changed = false;
            rax = []; // array of rows
            for (let i = 0; i < this.model.size; i++) { // for each row
                let y = []; // array of columns
                for (let j = 0; j < this.model.size; j++) { // for each column
                    let z = [];  // list of candidates for given cell
                    if (this.model.found[i][j] == 0) {
                        for (let n = 1; n <= this.model.size; n++) {
                            if (this.isValid(i, j, n)) {
                                // true if "n" does not exist in same row, column and box as cell[i][j]
                                z.push(n);
                            }
                        }
                    }
                    y.push(z);
                }
                rax.push(y);
            }
            for (let i = 0; i < this.model.size; i++) {
                for (let j = 0; j < this.model.size; j++) {
                    // true if number is only valid number in that cell
                    if (rax[i][j].length == 1) {
                        this.model.found[i][j] = rax[i][j][0];
                        changed = true;
                        break;
                    }
                }
                if (changed) break;
            }
            if (changed == false) {
                for (let i = 0; i < this.model.size; i++) {
                    // true if number can only appear once in a row
                    changed = this.check(rax, i, i, 0, this.model.size - 1);
                    if (changed) break;
                    // true if number can only appear once in a column
                    changed = this.check(rax, 0, this.model.size - 1, i, i);
                    if (changed) break;
                }
            }
            if (changed == false) {
                for (let i = 0; i < this.model.size; i += this.model.height) {
                    for (let j = 0; j < this.model.size; j += this.model.width) {
                        // true if number can only appear once in a box
                        changed = this.check(rax, i, i + this.model.height - 1, j, j + this.model.width - 1);
                        if (changed) break;
                    }
                    if (changed) break;
                }
            }
        }
    }

    isValid(i, j, n) {
        // true if "n" does not exist in same row, column and box as cell[i, j]
        for (let k = 0; k < this.model.size; k++) {
            if (this.model.found[i][k] == n) {
                return false;
            }
            if (this.model.found[k][j] == n) {
                return false;
            }
        }
        // x & y are top left corner of width X height square surrounding cell 'i j'
        let x = Math.trunc(i / this.model.height) * this.model.height;
        let y = Math.trunc(j / this.model.width) * this.model.width;
        for (let p = x; p < x + this.model.height; p++) {
            for (let q = y; q < y + this.model.width; q++) {
                if (this.model.found[p][q] == n) {
                    return false;
                }
            }
        }
        return true;
    }

    check (rax, xFrom, xTo, yFrom, yTo) {
        let foundX = 0;
        let foundY = 0;
        for (let n = 1; n <= this.model.size; n++) {
            let timesFound = 0;
            for (let i = xFrom; i <= xTo; i++) { // for each row
                for (let j = yFrom; j <= yTo; j++) { // for each column
                    for (let k = 0; k < rax[i][j].length; k++) { // for each valid value in the cell
                        if (rax[i][j][k] == n) {
                            timesFound++;
                            foundX = i;
                            foundY = j;
                        }
                    }
                }
            }
            if (timesFound == 1) {
                this.model.found[foundX][foundY] = n;
                return true;
            }
        }
        return false;
    }
}

class View {
    constructor() {
        this.gridType = document.getElementById('gridType').value;
        this.func = new ViewFunctions(this);
    }

    buildGrid (size, width, height) {
        this.size = size;
        this.width = width;
        this.height = height;
        const div = document.getElementById('mainDiv');
        const table = this.func.htmlFactory('table', div);
        const inSize = (navigator.userAgent.includes('(iPad;')) ? '1' : '2';
        for (let i = 0; i < size; i++) {
            const tr = this.func.htmlFactory('tr', table);
            for (let j = 0; j < size; j++) {
                const td = this.func.htmlFactory('td', tr, 'style='.concat(this.func.createBorderStyle(i, j)));
                const id = this.func.createId(i, j);
                this.func.htmlFactory('input', td, 'type=text&class=calculated&id='.concat(id, '&size=', inSize,
                    "&onkeyup=ctrl.cleanseInput('", id, "', ", i, ', ', j, ');'));
            }
        }
        let tr = this.func.htmlFactory('tr', table);
        this.func.htmlFactory('td', tr, 'colspan='.concat(size)).innerHTML = '&nbsp;';
        tr = this.func.htmlFactory('tr', table);
        const first = Math.trunc(size / 2);
        const last = size - first;
        let td = this.func.htmlFactory('td', tr, 'colspan='.concat(first));
        this.func.htmlFactory('input', td, 'type=button&value=Clear&onclick=ctrl.clearGrid();');
        td = this.func.htmlFactory('td', tr, 'style=text-align: right;&colspan='.concat(last));
        this.func.htmlFactory('input', td, 'type=button&value=Back&onclick=ctrl.back();');
    }

    getCleanInput(id, i, j, convertToNum, pattern) {
        const char = this.func.getValue(id);
        document.getElementById(this.func.createNextId(i, j)).focus();
        if (pattern.includes(char)) {
            this.func.setValue(id, char, 'entered');
            return char;
        } else if (convertToNum) {
            let tempChar = ('ABCDEFGHI'.indexOf(char) + 1).toString();
            this.func.setValue(id, tempChar, 'entered');
            return tempChar;
        } else {
            this.func.setValue(id, '', 'calculated');
            return char;
        }
    }

    updateGrid(id, entered, found, pattern) {
        found.forEach((row, i) => {
            row.forEach((num, j) => {
                const id = this.func.createId(i, j);
                if (num == 0) {
                    this.func.setValue(id, '', 'calculated');
                } else {
                    const char = pattern[num - 1];
                    const className = (entered[i][j] == 0) ? 'calculated' : 'entered';
                    this.func.setValue(id, char, className);
                }
            });
        });
        if (id) {
            document.getElementById(id).focus();
        }
    }

    clearGrid() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                document.getElementById(this.func.createId(i, j)).value = '';
            }
        }
    }

    back(entry) {
        if (entry) {
            document.getElementById(id)
        }
    }
}

class ViewFunctions {
    constructor (view) {
        this.view = view;
    }

    createId(i, j) {
        return String.fromCharCode('a'.charCodeAt(0) + i).concat(j + 1);
    }

    setValue (id, value, className) {
        const input = document.getElementById(id);
        input.value = value;
        input.className = className;
    }

    getValue (id) {
        let tag = document.getElementById(id);
        let char = tag.value.trim();
        if (char == '') {
            return '0';
        } else {
            return char.substr(0, 1).toUpperCase();
        }
    }

    createNextId(i, j) {
        let n = j + 1;
        let m = i;
        if (n >= this.view.size) {
            n = 0;
            m++;
            if (m >= this.view.size) {
                m = 0;
            }
        }
        return this.createId(m, n);
    }

    createBorderStyle (i, j) {
        let left = ((j + 1) % this.view.width == 1) ? 'solid' : 'hidden';
        let right = ((j + 1) % this.view.width == 0) ? 'solid' : 'hidden';
        let top = ((i + 1) % this.view.height == 1) ? 'solid' : 'hidden';
        let bottom = ((i + 1) % this.view.height == 0) ? 'solid' : 'hidden';
        return 'border-style: '.concat( top, ' ', right, ' ', bottom, ' ', left, ';');
    }

    htmlFactory (element, parent, attributes) {
        const tag = document.createElement(element);
        parent.appendChild(tag);
        if (attributes) {
            const x = attributes.split('&');
            for (let y of x) {
                const z = y.split('=');
                tag.setAttribute(z[0], z[1]);
            }
        }
        return tag;
    }
}
