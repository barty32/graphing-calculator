import Graph from './graph.js';
//import math from './mathjs';
//import Parser from './parser/index.js';
import { ExpressionParser } from './parser.js';
import { AudioManager, AudioSpec } from './audio.js';

enum LineType{
    expression,
    rawData,
    audio
}

const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

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
    'sin2(x)',//error
    //variable
    'x2+8',
    'xcos(4)',
    'xyz+8',
    'x-3',
    'x(5-6)',
    '5+(5-x)',
    //operator
    '3+sin(x)',
    '3++4',//error
    '3*(4+9*)',//error
    //lparen
    '3*(/5+2)',//error
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



class Line{
    color: string;
    name: string;
    id: number;
    type: LineType;
    parser: ExpressionParser;
    expression: string = '';
    data: number[] = [];
    audioData: AudioSpec | null = null;
    //playing = false;
    // audioCtx: AudioContext | null = null;
    // oscNode: OscillatorNode | null = null;
    // gainNode: GainNode | null = null;
    // audioBuffer: AudioBuffer | null = null;
    // bufferNode: AudioBufferSourceNode | null = null;

    constructor(type: LineType) {
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
            };
        }

        this.id = graph.addLine(() => {
            //initially show nothing
            return Infinity;
        }, this.name, type == LineType.rawData ? 2 : 0, this.color);

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
        return graphColors[Math.floor((Math.random() * 100) % graphColors.length)];//'#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    audioBtn: HTMLAnchorElement | undefined;

    createWaveBox() {
        const waveList = document.querySelector('#wave-boxes') as HTMLDivElement;
        const subContainer = document.createElement('div');
        subContainer.classList.add('sub-container', 'rounded', 'wave-box');
        //subContainer.id = this.id;
        const row1 = document.createElement('div');
        row1.classList.add('input-group');

        //add items to row 1

        const btn1 = document.createElement('a');
        btn1.type = 'button';
        btn1.classList.add('btn', 'btn-secondary', 'wave-btn');
        const eyeON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        const eyeOFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
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
        //palette
        //'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" style="vertical-align:top"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M512 255.1C512 256.9 511.1 257.8 511.1 258.7C511.6 295.2 478.4 319.1 441.9 319.1H344C317.5 319.1 296 341.5 296 368C296 371.4 296.4 374.7 297 377.9C299.2 388.1 303.5 397.1 307.9 407.8C313.9 421.6 320 435.3 320 449.8C320 481.7 298.4 510.5 266.6 511.8C263.1 511.9 259.5 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256V255.1zM96 255.1C78.33 255.1 64 270.3 64 287.1C64 305.7 78.33 319.1 96 319.1C113.7 319.1 128 305.7 128 287.1C128 270.3 113.7 255.1 96 255.1zM128 191.1C145.7 191.1 160 177.7 160 159.1C160 142.3 145.7 127.1 128 127.1C110.3 127.1 96 142.3 96 159.1C96 177.7 110.3 191.1 128 191.1zM256 63.1C238.3 63.1 224 78.33 224 95.1C224 113.7 238.3 127.1 256 127.1C273.7 127.1 288 113.7 288 95.1C288 78.33 273.7 63.1 256 63.1zM384 191.1C401.7 191.1 416 177.7 416 159.1C416 142.3 401.7 127.1 384 127.1C366.3 127.1 352 142.3 352 159.1C352 177.7 366.3 191.1 384 191.1z"/></svg>'
        colorBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox = "0 0 576 512" width = "24" height = "24" style = "vertical-align:top" > <!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 263.3C224.2 233.3 238.4 205.2 262.4 187.2L499.1 9.605C517.7-4.353 543.6-2.965 560.7 12.9C577.7 28.76 580.8 54.54 568.2 74.07L406.5 324.1C391.3 347.7 366.6 363.2 339.3 367.1L224 263.3zM320 400C320 461.9 269.9 512 208 512H64C46.33 512 32 497.7 32 480C32 462.3 46.33 448 64 448H68.81C86.44 448 98.4 429.1 96.59 411.6C96.2 407.8 96 403.9 96 400C96 339.6 143.9 290.3 203.7 288.1L319.8 392.5C319.9 394.1 320 397.5 320 400V400z"/></svg>'
        colorBtn.setAttribute('data-bs-toggle', 'dropdown');
        colorBtn.querySelector('svg')?.setAttribute('fill', this.color);
        colorBtn.ariaExpanded = 'false';
        colorBtn.addEventListener('click', (e) => {
            //change color

            //assing click handlers to color picker
            const btns = colorDropdown.querySelectorAll('.color-picker-button') as NodeListOf<HTMLDivElement>;
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
            audioMgr.addNode(this.id, () => {return 0});
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
            audioMgr.start();
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
                
                this.expression = (e.target as HTMLInputElement).value;
                try {
                    this.parser.tokenize(this.expression).parse().evaluate({ x: Infinity });
                    errorImg.style.display = 'none';
                }
                catch (e) {
                    errorImg.style.display = 'block';
                    const tText = row2.querySelector('.e-tooltip');
                    if (tText) tText.innerHTML = (e as Error).message;
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

                graph.getLine(this.id).fn = (x) => {
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
                    return this.parser.evaluate({ x: x });
                }
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
            fileInput.addEventListener('change', (e) => {
                if (!fileInput.files?.length) return;
                fileInput.files[0].text().then((jsonData) => {
                    const obj = JSON.parse(jsonData);
                    if (obj.format != "GraphingCore_v1.0") throw new Error("Unsupported JSON file format");
                    this.data = obj.data;
                    graph.getLine(this.id).xRes = obj.resolution;
                    graph.getLine(this.id).fn = (x) => {
                        return this.data[Math.round(x)];
                    }
                    graph.draw();
                })
            });
            row2.appendChild(fileInput);
            subContainer.appendChild(row2);
        }

        waveList.appendChild(subContainer);
    }



    edit() {
        currentEditedLine = this;
        const wavePanel = document.querySelector('#wave-panel') as HTMLDivElement;
        const audioPanel = document.querySelector('#audio-panel') as HTMLDivElement;
        audioPanel.style.display = 'block';
        setTimeout(() => {
            audioPanel.style.transform = 'translateX(0)';
            wavePanel.style.transform = 'translateX(-110%)';
        }, 20);
        setTimeout(() => { wavePanel.style.display = 'none'; }, 300);
        //audioPanel.style.display = 'block';
        //wavePanel.style.display = 'none';
        // audioPanel.classList.remove('translated');
        // wavePanel.classList.add('translated');

        if (this.audioData) {//currentLine.audio
            (document.querySelector(`#wave-select`) as HTMLInputElement).value = this.audioData.waveType;//currentLine.audio.waveType;
            for (const val in this.audioData) {
                if (val == 'waveType' || val == 'bias') continue;
                (document.querySelector(`#${val}-slider`) as HTMLInputElement).value = (this.audioData as any)[val];
                (document.querySelector(`#${val}-input`) as HTMLInputElement).value = (this.audioData as any)[val];
                //(document.querySelector(`#${val}-slider`) as HTMLInputElement).parentElement?.style.removeProperty('display');
            }
            /*
            const freq = document.querySelector(`#frequency-slider`)?.parentElement as HTMLDivElement;
            const ampl = document.querySelector(`#amplitude-slider`)?.parentElement as HTMLDivElement;
            const duty = document.querySelector(`#duty-slider`)?.parentElement as HTMLDivElement;
            const skew = document.querySelector(`#skew-slider`)?.parentElement as HTMLDivElement;
            const phase = document.querySelector(`#phase-slider`)?.parentElement as HTMLDivElement;
            //const bias = document.querySelector(`#bias-slider`)?.parentElement;
    
            if (currentLine.audio.waveType == 'sine') {
                duty.style.display = 'none';
                skew.style.display = 'none';
            }
            else if (currentLine.audio.waveType == 'square') {
                skew.style.display = 'none';
            }
            else if (currentLine.audio.waveType == 'triangle') {
                duty.style.display = 'none';
                ampl.style.display = 'none';
            }
            else {
                freq.style.display = 'none';
                ampl.style.display = 'none';
                duty.style.display = 'none';
                skew.style.display = 'none';
                phase.style.display = 'none';
            }
            */
        }
    }

    toggleAudio() {
        const boxBtn = this.audioBtn;
        const topBtn = document.querySelector('#btn-play') as HTMLAnchorElement | null;
        //play audio
        if (audioMgr.getNode(this.id).playing) {
            audioMgr.getNode(this.id).playing = false;
            if (boxBtn) boxBtn.innerHTML = play;
            if (topBtn) topBtn.innerHTML = play;
            audioMgr.start();
        }
        else {
            if (boxBtn) boxBtn.innerHTML = pause;
            if (topBtn) topBtn.innerHTML = pause;
            audioMgr.getNode(this.id).playing = true;
            audioMgr.start();
        }
    }

    audioDataChanged() {

        if (this.audioData) {
            const graphLine = graph.getLine(this.id);
            switch (this.audioData.waveType) {
                case 'sine':
                    graphLine.fn = (x) => {
                        if (this.audioData) {
                            if (x < 0) {
                                return Infinity;
                            }
                            return this.audioData.amplitude / 100 * Math.sin(this.audioData.frequency * x / 1000 * 2 * Math.PI - this.audioData.phase / 180 * Math.PI);
                        }
                        return Infinity;
                    }
                    break;
                case 'square':
                    graphLine.fn = (x) => {
                        if (this.audioData) {
                            if (x < 0) {
                                return Infinity;
                            }
                            return (this.audioData.amplitude / 100 * (Math.abs((this.audioData.frequency * x / 1000 - this.audioData.phase / 360) % 1) > (this.audioData.duty / 100) ? -1 : 1) * (x < 0 ? -1 : 1));
                        }
                        return Infinity;
                    }
                    break;
                case 'triangle':
                    graphLine.fn = (x) => {
                        if (this.audioData) {
                            //const ampl = line.audio.amplitude / 50;
                            const skew = this.audioData.skew / 100;
                            const period = 1 / this.audioData.frequency * 1000;
                            let negative = false;
                            if (x < 0) {
                                return Infinity;
                                //x = -x;
                                //negative = true;
                            }
                            x -= this.audioData.phase / 360;
                            x %= period;
                            const freq = this.audioData.frequency * x / 1000 * 2;
                            if (x % period <= skew * period) {
                                return mod((1 / (2 * skew)) * freq, 1) - 0.5;
                            }
                            return mod(-(1 / (2 * (1 - skew))) * (freq - 2 * skew), 1) - 0.5;
                            //return line.audio.amplitude / 100 * Math.min((((line.audio.frequency * x * 2 / 1000 - line.audio.phase / 360*2) % 2) + 2) % 2, Math.abs(((-(line.audio.frequency * x * 2 / 1000 - line.audio.phase / 360*2) % 2) + 2) % 2)) - 1;
                        }
                        return Infinity;
                    }
                    break;
                case 'custom':
                    break;
            }
            // if (line.oscNode){
            //     line.oscNode.frequency.value = line.audio.frequency;
            // }
            //if (line.gainNode) {
                //line.gainNode.gain.value = line.audio.amplitude / 100;
            //}
            //line.generateAudio();
            audioMgr.getNode(this.id).fn = graphLine.fn;
            audioMgr.start();
            graph.draw();
        }
    }
}

const audioMgr = new AudioManager();
var lines: { [index: number]: Line | undefined } = {};
var idCounter = -1;
var currentEditedLine: Line;

const graph = new Graph(document.querySelector('#graph') as HTMLCanvasElement);
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
    const content = document.querySelector('#content') as HTMLDivElement;
    let width = parseInt(content.style.gridTemplateColumns.replace('auto ', ''));//window.getComputedStyle(content, null).getPropertyValue('grid-template-columns')
    const prevWidth = width;
    const intID = setInterval(() => {
        width -= 10;
        if (width <= 0) {
            clearInterval(intID);
            //save current width to attribute
            content.setAttribute('panel-hidden', prevWidth.toString());
            graph.fixSize();
            return;
        }
        content.style.gridTemplateColumns = `auto ${width}px`;
        //graph.fixSize();
    }, 5);
});

document.querySelector('#show-btn')?.addEventListener('click', () => {
    const content = document.querySelector('#content') as HTMLDivElement;
    let width = 0;
    let attr = content.getAttribute('panel-hidden') ?? '350';
    if (attr == '') attr = '350';
    if (window.matchMedia('(max-width: 768px)').matches) {
        attr = screen.width.toString();
    }
    const maxWidth = parseInt(attr)//parseInt(content.style.gridTemplateColumns.replace('auto ', ''));
    content.removeAttribute('panel-hidden');
    const intID = setInterval(() => {
        width += 10;
        if (width >= maxWidth) {
            clearInterval(intID);
            content.style.gridTemplateColumns = `auto ${maxWidth}px`;
            graph.fixSize();
            return;
        }
        //console.log(width);
        content.style.gridTemplateColumns = `auto ${width}px`;
        //graph.fixSize();
    }, 5);
});

document.addEventListener("DOMContentLoaded", function () {
    //open panel by default on PC
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (mediaQuery.matches) {
        document.querySelector('#content')?.removeAttribute('panel-hidden');
        graph.fixSize();
        graph.resetZoom();
    }
});


document.querySelector('#audio-back')?.addEventListener('click', () => {
    const wavePanel = document.querySelector('#wave-panel') as HTMLDivElement;
    const audioPanel = document.querySelector('#audio-panel') as HTMLDivElement;
    wavePanel.style.display = 'flex';
    setTimeout(() => {
        wavePanel.style.transform = 'translateX(0)';
        audioPanel.style.transform = 'translateX(110%)';
    }, 20);
    setTimeout(() => { audioPanel.style.display = 'none'; }, 300);
});


document.querySelector('#wave-select')?.addEventListener('change', (e) => {
    if (currentEditedLine.audioData) {
        currentEditedLine.audioData.waveType = (e.target as HTMLSelectElement).value;
        (document.querySelector(`#expr-input-${currentEditedLine.id}`) as HTMLInputElement).disabled = currentEditedLine.audioData.waveType == 'custom' ? false : true;
    }
    currentEditedLine.audioDataChanged();
});

document.querySelector('#btn-play')?.addEventListener('click', (e) => {
    currentEditedLine.toggleAudio();
});

document.querySelector('#options-grid')?.addEventListener('change', (e) => {
    if (e.target) {
        graph.options.grid = (e.target as HTMLInputElement).checked;
        graph.draw();
    }
});

document.querySelector('#options-minor-grid')?.addEventListener('change', (e) => {
    if (e.target) {
        graph.options.minorGrid = (e.target as HTMLInputElement).checked;
        graph.draw();
    }
});

document.querySelector('#options-axis-numbers')?.addEventListener('change', (e) => {
    if (e.target) {
        graph.options.axisNumbers = (e.target as HTMLInputElement).checked;
        graph.draw();
    }
});


addSliderSyncGroup('frequency', 0, 22000, (val) => {
    if(currentEditedLine.audioData) currentEditedLine.audioData.frequency = val;
    currentEditedLine.audioDataChanged();
}, true);
addSliderSyncGroup('duty', 0, 100, (val) => {
    if(currentEditedLine.audioData) currentEditedLine.audioData.duty = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('amplitude', 0, 100, (val) => {
    if(currentEditedLine.audioData) currentEditedLine.audioData.amplitude = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('skew', 0, 100, (val) => {
    if(currentEditedLine.audioData) currentEditedLine.audioData.skew = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('phase', 0, 360, (val) => {
    if(currentEditedLine.audioData) currentEditedLine.audioData.phase = val;
    currentEditedLine.audioDataChanged();
});

function mod(x: number, m: number) {
    return ((x % m) + m) % m;
}

function addSliderSyncGroup(idPrefix: string, min: number, max: number, callback: (value: number, e: InputEvent) => void, logarithmic = false) {
    const slider = document.querySelector(`#${idPrefix}-slider`) as HTMLInputElement;
    const input = document.querySelector(`#${idPrefix}-input`) as HTMLInputElement;
    slider.addEventListener('input', (e) => {
        const sliderVal = parseInt(slider.value);
        console.log(sliderVal);
        const result = /*logarithmic ? Math.round(-Math.log(1.1 - (sliderVal / max))*max) :*/ sliderVal;//  Math.pow((sliderVal / max), 5) * max
        input.value = result.toString();
        callback(result, e as InputEvent);
    });
    input.addEventListener('input', (e) => {
        let val = parseInt(input.value);
        if (isNaN(val)) return;
        if (val < min) val = min;
        if (val > max) val = max;
        slider.value = val.toString();
        input.value = val.toString();
        callback(val, e as InputEvent);
    });
}


// function getLine(id: string) {
//     const line = lines.find((line) => {
//         if (line.id == id) return true;
//     });
//     if (!line) throw new Error('Line with this ID does not exist');
//     return line;
// }


// function playAudio(pfn: (x: number) => number) {
//     const audioCtx = new AudioContext();//|| window.webkitAudioContext
//     //console.log(audioCtx.sampleRate);
//     const myArrayBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);

//     let nowBuffering = myArrayBuffer.getChannelData(0);
//     for (var i = 0; i < myArrayBuffer.length; i++) {
//         nowBuffering[i] = pfn(i / audioCtx.sampleRate);//Math.sin(i * 2 * Math.PI / audioCtx.sampleRate * 1000);//Math.random() * 2 - 1;
//     }

//     //currentLine.playing = true;

//     const source = audioCtx.createOscillator();

//     // const source = audioCtx.createBufferSource();
//     // source.buffer = myArrayBuffer;
//     source.connect(audioCtx.destination);
//     // source.loop = true;
//     //source.start()
//     return source;
// }

//play audio
// if (audioMgr.getNode(this.id).playing) {
//     audioMgr.getNode(this.id).playing = false;
//     //this.audioCtx?.suspend();
//     btn2.innerHTML = play;//'<img src="/assets/images/play.svg">';
//     audioMgr.start();
//     //console.log('Audio stopped');
// }
// else {
//     btn2.innerHTML = pause;//'<img src="/assets/images/pause.svg">';
//     //this.generateAudio();
//     //if (!oscStarted) {
//     //this.oscNode?.start();
//     //this.bufferNode?.start();
//     //oscStarted = true;
//     //}
//     audioMgr.getNode(this.id).playing = true;
//     //mgr.prepareAllNodes();
//     audioMgr.start();
//     //this.audioCtx?.resume();
//     //console.log('Audio started');
// }


// function test() {

//     const fn = (x: number) => {
//         //return Math.sin(x);
//         return (Math.abs(parseInt((x).toFixed(0)))) % 2 - 1 / 2;
//         //return 0.5 * (Math.sin(200 * x) + Math.sin(400 * x) + Math.sin(800 * x));
//         //return 100 * Math.cos(x * 2 * Math.PI);
//     }
//     const fn2 = (x: number) => {
//         return 1 / x;
//     }
//     const fn3 = (x: number) => {
//         return Math.sin(x);
//     }
//     graph.addLine(fn, "red");
//     graph.addLine(fn2, "#2222FF");
//     graph.addLine(fn3, "#00FF00");
//     graph.draw();
//     //play(fn);
// }

//lines.push(new Line(LineType.expression));
//lines.push(new Line(LineType.audio));
//lines.push(new Line(LineType.rawData));

    // waveList.innerHTML = waveList.innerHTML + `
    //     <div class="sub-container rounded wave-box" id="${id}">
    //         <div class="input-group">
    //             <a type="button" class="btn btn-secondary wave-btn">
    //                 <img src="/assets/images/about.svg">
    //             </a>
    //             <input type="text" class="form-control" value="${id}">
    //             <a type="button" class="btn btn-success wave-btn">
    //                 <img src="/assets/images/play.svg">
    //             </a>
    //             <a type="button" class="btn btn-secondary wave-btn">
    //                 <img src="/assets/images/settings.svg">
    //             </a>
    //             <a type="button" class="btn btn-danger wave-btn">
    //                 <img src="/assets/images/trash.svg">
    //             </a>
    //         </div>
    //         <div class="input-group mt-2">
    //             <span class="input-group-text input-label-box">f(x):</span>
    //             <input type="text" class="form-control">
    //         </div>
    //     </div>
    // `;


// getUniqueId() {
//     let i = lines.length;
//     let id: string;
//     do {
//         if (this.type == LineType.audio) {
//             id = 'audioLine' + i;
//         }
//         else if (this.type == LineType.rawData) {
//             id = 'dataLine' + i;
//         }
//         else {
//             id = 'line' + i;
//         }
//         i++;
//     }
//     while (lines.find((line) => {
//         if (line.id == id) return true;
//     }));
//     return id;
// }

    // initAudioSystem() {
    //     this.audio = {
    //         //custom: false,
    //         waveType: 'sine',
    //         frequency: 440,
    //         amplitude: 50,
    //         duty: 50,
    //         skew: 50,
    //         phase: 0,
    //         bias: 0,
    //     };
    //     this.audioCtx = new AudioContext();
    //     this.oscNode = this.audioCtx.createOscillator();
    //     this.gainNode = this.audioCtx.createGain();
    //     //this.bufferNode = this.audioCtx.createBufferSource();
    //     this.audioBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate, this.audioCtx.sampleRate);
    //     this.gainNode.gain.value = 0.5;
    //     //this.oscNode.connect(this.gainNode);
    //     //this.bufferNode.connect(this.gainNode);
    //     this.gainNode.connect(this.audioCtx.destination);
    // }

    // generateAudio() {
    //     if (!this.audioCtx || !this.audioBuffer) {
    //         console.warn('Audio context or audio buffer is null');
    //         return;
    //     }
    //     const line = graph.getLine(this.id);

    //     let nowBuffering = this.audioBuffer.getChannelData(0);
    //     for (var i = 0; i < this.audioBuffer.length; i++) {
    //         nowBuffering[i] = line.fn(i * 1000 / this.audioCtx.sampleRate);//Math.sin(i * 2 * Math.PI / this.audioCtx.sampleRate * 1000);
    //     }
    //     const oldBuffer = this.bufferNode;
    //     this.bufferNode = new AudioBufferSourceNode(this.audioCtx);
    //     this.bufferNode.buffer = this.audioBuffer;
    //     this.bufferNode.connect(this.audioCtx.destination);
    //     this.bufferNode.loop = true;
    //     if (this.playing) {
    //         this.bufferNode.start();
    //         oldBuffer?.stop();
    //     }
    // }


    //bind this in functions
        //this.getUniqueId        = this.getUniqueId.bind(this);
        //this.initAudioSystem    = this.initAudioSystem.bind(this);
        //this.generateAudio      = this.generateAudio.bind(this);
        //this.onChangeVisibility = this.onChangeVisibility.bind(this);
        //this.createWaveBox      = this.createWaveBox.bind(this);

// lines.find((value, index) => {
    //     if (value.id == this.id) {
    //         lines.splice(index, 1);
    //         graph.removeLine(this.id);
    //         graph.draw();
    //         return true;
    //     }
    //     return false;
    // });
