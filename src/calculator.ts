import { Graph } from './graph.js';
import { ExpressionParser, ExpressionType, ParserFatalError, Severity, Variables, Functions, TokenType } from './parser.js';
import { AudioManager, AudioSpec } from './audio.js';
import DataConverter from './converter.js';
import { IWorkerCalculateData, IWorkerUpdateFunctions, IWorkerReceiveData } from './worker.js';
import { MathfieldElement } from '../mathlive/dist/mathlive';
//import type { MathfieldElement } from 'mathlive/dist/types/mathlive/mathlive';

enum LineType{
    expression,
    rawData,
    audio,
    variable,
    function
}

//const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
//const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" fill="white"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" fill="white"><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>';
const eyeON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const eyeOFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
const speaker = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
const brush = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24" style="vertical-align:top"><path d="M224 263.3C224.2 233.3 238.4 205.2 262.4 187.2L499.1 9.605C517.7-4.353 543.6-2.965 560.7 12.9C577.7 28.76 580.8 54.54 568.2 74.07L406.5 324.1C391.3 347.7 366.6 363.2 339.3 367.1L224 263.3zM320 400C320 461.9 269.9 512 208 512H64C46.33 512 32 497.7 32 480C32 462.3 46.33 448 64 448H68.81C86.44 448 98.4 429.1 96.59 411.6C96.2 407.8 96 403.9 96 400C96 339.6 143.9 290.3 203.7 288.1L319.8 392.5C319.9 394.1 320 397.5 320 400V400z"/></svg>';
//const palette = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" style="vertical-align:top"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M512 255.1C512 256.9 511.1 257.8 511.1 258.7C511.6 295.2 478.4 319.1 441.9 319.1H344C317.5 319.1 296 341.5 296 368C296 371.4 296.4 374.7 297 377.9C299.2 388.1 303.5 397.1 307.9 407.8C313.9 421.6 320 435.3 320 449.8C320 481.7 298.4 510.5 266.6 511.8C263.1 511.9 259.5 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256V255.1zM96 255.1C78.33 255.1 64 270.3 64 287.1C64 305.7 78.33 319.1 96 319.1C113.7 319.1 128 305.7 128 287.1C128 270.3 113.7 255.1 96 255.1zM128 191.1C145.7 191.1 160 177.7 160 159.1C160 142.3 145.7 127.1 128 127.1C110.3 127.1 96 142.3 96 159.1C96 177.7 110.3 191.1 128 191.1zM256 63.1C238.3 63.1 224 78.33 224 95.1C224 113.7 238.3 127.1 256 127.1C273.7 127.1 288 113.7 288 95.1C288 78.33 273.7 63.1 256 63.1zM384 191.1C401.7 191.1 416 177.7 416 159.1C416 142.3 401.7 127.1 384 127.1C366.3 127.1 352 142.3 352 159.1C352 177.7 366.3 191.1 384 191.1z"/></svg>'
const download = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 2 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

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

const DOM = {
    freq: document.querySelector('#sub-frequency') as HTMLDivElement,
    ampl: document.querySelector('#sub-amplitude') as HTMLDivElement,
    duty: document.querySelector('#sub-duty') as HTMLDivElement,
    skew: document.querySelector('#sub-skew') as HTMLDivElement,
    phase: document.querySelector('#sub-phase') as HTMLDivElement,
    //bias: document.querySelector('#sub-bias'),

    waveList: document.querySelector('#wave-boxes') as HTMLDivElement,
    waveSelect: document.querySelector('#wave-select') as HTMLSelectElement,
    btnPlay: document.querySelector('#btn-play') as HTMLAnchorElement | null,

    optionsGrid: document.querySelector('#options-grid') as HTMLInputElement,
    optionsMinorGrid: document.querySelector('#options-minor-grid') as HTMLInputElement,
    optionsAxisNumbers: document.querySelector('#options-axis-number') as HTMLInputElement,
    optionsDegrees: document.querySelector('#options-degrees') as HTMLInputElement,
    optionsRadians: document.querySelector('#options-radians') as HTMLInputElement,

    content: document.querySelector('#content') as HTMLDivElement,

    wavePanel: document.querySelector('#wave-panel') as HTMLDivElement,
    audioPanel: document.querySelector('#audio-panel') as HTMLDivElement
}



class Line{
    color: string;
    name: string;
    id: number;
    type: LineType;
    parser: ExpressionParser;
    //expression: string = '';
    //variables: { [key: string]: number } = {};
    //data: number[] = [];
    worker?: Worker;
    calculating: boolean = false;
    audioData: AudioSpec;
    playing = false;
    isSimpleVariable = false;
    variableName = '';

    DOM = {
        subContainer: undefined as (HTMLDivElement | undefined),
        playbackOptions: undefined as (HTMLDivElement | undefined),
        audioBtn: undefined as (HTMLAnchorElement | undefined),
        fnType: undefined as (HTMLSpanElement | undefined),
        sliderGroup: undefined as (HTMLDivElement | undefined),
        sliderSetup: undefined as (HTMLDivElement | undefined),
        slider: undefined as (HTMLInputElement | undefined)
    }

    constructor(type: LineType) {
        this.type = type;
        this.name = this.generateName();
        this.color = this.generateColor();
        this.parser = new ExpressionParser();
        if (type == LineType.function) {
            this.parser.rules.isCustomFunction = true;
        }
        else if (type == LineType.variable) {
            this.parser.rules.isCustomVariable = true;
        }
        this.parser.variables = variables;
        this.parser.functions = functions;

        this.audioData = {
            waveType: type == LineType.audio ? 'sine' : type == LineType.rawData ? 'file' : 'custom',
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

        this.id = graph.addLine(this.name, this.color);
        this.createWaveBox();

        if (this.type == LineType.expression || this.type == LineType.audio) {

            //init worker
            this.worker = new Worker(window.location.pathname + 'js/worker.js', { type: "module" });
            this.worker.onmessage = (e) => {
                //console.log('received data from ' + this.name);
                const recvline = e.data as IWorkerReceiveData;
                if (recvline.finished) {
                    this.calculating = false;
                }
                graph.getLine(this.id).points = recvline.points;
                graph.draw();
            }

            this.worker.onerror = (error) => {
                console.error(`Worker error: ${error.message}`);
            };

            this.updateWorkerFunctions();
            // line.expression = expression;
            // line.variables = variables;

            // this.calculate(2);

            // const data: IWorkerSendData = {
            //     expression,
            //     width: this.width,
            //     height: this.height,
            //     xOffset: this.xOffset,
            //     yOffset: this.yOffset,
            //     xScale: this.xScale,
            //     yScale: this.yScale,
            //     ID: id,
            //     variables
            // }
            // worker.postMessage(data);
        }
        if (this.type == LineType.audio) {
            this.audioDataChanged();
        }
    }

    generateName() {
        if (this.type == LineType.rawData) {
            return 'File ' + idCounter;
        }
        else if (this.type == LineType.audio) {
            return 'Audio ' + idCounter;
        }
        return 'Line ' + idCounter;
    }

    generateColor() {
        return graphColors[Math.floor((Math.random() * 100) % graphColors.length)];//'#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    createWaveBox() {
        this.DOM.subContainer = document.createElement('div');
        this.DOM.subContainer.classList.add('sub-container', 'rounded', 'wave-box');

        // Row 1
        const row1 = document.createElement('div');
        row1.classList.add('input-group');

        if (this.type == LineType.variable || this.type == LineType.function) {
            this.addMathInput(row1);
        }
        else if (this.type == LineType.audio) {
            this.addVisibilityBtn(row1);
            this.addColorDropdown(row1);
            this.addIdInput(row1);
            this.addPlayBtn(row1);
            this.addSettingsBtn(row1);
        }
        else {
            this.addVisibilityBtn(row1);
            this.addColorDropdown(row1);
            this.addIdInput(row1);
            this.addPlaybackSwitch(row1);
        }
        this.addRemoveBtn(row1);
        this.DOM.subContainer.appendChild(row1);

        if (this.type != LineType.audio && this.type != LineType.function) {

            // Row 2
            const row2 = document.createElement('div');
            row2.classList.add('input-group', 'mt-2');

            if (this.type == LineType.expression) {
                this.DOM.fnType = document.createElement('span');
                this.DOM.fnType.classList.add('input-group-text', 'input-label-box', 'user-select-none');
                this.DOM.fnType.innerHTML = 'f(x):';
                row2.appendChild(this.DOM.fnType);
                //this.addExpressionType();
                this.addMathInput(row2);
            }
            else if (this.type == LineType.variable) {
                this.addVariableSlider(this.DOM.subContainer);
            }
            else if (this.type == LineType.rawData) {
                this.addFileInput(this.DOM.subContainer);
            }
            this.DOM.subContainer.appendChild(row2);
        }
        if (this.type == LineType.expression || this.type == LineType.rawData) {
            this.addPlaybackOptions(this.DOM.subContainer);
        }

        DOM.waveList.appendChild(this.DOM.subContainer);
    }

    addVisibilityBtn(parent: HTMLElement) {
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

    addColorDropdown(parent: HTMLElement) {
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
        parent.appendChild(colorBtn);
        parent.appendChild(colorDropdown);
    }

    addIdInput(parent: HTMLElement) {
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

    // addVariableInput(parent: HTMLElement) {
    //     const varInput = document.createElement('select');
    //     varInput.classList.add('form-select');
    //     varInput.style.maxWidth = '70px';

    //     const letters = ['a', 'b', 'c', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'z'];
    //     for (const letter of letters){
    //         if (variables[letter] === undefined) {
    //             const opt = document.createElement('option');
    //             opt.innerText = letter;
    //             opt.value = letter;
    //             varInput.options.add(opt);
    //         }
    //     }
    //     const eq = document.createElement('span');
    //     eq.classList.add('input-group-text', 'input-label-box');
    //     eq.innerHTML = '=';

    //     const numInput = document.createElement('input');
    //     numInput.type = 'number';
    //     numInput.classList.add('form-control');
    //     parent.appendChild(varInput);
    //     parent.appendChild(eq);
    //     parent.appendChild(numInput);
    // }

    addVariableSlider(parent: HTMLElement) {
        this.DOM.sliderGroup = document.createElement('div');
        this.DOM.sliderSetup = document.createElement('div');
        this.DOM.slider = document.createElement('input');

        //this.DOM.sliderGroup.classList.add('d-flex', 'flex-column');
        this.DOM.sliderGroup.setAttribute('hidden', '');
        this.DOM.sliderGroup.style.display = 'flex';
        this.DOM.sliderGroup.style.flexDirection = 'column';

        this.DOM.sliderSetup.classList.add('slider-config');
        this.DOM.sliderSetup.innerHTML = `
            <div class="slider-sub">
                <span class="me-1 user-select-none">Min:</span>
                <input type="text" inp-min class="small-input" value="0">
            </div>
            <div class="slider-sub">
                <span class="me-1 user-select-none">Max:</span>
                <input type="text" inp-max class="small-input" value="10">
            </div>
            <div class="slider-sub">
                <span class="me-1 user-select-none">Step:</span>
                <input type="text" inp-step class="small-input" value="1">
            </div>
        `;//<span role="textbox" contenteditable class="small-input" value="440">440</span>

        this.DOM.slider.type = 'range';
        this.DOM.slider.min = '0';
        this.DOM.slider.max = '10';
        this.DOM.slider.classList.add('form-range', 'input-slider', 'mt-2');

        this.DOM.sliderSetup.querySelector('input[inp-min]')?.addEventListener('input', (e) => {
            this.DOM.slider!.min = (e.target as HTMLInputElement).value;
        });

        this.DOM.sliderSetup.querySelector('input[inp-max]')?.addEventListener('input', (e) => {
            this.DOM.slider!.max = (e.target as HTMLInputElement).value;
        });

        this.DOM.sliderSetup.querySelector('input[inp-step]')?.addEventListener('input', (e) => {
            this.DOM.slider!.step = (e.target as HTMLInputElement).value;
        });

        this.DOM.slider.addEventListener('input', () => {
            (this.DOM.subContainer?.querySelector('math-field') as MathfieldElement).setValue(this.variableName + '=' + this.DOM.slider?.value, {suppressChangeNotifications: false});
        });


        this.DOM.sliderGroup.appendChild(this.DOM.slider);
        this.DOM.sliderGroup.appendChild(this.DOM.sliderSetup);
        parent.appendChild(this.DOM.sliderGroup);


    }

    addPlayBtn(parent: HTMLElement) {
        const btn2 = document.createElement('a');
        btn2.type = 'button';
        btn2.classList.add('btn', 'btn-success', 'wave-btn');
        btn2.innerHTML = play;
        btn2.addEventListener('click', () => this.toggleAudio());
        this.DOM.audioBtn = btn2;
        parent.appendChild(btn2);
    }

    addPlaybackSwitch(parent: HTMLElement) {
        const btn1 = document.createElement('a');
        btn1.type = 'button';
        btn1.classList.add('btn', 'btn-secondary', 'wave-btn');
        btn1.innerHTML = speaker;
        btn1.addEventListener('click', () => {
            //toggle playback visibility
            this.DOM.playbackOptions?.toggleAttribute('hidden');
        });
        parent.appendChild(btn1);
    }

    addSettingsBtn(parent: HTMLElement) {
        const btn3 = document.createElement('a');
        btn3.type = 'button';
        btn3.classList.add('btn', 'btn-secondary', 'wave-btn');
        btn3.innerHTML = '<img src="/assets/images/settings.svg">';
        btn3.addEventListener('click', () => this.edit());
        parent.appendChild(btn3);
    }

    addRemoveBtn(parent: HTMLElement) {
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
            delete lines[this.id];
        });
        parent.appendChild(btn4);
    }

    addPlaybackOptions(parent: HTMLElement) {
        this.DOM.playbackOptions = document.createElement('div');
        this.DOM.playbackOptions.setAttribute('hidden', '');
        this.DOM.playbackOptions.innerHTML = `
        <div class="sub-container rounded" style="background-color: #111">
            <div class="d-flex">
                <h6>Playback:</h6>
                <a href="#" id="download-${this.id}" class="btn btn-info ms-auto" style="width: 30px; height: 25px; padding: 0">${download}</a>
            </div>
            <div class="input-group mt-1">
                <span class="input-group-text input-label-box">Start:</span>
                <input type="number" id="start-input-${this.id}" class="form-control" value="0" step="1">
                <span class="input-group-text input-label-box">s</span>
            </div>
            <div class="input-group mt-1">
                <span class="input-group-text input-label-box">End:</span>
                <input type="number" id="end-input-${this.id}" class="form-control" value="1" step="1">
                <span class="input-group-text input-label-box">s</span>
            </div>
            <div class="playback-options">
                <div>
                    <div class="form-check mt-1">
                        <input class="form-check-input" type="checkbox" id="playback-current-view-${this.id}" disabled>
                        <label class="form-check-label" for="playback-current-view-${this.id}">Current view</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="playback-loop-${this.id}">
                        <label class="form-check-label" for="playback-loop-${this.id}">Loop</label>
                    </div>
                </div>
            </div>
        </div>
        `;
        const dCurView = this.DOM.playbackOptions.querySelector(`#playback-current-view-${this.id}`) as HTMLInputElement;
        const dLoop    = this.DOM.playbackOptions.querySelector(`#playback-loop-${this.id}`) as HTMLInputElement;
        const dStart   = this.DOM.playbackOptions.querySelector(`#start-input-${this.id}`) as HTMLInputElement;
        const dEnd     = this.DOM.playbackOptions.querySelector(`#end-input-${this.id}`) as HTMLInputElement;
        const dDownload= this.DOM.playbackOptions.querySelector(`#download-${this.id}`) as HTMLAnchorElement;

        dCurView.addEventListener('change', (e) => {
            dStart.disabled = dCurView.checked;
            dEnd.disabled = dCurView.checked;
            this.audioData.currentView = dCurView.checked;
            this.audioDataChanged();
        });

        dLoop.addEventListener('change', (e) => {
            this.audioData.loop = dLoop.checked;
            this.audioDataChanged();
        });

        dStart.addEventListener('change', (e) => {
            this.audioData.start = parseFloat(dStart.value);
            this.audioDataChanged();
        });

        dEnd.addEventListener('change', (e) => {
            this.audioData.end = parseFloat(dEnd.value);
            this.audioDataChanged();
        });

        dDownload.addEventListener('click', () => {
            const blob = audioMgr.exportWAV(this.id);
            if (!blob) return;
            const file = URL.createObjectURL(blob);
            dDownload.href = file;
            dDownload.download = 'ExportedAudio_' + this.name;
        });

        this.addPlayBtn(this.DOM.playbackOptions.querySelector('.playback-options')!);
        this.DOM.audioBtn!.style.marginLeft = 'auto';
        parent.appendChild(this.DOM.playbackOptions);
    }

    addFileInput(parent: HTMLElement) {
        const row2 = document.createElement('div');
        row2.classList.add('input-group', 'mt-2');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.classList.add('form-control');
        fileInput.addEventListener('change', async () => {
            if (!fileInput.files?.length) return;
            //graph.attachArray(this.id, await DataConverter.convert(fileInput.files[0]));
            DataConverter.convert(fileInput.files[0]).then((arr) => {
                graph.attachData(this.id, arr);
            });
            fileInput.files[0].arrayBuffer().then((data) => {
                if (this.playing) this.toggleAudio();
                audioMgr.addNode(this.id, this.audioData, undefined, data)?.then((val) => {
                    if (this.DOM.playbackOptions && val !== undefined) {
                        const dStart = this.DOM.playbackOptions.querySelector(`#start-input-${this.id}`) as HTMLInputElement;
                        const dEnd = this.DOM.playbackOptions.querySelector(`#end-input-${this.id}`) as HTMLInputElement;
                        dStart.value = '0';
                        dEnd.value = val.toString();
                        this.audioData.start = 0;
                        this.audioData.end = val;
                    }
                });
            });
        });
        row2.appendChild(fileInput);
        parent.appendChild(row2);
    }

    addMathInput(parent: HTMLElement) {
        
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
        parent.appendChild(errorImg);
        parent.appendChild(errTooltip);
        parent.appendChild(warningImg);
        parent.appendChild(warnTooltip);

        //$$ test\left(a,b\right)=\operatorname{sin}\left(a\right)+b $$
        const fnInput = new MathfieldElement();//document.createElement('math-field');//input
        //fnInput.type = 'text';
        fnInput.contentEditable = 'true';
        //fnInput.spellcheck = false;
        fnInput.id = `expr-input-${this.id}`;
        fnInput.classList.add('form-control');

        fnInput.addEventListener('input', () => {
            try {
                console.log('Latex: ' + fnInput.getValue('latex-unstyled'));
                const expression = this.parser.latexToString(fnInput.getValue('latex-unstyled'));
                console.log('Expr: ' + expression);
                this.parser.tokenize(expression).checkSyntax().parse();
                switch (this.parser.getExpressionType()) {
                    case ExpressionType.FUNCTION:
                        if (this.DOM.fnType) this.DOM.fnType.innerHTML = 'f(x):';
                        this.parser.setVariable('x', 0);
                        break;
                    case ExpressionType.YFUNCTION:
                        if (this.DOM.fnType) this.DOM.fnType.innerHTML = 'f(y):';
                        this.parser.setVariable('y', 0);
                        break;
                    case ExpressionType.EQUATION:
                        if (this.DOM.fnType) this.DOM.fnType.innerHTML = 'f(x,y):';
                        this.parser.setVariable('x', 0);
                        this.parser.setVariable('y', 0);
                        break;
                }
                this.parser.evaluate();
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
            }
            catch (e) {
                if (!(e instanceof ParserFatalError)) {
                    throw e;
                }
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
            if (this.type == LineType.expression) {
                this.calculate();
                //graph.attachExpression(this.id, this.parser.outputQueue, { degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
                this.audioDataChanged();
            }
            else if (this.type == LineType.function || this.type == LineType.variable) {
                //update ALL workers
                for (const lnKey in lines) {
                    const ln = lines[lnKey];
                    ln?.updateWorkerFunctions();
                    ln?.calculate();
                }
            }
            //simple variables (can have sliders)
            if (this.type == LineType.variable && ///^[a-z]=[0-9]*/i.test(expression) &&
                this.parser.outputQueue[0]?.type == TokenType.VARIABLE &&
                this.parser.outputQueue[1]?.type == TokenType.OPERATOR &&
                this.parser.outputQueue[1]?.name == '=' &&
                this.parser.outputQueue[2]?.type == TokenType.NUMBER &&
                this.parser.outputQueue[3] === undefined
            ) {
                this.DOM.sliderGroup?.removeAttribute('hidden');
                this.variableName = this.parser.outputQueue[0].name;
                if (this.DOM.slider && this.parser.outputQueue[2].value)
                    this.DOM.slider.value = this.parser.outputQueue[2].value?.toString();
            }
            else {
                this.isSimpleVariable = false;
                this.DOM.sliderGroup?.setAttribute('hidden', '');
                this.variableName = '';
            }
        });
        parent.appendChild(fnInput);
    }

    edit() {
        currentEditedLine = this;
        DOM.audioPanel.style.display = 'block';
        setTimeout(() => {
            DOM.audioPanel.style.transform = 'translateX(0)';
            DOM.wavePanel.style.transform = 'translateX(-110%)';
        }, 20);
        setTimeout(() => { DOM.wavePanel.style.display = 'none'; }, 300);

        DOM.waveSelect.value = this.audioData.waveType;
        
        const sliders = ['frequency', 'amplitude', 'duty', 'skew', 'phase'/*, 'bias'*/];
        for (const val of sliders) {
            (document.querySelector(`#${val}-slider`) as HTMLInputElement).value = (this.audioData as any)[val];
            (document.querySelector(`#${val}-input`) as HTMLInputElement).value = (this.audioData as any)[val];
        }

        updateBoxVisibility();
    }

    toggleAudio() {
        const boxBtn = this.DOM.audioBtn;
        const topBtn = DOM.btnPlay;

        if (this.playing) {
            this.playing = false;
            audioMgr.stopNode(this.id);
            if (boxBtn) boxBtn.innerHTML = play;
            if (topBtn) topBtn.innerHTML = play;
        }
        else {
            if (boxBtn) boxBtn.innerHTML = pause;
            if (topBtn) topBtn.innerHTML = pause;
            audioMgr.startNode(this.id, () => {
                this.playing = false;
                if (boxBtn) boxBtn.innerHTML = play;
                if (topBtn) topBtn.innerHTML = play;
            });
            this.playing = true;
        }
    }

    audioDataChanged() {

        let fn;
        switch (this.audioData.waveType) {
            case 'sine':
                this.parser.outputQueue = [{
                    type: TokenType.FUNCTION, name: 'sine', pos: 0,
                    arguments: [
                        [{ type: TokenType.VARIABLE, name: 'x', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.frequency, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.amplitude, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.phase, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.bias, name: '', pos: 0 }]
                    ]
                }];
                this.calculate();
                break;
            case 'square':
                this.parser.outputQueue = [{
                    type: TokenType.FUNCTION, name: 'square', pos: 0,
                    arguments: [
                        [{ type: TokenType.VARIABLE, name: 'x', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.frequency, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.amplitude, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.duty, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.phase, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.bias, name: '', pos: 0 }]
                    ]
                }];
                this.calculate();
                break;
            case 'triangle':
                this.parser.outputQueue = [{
                    type: TokenType.FUNCTION, name: 'triangle', pos: 0,
                    arguments: [
                        [{ type: TokenType.VARIABLE, name: 'x', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.frequency, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.amplitude, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.skew, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.phase, name: '', pos: 0 }],
                        [{ type: TokenType.NUMBER, value: this.audioData.bias, name: '', pos: 0 }]
                    ]
                }];
                this.calculate();
                break;
            case 'custom':
                if (this.playing) this.toggleAudio();
                fn = (x: number) => {
                    this.parser.setVariable('x', x);
                    return this.parser.evaluate();
                };
                break;
            default:
                //graph.attachFn(this.id, () => undefined, ExpressionType.FUNCTION);
        }
        audioMgr.addNode(this.id, this.audioData, fn);
        if (this.playing) audioMgr.startNode(this.id);
        graph.draw();
    }

    calculate() {
        //console.log('calculating data for ' + this.name);
        if (!this.calculating && this.worker) {
            this.calculating = true;
            this.worker.postMessage({
                msg: 'calculate',
                data: {
                    expression: this.parser.outputQueue,
                    width: graph.width,
                    height: graph.height,
                    xOffset: graph.xOffset,
                    yOffset: graph.yOffset,
                    xScale: graph.xScale,
                    yScale: graph.yScale
                } as IWorkerCalculateData
            });
        }
    }

    updateWorkerFunctions() {
        this.worker?.postMessage({
            msg: 'updateFn',
            data: {
                variables: this.parser.variables,
                functions: this.parser.functions
            } as IWorkerUpdateFunctions
        });
    }

    updateWorkerRules() {
        this.worker?.postMessage({
            msg: 'setRules',
            data: this.parser.rules
        });
    }
}

//const MQ = MathQuill.getInterface(2);
const audioMgr = new AudioManager();
var lines: { [index: number]: Line | undefined } = {};

var variables: Variables = {};
var functions: Functions = {};

var idCounter = -1;
var currentEditedLine: Line;
//var degrees = false;

const graph = new Graph(document.querySelector('#graph') as HTMLCanvasElement);
graph.draw();

graph.onRequestData = () => {
    for (const line in lines) {
        //console.log('requesting data from ' + line);
        lines[line]?.calculate();
    }
};

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
document.querySelector('#add-function')?.addEventListener('click', () => {
    lines[++idCounter] = new Line(LineType.function);
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
    currentEditedLine.audioData.waveType = DOM.waveSelect.value;
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
    for (const line in lines) {
        if(lines[line]) lines[line]!.parser.rules.useDegrees = true;
        lines[line]?.updateWorkerRules();
    }
    graph.draw(true);
});

DOM.optionsRadians?.addEventListener('click', () => {
    for (const line in lines) {
        if (lines[line]) lines[line]!.parser.rules.useDegrees = false;
        lines[line]?.updateWorkerRules();
    }
    graph.draw(true);
});


addSliderSyncGroup('frequency', 0, 22000, (val) => {
    currentEditedLine.audioData.frequency = val;
    currentEditedLine.audioDataChanged();
}, true);
addSliderSyncGroup('duty', 0, 100, (val) => {
    currentEditedLine.audioData.duty = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('amplitude', 0, 100, (val) => {
    currentEditedLine.audioData.amplitude = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('skew', 0, 100, (val) => {
    currentEditedLine.audioData.skew = val;
    currentEditedLine.audioDataChanged();
});
addSliderSyncGroup('phase', 0, 360, (val) => {
    currentEditedLine.audioData.phase = val;
    currentEditedLine.audioDataChanged();
});



function addSliderSyncGroup(idPrefix: string, min: number, max: number, callback: (value: number, e: InputEvent) => void, logarithmic = false) {
    const slider = document.querySelector(`#${idPrefix}-slider`) as HTMLInputElement;
    const input = document.querySelector(`#${idPrefix}-input`) as HTMLInputElement;
    slider.addEventListener('input', (e) => {
        const sliderVal = parseInt(slider.value);
        //console.log(sliderVal);
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
    if (currentEditedLine.audioData.waveType == 'square') {
        DOM.duty.classList.remove('hidden');
    }
    else {
        DOM.duty.classList.add('hidden');
    }
    if (currentEditedLine.audioData.waveType == 'triangle') {
        DOM.skew.classList.remove('hidden');
    }
    else {
        DOM.skew.classList.add('hidden');
    }
}