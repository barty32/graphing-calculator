import { Graph } from './graph.js';
import { ExpressionParser, ExpressionType, ParserFatalError, Severity } from './parser.js';
import { AudioManager } from './audio.js';
import DataConverter from './converter.js';
import { sine, square, triangle } from './audio.js';
import { MathfieldElement } from '../mathlive/dist/mathlive';
//import type { MathfieldElement } from 'mathlive/dist/types/mathlive/mathlive';
var LineType;
(function (LineType) {
    LineType[LineType["expression"] = 0] = "expression";
    LineType[LineType["rawData"] = 1] = "rawData";
    LineType[LineType["audio"] = 2] = "audio";
    LineType[LineType["variable"] = 3] = "variable";
})(LineType || (LineType = {}));
//const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
//const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" fill="white"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" fill="white"><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>';
const eyeON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const eyeOFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
const brush = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24" style="vertical-align:top"><path d="M224 263.3C224.2 233.3 238.4 205.2 262.4 187.2L499.1 9.605C517.7-4.353 543.6-2.965 560.7 12.9C577.7 28.76 580.8 54.54 568.2 74.07L406.5 324.1C391.3 347.7 366.6 363.2 339.3 367.1L224 263.3zM320 400C320 461.9 269.9 512 208 512H64C46.33 512 32 497.7 32 480C32 462.3 46.33 448 64 448H68.81C86.44 448 98.4 429.1 96.59 411.6C96.2 407.8 96 403.9 96 400C96 339.6 143.9 290.3 203.7 288.1L319.8 392.5C319.9 394.1 320 397.5 320 400V400z"/></svg>';
//const palette = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" style="vertical-align:top"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M512 255.1C512 256.9 511.1 257.8 511.1 258.7C511.6 295.2 478.4 319.1 441.9 319.1H344C317.5 319.1 296 341.5 296 368C296 371.4 296.4 374.7 297 377.9C299.2 388.1 303.5 397.1 307.9 407.8C313.9 421.6 320 435.3 320 449.8C320 481.7 298.4 510.5 266.6 511.8C263.1 511.9 259.5 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256V255.1zM96 255.1C78.33 255.1 64 270.3 64 287.1C64 305.7 78.33 319.1 96 319.1C113.7 319.1 128 305.7 128 287.1C128 270.3 113.7 255.1 96 255.1zM128 191.1C145.7 191.1 160 177.7 160 159.1C160 142.3 145.7 127.1 128 127.1C110.3 127.1 96 142.3 96 159.1C96 177.7 110.3 191.1 128 191.1zM256 63.1C238.3 63.1 224 78.33 224 95.1C224 113.7 238.3 127.1 256 127.1C273.7 127.1 288 113.7 288 95.1C288 78.33 273.7 63.1 256 63.1zM384 191.1C401.7 191.1 416 177.7 416 159.1C416 142.3 401.7 127.1 384 127.1C366.3 127.1 352 142.3 352 159.1C352 177.7 366.3 191.1 384 191.1z"/></svg>'
const graphColors = [
    "darkred",
    "red",
    "darkorange",
    "yellow",
    "lime",
    "aqua",
    "blue",
    "purple",
    "chocolate",
    "pink",
    "goldenrod",
    "wheat",
    "green",
    "lightblue",
    "darkcyan",
    "thistle"
];
//const Parser = new ExpressionParser();
const expressions = [
    '2(x-3)',
    '2x + 3',
    //number
    '2 2',
    '25sin(x)',
    '25x + 9',
    '25 + 3',
    '3(x+x)',
    '5+(3-7)',
    //function
    'sin2(x)',
    //variable
    'x2+8',
    'xcos(4)',
    'xyz+8',
    'x-3',
    'x(5-6)',
    '5+(5-x)',
    //operator
    '3+sin(x)',
    '3++4',
    '3*(4+9*)',
    //lparen
    '3*(/5+2)',
    //rparen
    '4+(5-2)3',
    '4+(5-2)sin(z)',
    '4+(5-2)x+3',
    '4+(5-2)/8',
    '4+(5-2)(5+2)',
    '4+(5-(5+2))',
    //invalid input testing
    '*2'
    //add(2,3)
];
// for (const expr of expressions) {
//     console.log('Testing expression: ' + expr);
//     try {
//         console.log(Parser.tokenize(expr).parse().outputQueue);
//         if (Parser.problems.length) {
//             console.warn(Parser.problems);
//         }
//     }
//     catch (e) {
//         console.warn('Catched exception: ' + e.message);
//     }
// }
// try {
//     console.log('Testing evaluation:');
//     console.log(Parser.tokenize('3+4').parse().evaluate().outputQueue);
//     if (Parser.problems.length) {
//         console.warn(Parser.problems);
//     }
// }
// catch (e) {
//     console.warn('Catched exception: ' + e.message);
// }
// Parser.tokenize('sin(~(x+2)!)');
// Parser.parse();
// console.log(Parser);
// Parser.evaluate({ x: 10 });
const DOM = {
    playbackCurrentView: document.querySelector('#playback-current-view'),
    playbackLoop: document.querySelector('#playback-loop'),
    startInput: document.querySelector('#start-input'),
    endInput: document.querySelector('#end-input'),
    freq: document.querySelector('#sub-frequency'),
    ampl: document.querySelector('#sub-amplitude'),
    duty: document.querySelector('#sub-duty'),
    skew: document.querySelector('#sub-skew'),
    phase: document.querySelector('#sub-phase'),
    //bias: document.querySelector('#sub-bias'),
    time: document.querySelector('#sub-time'),
    waveSelect: document.querySelector('#wave-select'),
    btnPlay: document.querySelector('#btn-play'),
    optionsGrid: document.querySelector('#options-grid'),
    optionsMinorGrid: document.querySelector('#options-minor-grid'),
    optionsAxisNumbers: document.querySelector('#options-axis-number'),
    optionsDegrees: document.querySelector('#options-degrees'),
    optionsRadians: document.querySelector('#options-radians'),
    content: document.querySelector('#content'),
    wavePanel: document.querySelector('#wave-panel'),
    audioPanel: document.querySelector('#audio-panel')
};
class Line {
    color;
    name;
    id;
    type;
    parser;
    expression = '';
    //variables: { [key: string]: number } = {};
    //data: number[] = [];
    audioData = null;
    playing = false;
    DOM = {
        waveList: document.querySelector('#wave-boxes'),
        subContainer: undefined,
    };
    constructor(type) {
        this.type = type;
        this.name = this.generateName();
        this.color = this.generateColor();
        this.parser = new ExpressionParser();
        if (this.type == LineType.audio) {
            this.audioData = {
                waveType: 'sine',
                frequency: 440,
                amplitude: 50,
                duty: 50,
                skew: 50,
                phase: 0,
                bias: 0,
                start: 0,
                end: 2,
                currentView: false,
                loop: false
            };
        }
        this.id = graph.addLine(this.name, this.color);
        this.createWaveBox();
    }
    generateName() {
        if (this.type == LineType.audio) {
            return 'Audio Line ' + idCounter;
        }
        else if (this.type == LineType.rawData) {
            return 'Data Line ' + idCounter;
        }
        return 'Line ' + idCounter;
    }
    generateColor() {
        return graphColors[Math.floor((Math.random() * 100) % graphColors.length)]; //'#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    audioBtn;
    createWaveBox() {
        this.DOM.subContainer = document.createElement('div');
        this.DOM.subContainer.classList.add('sub-container', 'rounded', 'wave-box');
        //subContainer.id = this.id;
        const row1 = document.createElement('div');
        row1.classList.add('input-group');
        if (this.type == LineType.variable) {
            this.addVariableInput(row1);
        }
        else {
            //add items to row 1
            this.addVisibilityBtn(row1);
            this.addColorDropdown(row1);
            this.addIdInput(row1);
            if (this.type == LineType.audio) {
                this.addPlayBtn(row1);
                this.addSettingsBtn(row1);
            }
        }
        this.addRemoveBtn(row1);
        this.DOM.subContainer.appendChild(row1);
        if (this.type == LineType.expression || this.type == LineType.audio) {
            this.addMathInput(this.DOM.subContainer);
        }
        else if (this.type == LineType.variable) {
            this.addVariableSlider(this.DOM.subContainer);
        }
        else if (this.type == LineType.rawData) {
            this.addFileInput(this.DOM.subContainer);
        }
        this.DOM.waveList.appendChild(this.DOM.subContainer);
    }
    addVisibilityBtn(parent) {
        const btn1 = document.createElement('a');
        btn1.type = 'button';
        btn1.classList.add('btn', 'btn-secondary', 'wave-btn');
        btn1.innerHTML = eyeON;
        btn1.addEventListener('click', () => {
            //change visibility
            const line = graph.getLine(this.id);
            line.on = !line.on;
            btn1.innerHTML = line.on ? eyeON : eyeOFF;
            graph.draw();
        });
        parent.appendChild(btn1);
    }
    addColorDropdown(parent) {
        const colorDropdown = document.createElement('ul');
        const colInner = document.createElement('div');
        colorDropdown.classList.add('dropdown-menu', 'dropdown-menu-end');
        colInner.classList.add('color-picker');
        //fill color picker popup
        for (const color of graphColors) {
            const colorBtn = document.createElement('div');
            colorBtn.classList.add('color-picker-button');
            colorBtn.style.backgroundColor = color;
            colInner.append(colorBtn);
        }
        colorDropdown.appendChild(colInner);
        const colorBtn = document.createElement('a');
        colorBtn.type = 'button';
        colorBtn.classList.add('btn', 'btn-secondary', 'wave-btn');
        colorBtn.innerHTML = brush;
        colorBtn.setAttribute('data-bs-toggle', 'dropdown');
        colorBtn.querySelector('svg')?.setAttribute('fill', this.color);
        colorBtn.ariaExpanded = 'false';
        colorBtn.addEventListener('click', (e) => {
            //change color
            //assing click handlers to color picker
            const btns = colorDropdown.querySelectorAll('.color-picker-button');
            for (const btn of btns) {
                btn.addEventListener('click', () => {
                    this.color = btn.style.backgroundColor;
                    colorBtn.querySelector('svg')?.setAttribute('fill', this.color);
                    graph.getLine(this.id).color = this.color;
                    graph.draw();
                });
            }
        });
        parent.appendChild(colorBtn);
        parent.appendChild(colorDropdown);
    }
    addIdInput(parent) {
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.classList.add('form-control');
        idInput.value = this.name;
        idInput.addEventListener('input', (e) => {
            //change name
            graph.getLine(this.id).name = idInput.value;
            //graph.draw();
        });
        parent.appendChild(idInput);
    }
    addVariableInput(parent) {
        const varInput = document.createElement('select');
        varInput.classList.add('form-select');
        varInput.style.maxWidth = '70px';
        const letters = ['a', 'b', 'c', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'z'];
        for (const letter of letters) {
            if (variables[letter] === undefined) {
                const opt = document.createElement('option');
                opt.innerText = letter;
                opt.value = letter;
                varInput.options.add(opt);
            }
        }
        const eq = document.createElement('span');
        eq.classList.add('input-group-text', 'input-label-box');
        eq.innerHTML = '=';
        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.classList.add('form-control');
        parent.appendChild(varInput);
        parent.appendChild(eq);
        parent.appendChild(numInput);
    }
    addVariableSlider(parent) {
    }
    addPlayBtn(parent) {
        const btn2 = document.createElement('a');
        btn2.type = 'button';
        btn2.classList.add('btn', 'btn-success', 'wave-btn');
        btn2.innerHTML = play;
        //audioMgr.addNode(this.id, () => 0);
        btn2.addEventListener('click', (e) => {
            this.toggleAudio();
        });
        this.audioBtn = btn2;
        parent.appendChild(btn2);
    }
    addSettingsBtn(parent) {
        const btn3 = document.createElement('a');
        btn3.type = 'button';
        btn3.classList.add('btn', 'btn-secondary', 'wave-btn');
        btn3.innerHTML = '<img src="/assets/images/settings.svg">';
        btn3.addEventListener('click', (e) => {
            this.edit();
        });
        parent.appendChild(btn3);
    }
    addRemoveBtn(parent) {
        const btn4 = document.createElement('a');
        btn4.type = 'button';
        btn4.classList.add('btn', 'btn-danger', 'wave-btn');
        btn4.innerHTML = '<img src="/assets/images/trash.svg">';
        btn4.addEventListener('click', (e) => {
            //remove
            this.DOM.subContainer?.remove();
            graph.removeLine(this.id);
            graph.draw();
            audioMgr.removeNode(this.id);
            //remove itself from lines
            lines[this.id] = undefined;
        });
        parent.appendChild(btn4);
    }
    addFileInput(parent) {
        const row2 = document.createElement('div');
        row2.classList.add('input-group', 'mt-2');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.classList.add('form-control');
        fileInput.addEventListener('change', async (e) => {
            if (!fileInput.files?.length)
                return;
            //graph.attachArray(this.id, await DataConverter.convert(fileInput.files[0]));
            DataConverter.convert(fileInput.files[0]).then((arr) => {
                graph.attachArray(this.id, arr);
            });
        });
        row2.appendChild(fileInput);
        parent.appendChild(row2);
    }
    addMathInput(parent) {
        const row2 = document.createElement('div');
        row2.classList.add('input-group', 'mt-2');
        const fnType = document.createElement('span');
        fnType.classList.add('input-group-text', 'input-label-box');
        fnType.innerHTML = 'f(x):';
        row2.appendChild(fnType);
        const errorImg = document.createElement('img');
        errorImg.src = '/assets/images/error.svg';
        errorImg.classList.add('error-img');
        const warningImg = document.createElement('img');
        warningImg.src = '/assets/images/warning.svg';
        warningImg.classList.add('warn-img');
        const errTooltip = document.createElement('span');
        errTooltip.classList.add('e-tooltip', 'rounded');
        const warnTooltip = document.createElement('span');
        warnTooltip.classList.add('w-tooltip', 'rounded');
        row2.appendChild(errorImg);
        row2.appendChild(errTooltip);
        row2.appendChild(warningImg);
        row2.appendChild(warnTooltip);
        const fnInput = new MathfieldElement(); //document.createElement('math-field');//input
        //fnInput.type = 'text';
        fnInput.contentEditable = 'true';
        //fnInput.spellcheck = false;
        fnInput.id = `expr-input-${this.id}`;
        fnInput.classList.add('form-control');
        //console.log(fnInput.getOptions('macros'));
        // fnInput.setOptions({
        //     macros: {
        //         ...fnInput.getOptions('macros'),
        //         and: '{#1}',
        //     }
        // })
        fnInput.addEventListener('input', () => {
            try {
                console.log('Latex: ' + fnInput.getValue('latex-unstyled'));
                this.expression = this.parser.latexToString(fnInput.getValue('latex-unstyled'));
                console.log('Expr: ' + this.expression);
                this.parser.tokenize(this.expression).checkSyntax().parse();
                this.parser.evaluate({ x: 0, y: 0, degrees: degrees ? 1 : 0 });
                errTooltip.innerHTML = '';
                warnTooltip.innerHTML = '';
                for (const err of this.parser.problems) {
                    if (err.severity == Severity.WARNING) {
                        warnTooltip.innerHTML += err.desc + '<br>';
                    }
                }
                errorImg.style.display = 'none';
                warningImg.style.transform = 'none';
                warningImg.style.display = warnTooltip.innerHTML ? 'block' : 'none';
                fnInput.style.color = warnTooltip.innerHTML ? 'orange' : 'black';
                switch (this.parser.getExpressionType()) {
                    case ExpressionType.FUNCTION:
                        fnType.innerHTML = 'f(x):';
                        break;
                    case ExpressionType.YFUNCTION:
                        fnType.innerHTML = 'f(y):';
                        break;
                    case ExpressionType.EQUATION:
                        fnType.innerHTML = 'f(x,y):';
                        break;
                }
            }
            catch (e) {
                if (!(e instanceof ParserFatalError)) {
                    throw e;
                }
                errTooltip.innerHTML = e.message + '<br>';
                warnTooltip.innerHTML = '';
                for (const err of this.parser.problems) {
                    if (err.severity >= Severity.ERROR) {
                        errTooltip.innerHTML += err.desc + '<br>';
                    }
                    else if (err.severity == Severity.WARNING) {
                        warnTooltip.innerHTML += err.desc + '<br>';
                    }
                }
                errorImg.style.display = 'block';
                warningImg.style.transform = 'translateX(-27px)';
                warningImg.style.display = warnTooltip.innerHTML ? 'block' : 'none';
                fnInput.style.color = errTooltip.innerHTML ? 'red' : warnTooltip.innerHTML ? 'orange' : 'black';
                graph.draw(2);
                return;
            }
            graph.attachExpression(this.id, this.parser.outputQueue, { degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
            if (this.type == LineType.audio && this.audioData?.waveType == 'custom') {
                // graph.attachFn(this.id, (x, y) => {
                //     try {
                //         return this.parser.evaluate({ x, y, degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
                //     }
                //     catch (e) {
                //         return undefined;
                //     }
                // }, this.parser.getExpressionType());
                this.audioDataChanged();
            }
        });
        //sum(?, n, 1, 10) sin((x)/(5)+2)*(1)/(4x)+ cos(4)
        //\sum _{n=1}^{10}\sin \left(\frac{x}{5}+2\right)\cdot \frac{1}{4o}+\cos \left(4\right)
        // const mf = MQ.MathField(fnInput, {
        //     leftRightIntoCmdGoes: 'up',
        //     restrictMismatchedBrackets: true,
        //     sumStartsWithNEquals: true,
        //     supSubsRequireOperand: true,
        //     charsThatBreakOutOfSupSub: '+-=<>',
        //     substituteTextArea: () => document.createElement('span'),
        //     autoCommands: 'pi tau infinity infty sqrt sum prod coprod',//theta int
        //     autoOperatorNames: this.parser.getSupportedFunctions(),//'sin cos tan tg root power pow abs max min mod fac round trunc ceil floor sign sgn add sub mul div shl shr not and or xor ln log exp',
        //     handlers: {
        //         edit: (f) => {
        //             try {
        //                 this.expression = this.parser.latexToString(f.latex());
        //                 console.log('Latex: ' + f.latex());
        //                 console.log('Expr: ' + this.expression);
        //                 this.parser.tokenize(this.expression).checkSyntax().parse();
        //                 console.log(this.parser.evaluate({ x: Infinity, y: Infinity, degrees: degrees ? 1 : 0 }).asymptotes);
        //                 errTooltip.innerHTML = '';
        //                 warnTooltip.innerHTML = '';
        //                 for (const err of this.parser.problems) {
        //                     if (err.severity == Severity.WARNING) {
        //                         warnTooltip.innerHTML += err.desc + '<br>';
        //                     }
        //                 }
        //                 errorImg.style.display = 'none';
        //                 warningImg.style.transform = 'none';
        //                 warningImg.style.display = warnTooltip.innerHTML ? 'block' : 'none';
        //                 fnInput.style.color = warnTooltip.innerHTML ? 'orange' : 'black';
        //                 switch (this.parser.getExpressionType()) {
        //                     case ExpressionType.FUNCTION:
        //                         fnType.innerHTML = 'f(x):';
        //                         break;
        //                     case ExpressionType.YFUNCTION:
        //                         fnType.innerHTML = 'f(y):';
        //                         break;
        //                     case ExpressionType.EQUATION:
        //                         fnType.innerHTML = 'f(x,y):';
        //                         break;
        //                 }
        //             }
        //             catch (e) {
        //                 if (!(e instanceof ParserFatalError)) {
        //                     throw e;
        //                 }
        //                 errTooltip.innerHTML = (e as Error).message + '<br>';
        //                 warnTooltip.innerHTML = '';
        //                 for (const err of this.parser.problems) {
        //                     if (err.severity >= Severity.ERROR) {
        //                         errTooltip.innerHTML += err.desc + '<br>';
        //                     }
        //                     else if (err.severity == Severity.WARNING) {
        //                         warnTooltip.innerHTML += err.desc + '<br>';
        //                     }
        //                 }
        //                 errorImg.style.display = 'block';
        //                 warningImg.style.transform = 'translateX(-27px)';
        //                 warningImg.style.display = warnTooltip.innerHTML ? 'block' : 'none';
        //                 fnInput.style.color = errTooltip.innerHTML ? 'red' : warnTooltip.innerHTML ? 'orange' : 'black';
        //                 graph.draw(2);
        //                 return;
        //             }
        //             graph.attachExpression(this.id, this.parser.outputQueue, { degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
        //             if (this.type == LineType.audio && this.audioData?.waveType == 'custom') {
        //                 // graph.attachFn(this.id, (x, y) => {
        //                 //     try {
        //                 //         return this.parser.evaluate({ x, y, degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
        //                 //     }
        //                 //     catch (e) {
        //                 //         return undefined;
        //                 //     }
        //                 // }, this.parser.getExpressionType());
        //                 this.audioDataChanged();
        //             }
        //         }
        //     }
        // });
        // fnInput.addEventListener('copy', (e) => {
        //     e.clipboardData?.setData('text/plain', this.parser.latexToString(mf.latex()));
        //     e.preventDefault();
        // });
        // fnInput.addEventListener('paste', (e) => {
        //     e.preventDefault();
        //     mf.typedText(e.clipboardData?.getData('text') ?? '');
        // });
        /*
                fnInput.addEventListener('input', () => {
                    this.expression = fnInput.value;//innerText
                    //this.parser.tokenize(this.expression);
                    //console.log(this.parser.tokenStack);
                    //return;
                    try {
                        this.parser.tokenize(this.expression).checkSyntax().parse();
                        this.parser.evaluate({ x: Infinity, y: Infinity, degrees: degrees ? 1 : 0 });
                        errTooltip.innerHTML = '';
                        warnTooltip.innerHTML = '';
                        //let virtualIndex = 0;
                        for (const err of this.parser.problems) {
                            // if (err.severity >= Severity.ERROR) {
                            //     errTooltip.innerHTML += err.desc + '<br>';
                            // }
                            // else
                            if (err.severity == Severity.WARNING) {
                                warnTooltip.innerHTML += err.desc + '<br>';
                                //virtualIndex += err.char;
                                //fnInput.innerHTML = (fnInput.innerHTML.slice(0, virtualIndex) + `<span class="warn-text">${fnInput.innerHTML.slice(virtualIndex, virtualIndex + err.len)}</span>` + fnInput.innerHTML.slice(virtualIndex + err.len));
                                //virtualIndex += err.len + 31;
                                //console.log(fnInput.innerHTML);
                            }
                        }
                        errorImg.style.display = 'none';//errTooltip.innerHTML ? 'block' : 'none';
                        warningImg.style.transform = 'none';//errTooltip.innerHTML ? 'translateX(-27px)' : 'none';
                        warningImg.style.display = warnTooltip.innerHTML ? 'block' : 'none';
                        fnInput.style.color = warnTooltip.innerHTML ? 'orange' : 'black';
                    }
                    catch (e) {
                        if (!(e instanceof ParserFatalError)) {
                            throw e;
                        }
                        //errorImg.style.display = 'block';
                        ////const tText = row2.querySelector('.e-tooltip');if (tText)
                        //tooltip.innerHTML = (e as Error).message + '<br>';
                        //for (const err of this.parser.problems) {
                        //    if (err.severity >= Severity.ERROR) {
                        //        tooltip.innerHTML += err.desc + '<br>';
                        //    }
                        //}
                        errTooltip.innerHTML = (e as Error).message + '<br>';
                        warnTooltip.innerHTML = '';
                        for (const err of this.parser.problems) {
                            if (err.severity >= Severity.ERROR) {
                                errTooltip.innerHTML += err.desc + '<br>';
                            }
                            else if (err.severity == Severity.WARNING) {
                                warnTooltip.innerHTML += err.desc + '<br>';
                            }
                        }
                        errorImg.style.display = 'block';
                        warningImg.style.transform = 'translateX(-27px)';
                        warningImg.style.display = warnTooltip.innerHTML ? 'block' : 'none';
                        fnInput.style.color = errTooltip.innerHTML ? 'red' : warnTooltip.innerHTML ? 'orange' : 'black';
                        graph.draw(true);
                        return;
                    }
        
                    graph.attachFn(this.id, (x, y) => {
                        try {
                            return this.parser.evaluate({ x, y, degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
                        }
                        catch (e) {
                            return undefined;
                        }
                    }, this.parser.getExpressionType());
                    if (this.type == LineType.audio && this.audioData?.waveType == 'custom') {
                        this.audioDataChanged();
                    }
                });*/
        if (this.type == LineType.audio) {
            //fnInput.disabled = true;
            //fnInput.contentEditable = 'false';
            currentEditedLine = this;
            this.audioDataChanged();
        }
        row2.appendChild(fnInput);
        parent.appendChild(row2);
    }
    edit() {
        currentEditedLine = this;
        DOM.audioPanel.style.display = 'block';
        setTimeout(() => {
            DOM.audioPanel.style.transform = 'translateX(0)';
            DOM.wavePanel.style.transform = 'translateX(-110%)';
        }, 20);
        setTimeout(() => { DOM.wavePanel.style.display = 'none'; }, 300);
        //audioPanel.style.display = 'block';
        //wavePanel.style.display = 'none';
        // audioPanel.classList.remove('translated');
        // wavePanel.classList.add('translated');
        if (this.audioData) { //currentLine.audio
            DOM.waveSelect.value = this.audioData.waveType;
            const sliders = ['frequency', 'amplitude', 'duty', 'skew', 'phase' /*, 'bias'*/];
            for (const val of sliders) {
                document.querySelector(`#${val}-slider`).value = this.audioData[val];
                document.querySelector(`#${val}-input`).value = this.audioData[val];
            }
            DOM.startInput.value = this.audioData.start.toString();
            DOM.endInput.value = this.audioData.end.toString();
            DOM.playbackLoop.checked = this.audioData.loop;
            updateBoxVisibility();
        }
    }
    toggleAudio() {
        const boxBtn = this.audioBtn;
        const topBtn = DOM.btnPlay;
        if (this.playing) {
            this.playing = false;
            audioMgr.stopNode(this.id);
            if (boxBtn)
                boxBtn.innerHTML = play;
            if (topBtn)
                topBtn.innerHTML = play;
        }
        else {
            if (boxBtn)
                boxBtn.innerHTML = pause;
            if (topBtn)
                topBtn.innerHTML = pause;
            audioMgr.startNode(this.id, () => {
                this.playing = false;
                if (boxBtn)
                    boxBtn.innerHTML = play;
                if (topBtn)
                    topBtn.innerHTML = play;
            });
            this.playing = true;
        }
    }
    audioDataChanged() {
        if (this.audioData) {
            let fn;
            switch (this.audioData.waveType) {
                case 'sine':
                    graph.attachFn(this.id, (x) => {
                        if (this.audioData) {
                            return sine(x, this.audioData.frequency, this.audioData.amplitude, this.audioData.phase, 0);
                        }
                        return undefined;
                    }, ExpressionType.FUNCTION);
                    break;
                case 'square':
                    graph.attachFn(this.id, (x) => {
                        if (this.audioData) {
                            return square(x, this.audioData.frequency, this.audioData.amplitude, this.audioData.duty, this.audioData.phase, 0);
                        }
                        return undefined;
                    }, ExpressionType.FUNCTION);
                    break;
                case 'triangle':
                    graph.attachFn(this.id, (x) => {
                        if (this.audioData) {
                            return triangle(x, this.audioData.frequency, this.audioData.amplitude, this.audioData.skew, this.audioData.phase, 0);
                        }
                        return undefined;
                    }, ExpressionType.FUNCTION);
                    break;
                case 'custom':
                    if (this.playing)
                        this.toggleAudio();
                    fn = (x) => {
                        return this.parser.evaluate({ x: x }); //.result;
                    };
                    break;
                default:
                    graph.attachFn(this.id, () => undefined, ExpressionType.FUNCTION);
            }
            audioMgr.addNode(this.id, this.audioData, fn);
            if (this.playing)
                audioMgr.startNode(this.id);
            graph.draw();
        }
    }
}
//const MQ = MathQuill.getInterface(2);
const audioMgr = new AudioManager();
var lines = {};
var variables = {};
var idCounter = -1;
var currentEditedLine;
var degrees = false;
const graph = new Graph(document.querySelector('#graph'));
graph.draw();
document.querySelector('#add')?.addEventListener('click', () => {
    lines[++idCounter] = new Line(LineType.expression);
});
document.querySelector('#add-audio')?.addEventListener('click', () => {
    lines[++idCounter] = new Line(LineType.audio);
});
document.querySelector('#add-data')?.addEventListener('click', () => {
    lines[++idCounter] = new Line(LineType.rawData);
});
document.querySelector('#add-variable')?.addEventListener('click', () => {
    lines[++idCounter] = new Line(LineType.variable);
});
document.addEventListener("DOMContentLoaded", function () {
    //open panel by default on PC
    if (window.matchMedia('(min-width: 768px)').matches) {
        document.querySelector('#side-panel')?.classList.add('show');
    }
    //const tooltipTriggerList = document.querySelectorAll('[data-bs-tooltip="tooltip"]');
    // @ts-ignore
    //[...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, { delay: { show: 1000, hide: 0} }));
    lines[++idCounter] = new Line(LineType.expression);
    graph.fixSize();
    graph.resetZoom();
});
document.querySelector('#audio-back')?.addEventListener('click', () => {
    DOM.wavePanel.style.display = 'block';
    setTimeout(() => {
        DOM.wavePanel.style.transform = 'translateX(0)';
        DOM.audioPanel.style.transform = 'translateX(110%)';
    }, 20);
    setTimeout(() => { DOM.audioPanel.style.display = 'none'; }, 300);
});
DOM.waveSelect?.addEventListener('change', (e) => {
    if (currentEditedLine.audioData) {
        currentEditedLine.audioData.waveType = DOM.waveSelect.value;
        const input = document.querySelector(`#expr-input-${currentEditedLine.id}`);
        if (currentEditedLine.audioData.waveType == 'custom') {
            input.disabled = false;
            if (input.value == '')
                graph.attachFn(currentEditedLine.id, () => undefined, ExpressionType.FUNCTION);
        }
        else {
            input.disabled = true;
        }
    }
    currentEditedLine.audioDataChanged();
    updateBoxVisibility();
});
DOM.btnPlay?.addEventListener('click', () => {
    currentEditedLine.toggleAudio();
});
DOM.optionsGrid?.addEventListener('change', () => {
    graph.options.grid = DOM.optionsGrid.checked;
    graph.draw();
});
DOM.optionsMinorGrid?.addEventListener('change', () => {
    graph.options.minorGrid = DOM.optionsMinorGrid.checked;
    graph.draw();
});
DOM.optionsAxisNumbers?.addEventListener('change', () => {
    graph.options.axisNumbers = DOM.optionsAxisNumbers.checked;
    graph.draw();
});
DOM.optionsDegrees?.addEventListener('click', () => {
    degrees = true;
    graph.draw(2);
    //simulate input event to recalculate all lines
    //for (let i = 0; i < idCounter; i++){
    //    document.querySelector(`#expr-input-${i}`)?.dispatchEvent(new Event('input', { bubbles: true }));
    //}
});
DOM.optionsRadians?.addEventListener('click', () => {
    degrees = false;
    graph.draw(2);
    //for (let i = 0; i < idCounter; i++) {
    //    document.querySelector(`#expr-input-${i}`)?.dispatchEvent(new Event('input', { bubbles: true }));
    //}
});
DOM.playbackCurrentView?.addEventListener('change', (e) => {
    DOM.startInput.disabled = DOM.playbackCurrentView.checked;
    DOM.endInput.disabled = DOM.playbackCurrentView.checked;
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.currentView = DOM.playbackCurrentView.checked;
    currentEditedLine.audioDataChanged();
});
DOM.playbackLoop?.addEventListener('change', (e) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.loop = DOM.playbackLoop.checked;
    currentEditedLine.audioDataChanged();
});
DOM.startInput?.addEventListener('change', (e) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.start = parseFloat(DOM.startInput.value);
    currentEditedLine.audioDataChanged();
});
DOM.endInput?.addEventListener('change', (e) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.end = parseFloat(DOM.endInput.value);
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('frequency', 0, 22000, (val) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.frequency = val;
    currentEditedLine.audioDataChanged();
}, true);
addSliderSyncGroup('duty', 0, 100, (val) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.duty = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('amplitude', 0, 100, (val) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.amplitude = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('skew', 0, 100, (val) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.skew = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('phase', 0, 360, (val) => {
    if (currentEditedLine.audioData)
        currentEditedLine.audioData.phase = val;
    currentEditedLine.audioDataChanged();
});
function addSliderSyncGroup(idPrefix, min, max, callback, logarithmic = false) {
    const slider = document.querySelector(`#${idPrefix}-slider`);
    const input = document.querySelector(`#${idPrefix}-input`);
    slider.addEventListener('input', (e) => {
        const sliderVal = parseInt(slider.value);
        //console.log(sliderVal);
        const result = /*logarithmic ? Math.round(-Math.log(1.1 - (sliderVal / max))*max) :*/ sliderVal; //  Math.pow((sliderVal / max), 5) * max
        input.value = result.toString();
        callback(result, e);
    });
    input.addEventListener('input', (e) => {
        let val = parseInt(input.value);
        if (isNaN(val))
            return;
        if (val < min)
            val = min;
        if (val > max)
            val = max;
        slider.value = val.toString();
        input.value = val.toString();
        callback(val, e);
    });
}
// .____________________________________________________________.
// |          | freq | ampl | duty | skew | phase | bias | time |
// |----------|------|------|------|------|-------|------|------|
// | Sine     | yes  | yes  | no   | no   | yes   | yes  | no   |
// | Square   | yes  | yes  | yes  | no   | yes   | yes  | no   |
// | Triangle | yes  | yes  | no   | yes  | yes   | yes  | no   |
// | Custom   | no   | no   | no   | no   | no    | no   | yes  |
// |----------|------|------|------|------|-------|------|------|
//
function updateBoxVisibility() {
    if (currentEditedLine.audioData?.waveType == 'sine'
        || currentEditedLine.audioData?.waveType == 'square'
        || currentEditedLine.audioData?.waveType == 'triangle') {
        DOM.freq?.classList.remove('hidden');
        DOM.ampl?.classList.remove('hidden');
        DOM.phase?.classList.remove('hidden');
        DOM.duty?.classList.add('hidden');
        DOM.skew?.classList.add('hidden');
        DOM.time?.classList.add('hidden');
        //bias?.classList.add('hidden');
        if (currentEditedLine.audioData?.waveType == 'square') {
            DOM.duty?.classList.remove('hidden');
        }
        else if (currentEditedLine.audioData?.waveType == 'triangle') {
            DOM.skew?.classList.remove('hidden');
        }
    }
    else {
        DOM.freq?.classList.add('hidden');
        DOM.ampl?.classList.add('hidden');
        DOM.duty?.classList.add('hidden');
        DOM.skew?.classList.add('hidden');
        DOM.phase?.classList.add('hidden');
        //DOM.bias?.classList.add('hidden');
        DOM.time?.classList.remove('hidden');
    }
}
//# sourceMappingURL=calculator.js.map