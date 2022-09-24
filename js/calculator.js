import { Graph } from './graph.js';
//import math from './mathjs';
//import Parser from './parser/index.js';
import { ExpressionParser } from './parser.js';
import { AudioManager } from './audio.js';
import DataConverter from './converter.js';
import { sine, square, triangle } from './audio.js';
var LineType;
(function (LineType) {
    LineType[LineType["expression"] = 0] = "expression";
    LineType[LineType["rawData"] = 1] = "rawData";
    LineType[LineType["audio"] = 2] = "audio";
})(LineType || (LineType = {}));
const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
const eyeON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const eyeOFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
const brush = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24" style="vertical-align:top"> <!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 263.3C224.2 233.3 238.4 205.2 262.4 187.2L499.1 9.605C517.7-4.353 543.6-2.965 560.7 12.9C577.7 28.76 580.8 54.54 568.2 74.07L406.5 324.1C391.3 347.7 366.6 363.2 339.3 367.1L224 263.3zM320 400C320 461.9 269.9 512 208 512H64C46.33 512 32 497.7 32 480C32 462.3 46.33 448 64 448H68.81C86.44 448 98.4 429.1 96.59 411.6C96.2 407.8 96 403.9 96 400C96 339.6 143.9 290.3 203.7 288.1L319.8 392.5C319.9 394.1 320 397.5 320 400V400z"/></svg>';
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
    data = [];
    audioData = null;
    playing = false;
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
        const waveList = document.querySelector('#wave-boxes');
        const subContainer = document.createElement('div');
        subContainer.classList.add('sub-container', 'rounded', 'wave-box');
        //subContainer.id = this.id;
        const row1 = document.createElement('div');
        row1.classList.add('input-group');
        //add items to row 1
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
        row1.appendChild(btn1);
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
        row1.appendChild(colorBtn);
        row1.appendChild(colorDropdown);
        //id input
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.classList.add('form-control');
        idInput.value = this.name;
        idInput.addEventListener('input', (e) => {
            //change name
            graph.getLine(this.id).name = idInput.value;
            //graph.draw();
        });
        row1.appendChild(idInput);
        if (this.type == LineType.audio) {
            const btn2 = document.createElement('a');
            btn2.type = 'button';
            btn2.classList.add('btn', 'btn-success', 'wave-btn');
            btn2.innerHTML = play;
            //audioMgr.addNode(this.id, () => 0);
            btn2.addEventListener('click', (e) => {
                this.toggleAudio();
            });
            this.audioBtn = btn2;
            row1.appendChild(btn2);
            const btn3 = document.createElement('a');
            btn3.type = 'button';
            btn3.classList.add('btn', 'btn-secondary', 'wave-btn');
            btn3.innerHTML = '<img src="/assets/images/settings.svg">';
            btn3.addEventListener('click', (e) => {
                this.edit();
            });
            row1.appendChild(btn3);
        }
        const btn4 = document.createElement('a');
        btn4.type = 'button';
        btn4.classList.add('btn', 'btn-danger', 'wave-btn');
        btn4.innerHTML = '<img src="/assets/images/trash.svg">';
        btn4.addEventListener('click', (e) => {
            //remove
            subContainer.remove();
            graph.removeLine(this.id);
            graph.draw();
            audioMgr.removeNode(this.id);
            //remove itself from lines
            lines[this.id] = undefined;
        });
        row1.appendChild(btn4);
        subContainer.appendChild(row1);
        if (this.type == LineType.expression || this.type == LineType.audio) {
            const row2 = document.createElement('div');
            row2.classList.add('input-group', 'mt-2');
            row2.innerHTML = `<span class="input-group-text input-label-box">f(x):</span>`;
            const errorImg = document.createElement('img');
            errorImg.src = '/assets/images/error.svg';
            errorImg.classList.add('error-img');
            row2.appendChild(errorImg);
            const tooltip = document.createElement('span');
            tooltip.classList.add('e-tooltip', 'rounded');
            row2.appendChild(tooltip);
            const fnInput = document.createElement('input');
            fnInput.type = 'text';
            fnInput.id = `expr-input-${this.id}`;
            fnInput.classList.add('form-control');
            fnInput.addEventListener('input', (e) => {
                this.expression = fnInput.value;
                try {
                    this.parser.tokenize(this.expression).parse().evaluate({ x: Infinity });
                    errorImg.style.display = 'none';
                }
                catch (e) {
                    errorImg.style.display = 'block';
                    const tText = row2.querySelector('.e-tooltip');
                    if (tText)
                        tText.innerHTML = e.message;
                    return;
                }
                //TODO: use better math parser
                // try {
                //     graph.getLine(id).fn = new Function('x', `return ${(e.target as HTMLInputElement).value}`)
                // }
                // catch (e) {
                //     errorImg.style.display = 'block';
                //     const tText = row2.querySelector('.e-tooltip');
                //     if (tText) tText.innerHTML = e.message;
                // }
                //     (x) => {
                //     return eval((e.target as HTMLInputElement).value);
                // }
                //square
                //sin(x)+1/3sin(3x)+1/5sin(5x)+1/7sin(7x)+1/9sin(9x)+1/11sin(11x)+1/13sin(13x)+1/15sin(15x)+1/17sin(17x)+1/19sin(19x)+1/21sin(21x)
                graph.attachFn(this.id, (x) => {
                    // let result = Infinity;
                    // try {
                    //     result = Parser.evaluate({ x: x });
                    //     errorImg.style.display = 'none';
                    // }
                    // catch (e) {
                    //     errorImg.style.display = 'block';
                    //     const tText = row2.querySelector('.e-tooltip');
                    //     if (tText) tText.innerHTML = (e as Error).message;
                    // }
                    // return result;
                    this.parser.evaluate({ x: x });
                    if (this.parser.result === null) {
                        return undefined;
                    }
                    return this.parser.result;
                });
                graph.draw();
                // graph.getLine(this.id).fn = (x) => {
                //     let result = Infinity;
                //     try {
                //         result = Parser.evaluate(this.expression, { x: x }, { useRadians: true });
                //         errorImg.style.display = 'none';
                //     }
                //     catch (e) {
                //         errorImg.style.display = 'block';
                //         const tText = row2.querySelector('.e-tooltip');
                //         if (tText) tText.innerHTML = (e as Error).message;
                //     }
                //     return result;
                // }
                // graph.draw();
                if (this.type == LineType.audio && this.audioData?.waveType == 'custom') {
                    this.audioDataChanged();
                }
            });
            if (this.type == LineType.audio) {
                fnInput.disabled = true;
                currentEditedLine = this;
                this.audioDataChanged();
            }
            row2.appendChild(fnInput);
            subContainer.appendChild(row2);
        }
        else if (this.type == LineType.rawData) {
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
                    console.log('attached array');
                });
            });
            row2.appendChild(fileInput);
            subContainer.appendChild(row2);
        }
        waveList.appendChild(subContainer);
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
                    });
                    break;
                case 'square':
                    graph.attachFn(this.id, (x) => {
                        if (this.audioData) {
                            return square(x, this.audioData.frequency, this.audioData.amplitude, this.audioData.duty, this.audioData.phase, 0);
                        }
                        return undefined;
                    });
                    break;
                case 'triangle':
                    graph.attachFn(this.id, (x) => {
                        if (this.audioData) {
                            return triangle(x, this.audioData.frequency, this.audioData.amplitude, this.audioData.skew, this.audioData.phase, 0);
                        }
                        return undefined;
                    });
                    break;
                case 'custom':
                    if (this.playing)
                        this.toggleAudio();
                    fn = (x) => {
                        this.parser.evaluate({ x: x });
                        if (this.parser.result === null) {
                            return 0;
                        }
                        return this.parser.result;
                    };
                    break;
                default:
                    graph.attachFn(this.id, () => undefined);
            }
            audioMgr.addNode(this.id, this.audioData, fn);
            if (this.playing)
                audioMgr.startNode(this.id);
            graph.draw();
        }
    }
}
const audioMgr = new AudioManager();
var lines = {};
var idCounter = -1;
var currentEditedLine;
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
document.querySelector('#hide-btn')?.addEventListener('click', () => {
    let width = parseInt(DOM.content.style.gridTemplateColumns.replace('auto ', '')); //window.getComputedStyle(content, null).getPropertyValue('grid-template-columns')
    const prevWidth = width;
    const intID = setInterval(() => {
        width -= 10;
        if (width <= 0) {
            clearInterval(intID);
            //save current width to attribute
            DOM.content.setAttribute('panel-hidden', prevWidth.toString());
            graph.fixSize();
            return;
        }
        DOM.content.style.gridTemplateColumns = `auto ${width}px`;
        //graph.fixSize();
    }, 5);
});
document.querySelector('#show-btn')?.addEventListener('click', () => {
    let width = 0;
    let attr = DOM.content.getAttribute('panel-hidden') ?? '350';
    if (attr == '')
        attr = '350';
    if (window.matchMedia('(max-width: 768px)').matches) {
        attr = screen.width.toString();
    }
    const maxWidth = parseInt(attr); //parseInt(content.style.gridTemplateColumns.replace('auto ', ''));
    DOM.content.removeAttribute('panel-hidden');
    const intID = setInterval(() => {
        width += 10;
        if (width >= maxWidth) {
            clearInterval(intID);
            DOM.content.style.gridTemplateColumns = `auto ${maxWidth}px`;
            graph.fixSize();
            return;
        }
        //console.log(width);
        DOM.content.style.gridTemplateColumns = `auto ${width}px`;
        //graph.fixSize();
    }, 5);
});
document.addEventListener("DOMContentLoaded", function () {
    //open panel by default on PC
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (mediaQuery.matches) {
        DOM.content.removeAttribute('panel-hidden');
        graph.fixSize();
        graph.resetZoom();
    }
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
                graph.attachFn(currentEditedLine.id, x => undefined);
        }
        else {
            input.disabled = true;
        }
    }
    currentEditedLine.audioDataChanged();
    updateBoxVisibility();
});
DOM.btnPlay?.addEventListener('click', (e) => {
    currentEditedLine.toggleAudio();
});
DOM.optionsGrid?.addEventListener('change', (e) => {
    graph.options.grid = DOM.optionsGrid.checked;
    graph.draw();
});
DOM.optionsMinorGrid?.addEventListener('change', (e) => {
    graph.options.minorGrid = DOM.optionsMinorGrid.checked;
    graph.draw();
});
DOM.optionsAxisNumbers?.addEventListener('change', (e) => {
    graph.options.axisNumbers = DOM.optionsAxisNumbers.checked;
    graph.draw();
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