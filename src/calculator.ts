import { Graph } from './graph.js';
import { ExpressionParser, ExpressionType, ParserFatalError, Severity, Variables, Functions, TokenType, LatexParseError } from './parser.js';
import { AudioManager, AudioSpec, AudioFn } from './audio.js';
import DataConverter from './converter.js';
import { IWorkerCalculateData, IWorkerReceiveData, calculateLine } from './worker.js';
import { Keyboard } from './keyboard.js';
import { MQ } from '../mathquill/mathquill.mod.js';

enum LineType{
    expression,
    rawData,
    audio,
    variable,
    function
}

interface SaveData{
	app: 'Graphing calculator (Graph.js)',
	version: '1.7',
	name: string,
	dateSaved: string,
	keyboardClosed: boolean,
	sidePanelWidth: number,
	xOffset: number;
	yOffset: number;
	xScale: number;
	yScale: number;
	options: {
		gridAxis: boolean,
		minorGrid: boolean,
		axisNumbers: boolean,
		connectPoints: boolean,
		degrees: boolean
	},
	lines: {
		name: string,
		color: string,
		type: LineType,
		audioData: AudioSpec,
		visible: boolean,
		expression?: string,
		variableSlider?: {
			value: number,
			min: number,
			max: number,
			step: number
		}
	}[]
}

//const play = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
//const pause = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
const play =     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" fill="white"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const pause =    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" fill="white"><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>';
const eyeON =    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const eyeOFF =   '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
const speaker =  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
const brush =    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" style="vertical-align:top"><path d="M224 263.3C224.2 233.3 238.4 205.2 262.4 187.2L499.1 9.605C517.7-4.353 543.6-2.965 560.7 12.9C577.7 28.76 580.8 54.54 568.2 74.07L406.5 324.1C391.3 347.7 366.6 363.2 339.3 367.1L224 263.3zM320 400C320 461.9 269.9 512 208 512H64C46.33 512 32 497.7 32 480C32 462.3 46.33 448 64 448H68.81C86.44 448 98.4 429.1 96.59 411.6C96.2 407.8 96 403.9 96 400C96 339.6 143.9 290.3 203.7 288.1L319.8 392.5C319.9 394.1 320 397.5 320 400V400z"/></svg>';
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

//language support
const lang = (window as any).lang as (key: string) => string;

const DOM = {
    freq:   document.querySelector('#sub-frequency') as HTMLDivElement,
    ampl:   document.querySelector('#sub-amplitude') as HTMLDivElement,
    duty:   document.querySelector('#sub-duty') as HTMLDivElement,
    skew:   document.querySelector('#sub-skew') as HTMLDivElement,
    phase:  document.querySelector('#sub-phase') as HTMLDivElement,
    //bias: document.querySelector('#sub-bias'),

    waveList:   document.querySelector('#wave-boxes') as HTMLDivElement,
    waveSelect: document.querySelector('#wave-select') as HTMLSelectElement,
    btnPlay:    document.querySelector('#btn-play') as HTMLAnchorElement | null,

    optionsGrid:        document.querySelector('#options-grid') as HTMLInputElement,
    optionsMinorGrid:   document.querySelector('#options-minor-grid') as HTMLInputElement,
    optionsAxisNumbers: document.querySelector('#options-axis-number') as HTMLInputElement,
    optionsDegrees:     document.querySelector('#options-degrees') as HTMLInputElement,
    optionsRadians:     document.querySelector('#options-radians') as HTMLInputElement,

	content:        document.querySelector('#content') as HTMLDivElement,
	graphContainer: document.querySelector('#graph-container') as HTMLDivElement,
    wavePanel:      document.querySelector('#wave-panel') as HTMLDivElement,
	audioPanel:     document.querySelector('#audio-panel') as HTMLDivElement,
	sidePanel:      document.querySelector('#side-panel') as HTMLDivElement,
	resizer:        document.querySelector('#resizer') as HTMLDivElement,

	keyboardOpener: document.querySelector('#keyboard-open') as HTMLSpanElement,
}



class Line{
    private color: string;
    private name: string;
    private id: number;
    readonly type: LineType;
    parser: ExpressionParser;
	private worker?: Worker;
	private useWorker = false;
    audioData: AudioSpec;
    private playing = false;
    private generated = false;
    private audioFn: AudioFn | undefined;
    private variableName = '';
    private editHandler: ((mathField: MathQuill.v3.EditableMathQuill) => void ) = () => {};

	DOM: {
		subContainer:    HTMLDivElement,
		playbackOptions: HTMLDivElement,
		audioBtn:        HTMLAnchorElement,
		fnType:          HTMLSpanElement,
		sliderGroup:     HTMLDivElement,
		sliderSetup:     HTMLDivElement,
		slider:          HTMLInputElement,
		clipping?:       HTMLDivElement,
		fnInput?:        MathQuill.v3.EditableMathQuill,
		visibilityBtn:   HTMLAnchorElement,
		colorBtn:        HTMLAnchorElement,
		nameInput:       HTMLInputElement,
	}

    constructor(type: LineType) {
		this.type = type;
		this.DOM = {
			subContainer:    document.createElement('div'),
			playbackOptions: document.createElement('div'),
			audioBtn:        document.createElement('a'),
			fnType:          document.createElement('span'),
			sliderGroup:     document.createElement('div'),
			sliderSetup:     document.createElement('div'),
			slider:          document.createElement('input'),
			visibilityBtn:   document.createElement('a'),
			colorBtn:        document.createElement('a'),
			nameInput:       document.createElement('input'),
		};
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
            end: 1,
            currentView: false,
            loop: false
        };

        this.id = graph.addLine(this.name, this.color);
        this.createWaveBox();

        if (this.type == LineType.audio) {
			this.audioDataChanged();
			graph.setInspectMode(this.id, "x");
        }
	}
	
	spawnWorker() {
		this.worker = new Worker(window.location.pathname + 'js/worker.js', { type: "module" });
		this.worker.onmessage = (e) => {
			const recvline = e.data as IWorkerReceiveData;
			graph.getLine(this.id).points = recvline.points;
			graph.draw();
		}

		this.worker.onerror = (error) => {
			console.error(`Worker error: ${error.message}`);
		};
	}

	killWorker() {
		this.worker?.terminate();
		delete this.worker;
	}

    private generateName() {
        if (this.type == LineType.rawData) {
            return lang('file') + ' ' + lines.length;
        }
        else if (this.type == LineType.audio) {
			return lang('audio') + ' ' + lines.length;
        }
		return lang('line') + ' ' + lines.length;
    }

    private generateColor() {
        return graphColors[Math.floor((Math.random() * 100) % graphColors.length)] ?? 'white';
	}

	getVisibility() {
		return graph.getLine(this.id).on;
	}
	
	setVisibility(visible: boolean) {
		graph.getLine(this.id).on = visible;
		this.DOM.visibilityBtn.innerHTML = visible ? eyeON : eyeOFF;
		graph.draw();
	}

	getColor() {
		return this.color;
	}

	setColor(color: string) {
		this.color = color;
		this.DOM.colorBtn.querySelector('svg')?.setAttribute('fill', this.color);
		graph.getLine(this.id).color = this.color;
		graph.draw();
	}

	getName() {
		return this.name;
	}

	setName(name: string) {
		this.name = name;
		this.DOM.nameInput.value = this.name
		graph.getLine(this.id).name = this.name;
	}

	getExpression() {
		return this.DOM.fnInput?.latex();
	}

	setExpression(expr: string) {
		this.DOM.fnInput?.latex(expr);
		if (this.DOM.fnInput) this.editHandler(this.DOM.fnInput);
	}

	destruct() {
		this.DOM.subContainer.remove();
		this.killWorker();
		if (this.type == LineType.variable || this.type == LineType.function) {
			delete this.parser.variables[this.variableName];
			delete this.parser.functions[this.variableName];
			for (const line of lines) {
				//line.updateWorkerFunctions();
				line.calculate();
			}
		}
		graph.removeLine(this.id);
		graph.draw();
		audioMgr.removeNode(this.id);
		//remove itself from lines
		delete lines.splice(lines.indexOf(this), 1)[0];
	}

    private createWaveBox() {
        this.DOM.subContainer.classList.add('sub-container', 'rounded', 'wave-box');

        // Row 1
        const row1 = document.createElement('div');
        row1.classList.add('input-group');

        if (this.type == LineType.variable || this.type == LineType.function) {
            this.DOM.fnType.classList.add('input-group-text', 'input-label-box', 'user-select-none');
            this.DOM.fnType.innerHTML = this.type == LineType.variable ? 'Var:' : 'Fn:';
            row1.appendChild(this.DOM.fnType);
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
            if (this.type == LineType.expression) {
                // Row 2
                const row2 = document.createElement('div');
                row2.classList.add('input-group', 'mt-2');
                this.DOM.fnType = document.createElement('span');
                this.DOM.fnType.classList.add('input-group-text', 'input-label-box', 'user-select-none');
                this.DOM.fnType.innerHTML = 'f(x):';
                row2.appendChild(this.DOM.fnType);
                this.addMathInput(row2);
                this.DOM.subContainer.appendChild(row2);
            }
            else if (this.type == LineType.variable) {
                this.addVariableSlider(this.DOM.subContainer);
            }
            else if (this.type == LineType.rawData) {
                this.addFileInput(this.DOM.subContainer);
            }
        }
        if (this.type == LineType.expression || this.type == LineType.rawData) {
            this.addPlaybackOptions(this.DOM.subContainer);
        }

        DOM.waveList.appendChild(this.DOM.subContainer);
    }

	private addVisibilityBtn(parent: HTMLElement) {
		this.DOM.visibilityBtn.type = 'button';
		this.DOM.visibilityBtn.classList.add('btn', 'btn-secondary', 'wave-btn');
		this.DOM.visibilityBtn.innerHTML = eyeON;
		this.DOM.visibilityBtn.addEventListener('click', () => {
			this.setVisibility(!this.getVisibility());
		});
		parent.appendChild(this.DOM.visibilityBtn);
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
			colorBtn.style.setProperty('background-color', color, 'important');
			colInner.append(colorBtn);
			colorBtn.addEventListener('click', () => {
				this.setColor(colorBtn.style.backgroundColor);
			});
        }
        colorDropdown.appendChild(colInner);

        this.DOM.colorBtn.type = 'button';
        this.DOM.colorBtn.classList.add('btn', 'btn-secondary', 'wave-btn');
        this.DOM.colorBtn.innerHTML = brush;
        this.DOM.colorBtn.setAttribute('data-bs-toggle', 'dropdown');
        this.DOM.colorBtn.querySelector('svg')?.setAttribute('fill', this.color);
        this.DOM.colorBtn.ariaExpanded = 'false';
		parent.appendChild(this.DOM.colorBtn);
        parent.appendChild(colorDropdown);
    }

    addIdInput(parent: HTMLElement) {
        this.DOM.nameInput.type = 'text';
        this.DOM.nameInput.classList.add('form-control');
        this.DOM.nameInput.value = this.name;
        this.DOM.nameInput.addEventListener('input', (e) => {
			this.setName(this.DOM.nameInput.value);
        });
		parent.appendChild(this.DOM.nameInput);
    }

    addVariableSlider(parent: HTMLElement) {

        //this.DOM.sliderGroup.classList.add('d-flex', 'flex-column');
        this.DOM.sliderGroup.setAttribute('hidden', '');
        this.DOM.sliderGroup.style.display = 'flex';
        this.DOM.sliderGroup.style.flexDirection = 'column';

        this.DOM.sliderSetup.classList.add('slider-config');
        this.DOM.sliderSetup.innerHTML = `
            <div class="slider-sub">
                <span class="me-1 user-select-none">${lang('min')}:</span>
                <input type="text" inp-min class="small-input" value="0">
            </div>
            <div class="slider-sub">
                <span class="me-1 user-select-none">${lang('max')}:</span>
                <input type="text" inp-max class="small-input" value="10">
            </div>
            <div class="slider-sub">
                <span class="me-1 user-select-none">${lang('step')}:</span>
                <input type="text" inp-step class="small-input" value="1">
            </div>
        `;//<span role="textbox" contenteditable class="small-input" value="440">440</span>

        this.DOM.slider.type = 'range';
        this.DOM.slider.min = '0';
		this.DOM.slider.max = '10';
		this.DOM.slider.step = '1';
        this.DOM.slider.classList.add('form-range', 'input-slider', 'mt-2');

        this.DOM.sliderSetup.querySelector('input[inp-min]')?.addEventListener('input', (e) => {
            this.DOM.slider.min = (e.target as HTMLInputElement).value;
        });

        this.DOM.sliderSetup.querySelector('input[inp-max]')?.addEventListener('input', (e) => {
            this.DOM.slider.max = (e.target as HTMLInputElement).value;
        });

        this.DOM.sliderSetup.querySelector('input[inp-step]')?.addEventListener('input', (e) => {
            this.DOM.slider.step = (e.target as HTMLInputElement).value;
        });

        this.DOM.slider.addEventListener('input', () => {
			this.setExpression(this.variableName + '=' + this.DOM.slider.value);
        });

        this.DOM.sliderGroup.appendChild(this.DOM.slider);
        this.DOM.sliderGroup.appendChild(this.DOM.sliderSetup);
        parent.appendChild(this.DOM.sliderGroup);
    }

    addPlayBtn(parent: HTMLElement) {
        this.DOM.audioBtn.type = 'button';
        this.DOM.audioBtn.classList.add('btn', 'btn-success', 'wave-btn');
        this.DOM.audioBtn.innerHTML = play;
        this.DOM.audioBtn.addEventListener('click', () => this.toggleAudio());
		parent.appendChild(this.DOM.audioBtn);
    }

    addPlaybackSwitch(parent: HTMLElement) {
        const btn1 = document.createElement('a');
        btn1.type = 'button';
        btn1.classList.add('btn', 'btn-secondary', 'wave-btn');
        btn1.innerHTML = speaker;
        btn1.addEventListener('click', () => {
            //toggle playback visibility
            this.DOM.playbackOptions.toggleAttribute('hidden');
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
        btn4.addEventListener('click', () => {
			this.destruct();
        });
        parent.appendChild(btn4);
    }

    addPlaybackOptions(parent: HTMLElement) {
        this.DOM.playbackOptions.setAttribute('hidden', '');
        this.DOM.playbackOptions.innerHTML = `
        <div class="sub-container rounded" style="background-color: #111">
            <div class="d-flex">
                <h6>${lang('playback')}:</h6>
                <a href="#" id="download-${this.id}" class="btn btn-info ms-auto" style="width: 30px; height: 25px; padding: 0">${download}</a>
            </div>
            <div class="input-group mt-1">
                <span class="input-group-text input-label-box">${lang('start')}:</span>
                <input type="number" id="start-input-${this.id}" class="form-control" value="0" step="1">
                <span class="input-group-text input-label-box">s</span>
            </div>
            <div class="input-group mt-1">
                <span class="input-group-text input-label-box">${lang('end')}:</span>
                <input type="number" id="end-input-${this.id}" class="form-control" value="1" step="1">
                <span class="input-group-text input-label-box">s</span>
            </div>
            <div class="playback-options">
                <div>
                    <div class="form-check mt-1">
                        <input class="form-check-input" type="checkbox" id="playback-current-view-${this.id}" disabled>
                        <label class="form-check-label" for="playback-current-view-${this.id}">${lang('current_view')}</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="playback-loop-${this.id}">
                        <label class="form-check-label" for="playback-loop-${this.id}">${lang('loop')}</label>
                    </div>
                </div>
            </div>
        </div>
        <div id="clipping-${this.id}" class="clipping rounded" hidden>
            <img src="/assets/images/warning.svg" style="color:black">
            <div class="ms-2">${lang('clipping')}</div>
        </div>
        `;
        const dCurView = this.DOM.playbackOptions.querySelector(`#playback-current-view-${this.id}`) as HTMLInputElement;
        const dLoop    = this.DOM.playbackOptions.querySelector(`#playback-loop-${this.id}`) as HTMLInputElement;
        const dStart   = this.DOM.playbackOptions.querySelector(`#start-input-${this.id}`) as HTMLInputElement;
        const dEnd     = this.DOM.playbackOptions.querySelector(`#end-input-${this.id}`) as HTMLInputElement;
        const dDownload = this.DOM.playbackOptions.querySelector(`#download-${this.id}`) as HTMLAnchorElement;
        this.DOM.clipping = this.DOM.playbackOptions.querySelector(`#clipping-${this.id}`) as HTMLDivElement;

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
            this.generateAudio();
            const blob = audioMgr.exportWAV(this.id);
            if (!blob) return;
            const file = URL.createObjectURL(blob);
            dDownload.href = file;
            dDownload.download = 'ExportedAudio_' + this.name;
        });

        if (this.type != LineType.expression) {
            dDownload.style.display = 'none';
        }

        this.addPlayBtn(this.DOM.playbackOptions.querySelector('.playback-options')!);
        this.DOM.audioBtn.style.marginLeft = 'auto';
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
            DataConverter.convert(fileInput.files[0]!).then((arr) => {
                graph.attachData(this.id, arr);
                graph.setInspectMode(this.id, 'x');
            });
            fileInput.files[0]!.arrayBuffer().then((data) => {
                if (this.playing) this.toggleAudio();
                const pr = audioMgr.addNode(this.id, this.audioData, undefined, data);
                if (pr instanceof Promise) {
                    pr.then((val) => {
                        if (this.DOM.playbackOptions && val !== undefined) {
                            const dStart = this.DOM.playbackOptions.querySelector(`#start-input-${this.id}`) as HTMLInputElement;
                            const dEnd = this.DOM.playbackOptions.querySelector(`#end-input-${this.id}`) as HTMLInputElement;
                            dStart.value = '0';
                            dEnd.value = val.toString();
                            this.audioData.start = 0;
                            this.audioData.end = val;
                        }
                    });
                }
            });
        });
        row2.appendChild(fileInput);
        parent.appendChild(row2);
    }

    addMathInput(parent: HTMLElement) {

        //$$ test\left(a,b\right)=\operatorname{sin}\left(a\right)+b $$
        const fnInput = document.createElement('span');
        fnInput.classList.add('form-control', 'd-flex');
		fnInput.id = `expr-input-${this.id}`;

        const errorImg = document.createElement('img');
        errorImg.src = '/assets/images/warning.svg';
        errorImg.classList.add('error-img');
        const errTooltip = document.createElement('span');
		errTooltip.classList.add('e-tooltip', 'rounded');
		
		const resultBox = document.createElement('span');
		resultBox.style.display = 'none';
		resultBox.classList.add('symbol', 'result-box');


        this.editHandler = (f: MathQuill.v3.EditableMathQuill) => {
            let error = false;
			errTooltip.innerHTML = '';
			resultBox.style.display = 'none';
            try {
                if (this.type == LineType.variable)
                    delete this.parser.variables[this.variableName];
                if (this.type == LineType.function)
                    delete this.parser.functions[this.variableName];
                
                //console.log('Latex: ' + f.latex());
                const expression = this.parser.latexToString(f.latex());
                //console.log('Expr: ' + expression);
                this.parser.tokenize(expression).checkSyntax().parse();
                delete this.parser.variables['x'];
                delete this.parser.variables['y'];
                switch (this.parser.getExpressionType()) {
                    case ExpressionType.FUNCTION:
                        this.DOM.fnType.innerHTML = 'f(x):';
                        this.parser.setVariable('x', 0);
                        graph.setInspectMode(this.id, 'x');
                        break;
                    case ExpressionType.YFUNCTION:
                        this.DOM.fnType.innerHTML = 'f(y):';
                        this.parser.setVariable('y', 0);
                        graph.setInspectMode(this.id, 'y');
                        break;
                    case ExpressionType.EQUATION:
                        this.DOM.fnType.innerHTML = 'f(x,y):';
                        this.parser.setVariable('x', 0);
                        this.parser.setVariable('y', 0);
                        graph.setInspectMode(this.id, 'point');
						break;
					case ExpressionType.CONSTANT_RESULT:
						this.DOM.fnType.innerHTML = 'n:';
						resultBox.style.display = 'block';
						break;
                }
                if (this.type == LineType.variable) {
                    //simple variables (can have sliders)
                    const match = /^([a-z])=([+\-]?[0-9.]+)$/i.exec(expression);
                    if (match) {
                        this.DOM.sliderGroup.removeAttribute('hidden');
                        this.variableName = match[1]!;
						if (this.DOM.slider) {
							const val = match[2]!;
							if (parseFloat(val) > parseFloat(this.DOM.slider.max)) {
								this.DOM.slider.max = val;
								(this.DOM.sliderSetup.querySelector('input[inp-max]') as HTMLInputElement).value = val;
							}
							if (parseFloat(val) < parseFloat(this.DOM.slider.min)) {
								this.DOM.slider.min = val;
								(this.DOM.sliderSetup.querySelector('input[inp-min]') as HTMLInputElement).value = val;
							}
                            this.DOM.slider.value = val;
                        }
                    }
                    else {
                        this.DOM.sliderGroup.setAttribute('hidden', '');
                        this.variableName = expression[0] ?? '';
                    }
                }
                else if (this.type == LineType.function) {
                    const match = /^([a-z]+)/i.exec(expression);
                    if (match) {
                        this.variableName = match[1]!;
                    }
                    else {
                        this.variableName = '';
                    }
				}
				resultBox.innerHTML = `=&nbsp;${this.parser.evaluate() }`;
				// const startTime = performance.now();
				// for (let i = 0; i < 50; ++i) {
				// 	this.parser.setVariable('x', Math.random() * 1000);
				// 	this.parser.evaluate(this.parser.outputQueue);
				// }
				// const time = performance.now() - startTime;
				// console.log(time / 50);
				//this.useWorker = true;
            }
            catch (e) {
                if (e instanceof LatexParseError) {
                    errTooltip.innerHTML += e.message + '<br>';
                }
                else if (!(e instanceof ParserFatalError)) {
                    throw e;
                }
                error = true;
                graph.draw(true);
            }

            for (const err of this.parser.problems) {
                if (err.severity >= Severity.ERROR) {
                    errTooltip.innerHTML += err.desc + '<br>';
                }
            }
            errorImg.style.display = errTooltip.innerHTML ? 'block' : 'none';
            fnInput.style.color = errTooltip.innerHTML ? 'red' : '';

            if (this.type == LineType.function || this.type == LineType.variable) {
                //update ALL workers
                for (const line of lines) {
                    //line.updateWorkerFunctions();
                    line.calculate();
                }
            }

            if (error) return;

            if (this.type == LineType.expression) {
                this.calculate();
                //graph.attachExpression(this.id, this.parser.outputQueue, { degrees: degrees ? 1 : 0, res: Math.min(graph.xScale, graph.yScale) });
                this.audioDataChanged();
            }
        }
        
        this.DOM.fnInput = MQ.MathField(fnInput, {
            leftRightIntoCmdGoes: 'up',
            restrictMismatchedBrackets: true,
            sumStartsWithNEquals: true,
            supSubsRequireOperand: true,
            charsThatBreakOutOfSupSub: '+-=<>',
            autoSubscriptNumerals: false,
            autoCommands: 'pi tau infinity infty sqrt sum prod coprod int',
            autoOperatorNames: this.parser.getSupportedFunctions(),
            autoParenthesizedFunctions: this.parser.getAutoParenthesisedFunctions(),
            handlers: {
                edit: this.editHandler
			},
		} as MathQuill.v3.Config);
		
		const textarea = fnInput.querySelector('textarea');
		if (textarea) {
			textarea.inputMode = 'none';
			textarea.addEventListener('focus', () => {
				if (!keyboardClosed && window.matchMedia("(max-width: 499px)")) {
					keyboard.show();
				}
				DOM.keyboardOpener.style.display = '';
			});

			textarea.addEventListener('blur', () => {
				keyboard.hide();
				DOM.keyboardOpener.style.display = 'none';
			});

			textarea.setAttribute('data-id', this.id.toString());
		}
		
        fnInput.appendChild(errorImg);
		fnInput.appendChild(errTooltip);
		fnInput.appendChild(resultBox);
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
        this.generateAudio();

        if (this.playing) {
            this.playing = false;
            audioMgr.stopNode(this.id);
            boxBtn.innerHTML = play;
            if (topBtn) topBtn.innerHTML = play;
        }
        else {
            boxBtn.innerHTML = pause;
            if (topBtn) topBtn.innerHTML = pause;
            audioMgr.startNode(this.id, () => {
                this.playing = false;
                boxBtn.innerHTML = play;
                if (topBtn) topBtn.innerHTML = play;
            });
            this.playing = true;
        }
    }

    private generateAudio() {
        if (!this.generated) {
            const res = audioMgr.addNode(this.id, this.audioData, this.audioFn);
            if (typeof res == 'boolean' && res == true) {
                this.DOM.clipping?.removeAttribute('hidden');
            }
            else {
                this.DOM.clipping?.setAttribute('hidden', '');
            }
            this.generated = true;
        }
    }

    audioDataChanged() {
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
                break;
            case 'custom':
                if (this.playing) this.toggleAudio();
                this.audioFn = (x) => {
                    try {
                        this.parser.setVariable('x', x);
                        return this.parser.evaluate();
                    }
                    catch (e) {
                        return undefined;
                    }
                };
                this.generated = false;
                break;
            default:
                //graph.attachFn(this.id, () => undefined, ExpressionType.FUNCTION);
        }
        if (this.audioData.waveType != 'custom') {
            this.calculate();
            this.generated = false;
            this.generateAudio();
        }
        if (this.playing) audioMgr.startNode(this.id);
        graph.draw();
	}

	calculate() {
		const data = {
			expression: this.parser.outputQueue,
			width: graph.width,
			height: graph.height,
			xOffset: graph.xOffset,
			yOffset: graph.yOffset,
			xScale: graph.xScale,
			yScale: graph.yScale,
			rules: this.parser.rules,
			variables: this.parser.variables,
			functions: this.parser.functions,
			detectDiscontinuity: (this.type == LineType.audio || this.type == LineType.rawData) ? false : true
		} as IWorkerCalculateData;

		if (this.useWorker) {
			this.killWorker();
			this.spawnWorker();
			this.worker?.postMessage({
				msg: 'calculate',
				data: data
			});
		}
		else{
			calculateLine(data, this.parser, graph.getLine(this.id).points);
		}
    }
}

const audioMgr = new AudioManager();
var lines: Line[] = [];
var variables: Variables = {};
var functions: Functions = {};
var keyboard: Keyboard;
var keyboardClosed = false;

var currentEditedLine: Line;

const graph = new Graph(document.querySelector('#graph') as HTMLCanvasElement);
graph.draw();

document.querySelector('#graph-zoom-in')?.addEventListener('click', () => {
	graph.zoomIn();
});
document.querySelector('#graph-zoom-out')?.addEventListener('click', () => {
	graph.zoomOut();
});
document.querySelector('#graph-zoom-home')?.addEventListener('click', () => {
	graph.resetZoom();
});

graph.onRequestData = () => {
    for (const line of lines) {
        line.parser.rules.resulution = 1 / graph.xScale;
        //console.log('requesting data from ' + line);
        line.calculate();
    }
};

document.querySelector('#add')?.addEventListener('click', () => {
	lines.push(new Line(LineType.expression));
});
document.querySelector('#add-audio')?.addEventListener('click', () => {
	lines.push(new Line(LineType.audio));
});
document.querySelector('#add-data')?.addEventListener('click', () => {
	lines.push(new Line(LineType.rawData));
});
document.querySelector('#add-variable')?.addEventListener('click', () => {
	lines.push(new Line(LineType.variable));
});
document.querySelector('#add-function')?.addEventListener('click', () => {
	lines.push(new Line(LineType.function));
});

document.addEventListener("DOMContentLoaded", function () {
    // DOM.sidePanel.style.width = '400px';
    //open panel by default on PC
    // if (window.matchMedia('(min-width: 768px)').matches) {
    // 	DOM.sidePanel.classList.add('show');
    // }
    //const tooltipTriggerList = document.querySelectorAll('[data-bs-tooltip="tooltip"]');
    // @ts-ignore
    //[...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, { delay: { show: 1000, hide: 0} }));

	//add 1 expression box by default
	lines.push(new Line(LineType.expression));
    //graph.fixSize();
	graph.resetZoom();

	keyboard = new Keyboard(document.querySelector('#keyboard')!, (cmd) => {
		const activeElement = document.activeElement as HTMLElement;
		if (!activeElement) {
			return;
		}
		if (!activeElement.hasAttribute('data-id')) {
			return;
		}
		const id = parseInt(activeElement.getAttribute('data-id')!);
		if (!lines[id]) {
			return;
		}
		const fnInput = lines[id]!.DOM.fnInput;
		if (!fnInput) return;

		if (cmd.includes('\\')) {
			for (const letter of cmd) {
				if (letter == '\\') {
					switch (cmd.substring(cmd.search(/\\/) + 1)) {
						case 'backspace':
							fnInput.keystroke('Backspace');
							break;
						case 'moveright':
							fnInput.keystroke('Right');
							break;
						case 'moveleft':
							fnInput.keystroke('Left');
							break;
						case 'start':
							fnInput.keystroke('Home');
							break;
						case 'end':
							fnInput.keystroke('End');
							break;
						case 'deleteall':
							fnInput.latex('');
							break;
						case 'enter':
							fnInput.keystroke('Enter');
							break;
					}
					return;
				}
				fnInput.typedText(letter);
			}
			return;
		}
		fnInput.typedText(cmd);
	});

	keyboard.DOM.closeBtn.addEventListener('click', (e) => {
		keyboardClosed = true;
	});

	keyboard.onOpened = () => {
		if (window.matchMedia('(max-width: 499px)').matches) {
			DOM.graphContainer.style.height = '50%';
			DOM.content.style.height = (DOM.content.clientHeight - keyboard.DOM.keyboard.clientHeight).toString() + 'px';
		}
		DOM.sidePanel.style.height = (DOM.sidePanel.clientHeight - keyboard.DOM.keyboard.clientHeight).toString() + 'px';
		
		//scroll to focused element
		document.activeElement?.scrollIntoView({ block: 'center' });
	};

	keyboard.onClosed = () => {
		DOM.graphContainer.style.height = '';
		DOM.sidePanel.style.height = '';
		DOM.content.style.height = '';
	};

	DOM.keyboardOpener.addEventListener('click', () => {
		keyboardClosed = false;
		keyboard.show();
	});

	//prevent losing focus on focused element
	DOM.keyboardOpener.addEventListener('pointerdown', (e) => {
		e.preventDefault();
	});
});

document.querySelector('#audio-back')?.addEventListener('click', () => {
    DOM.wavePanel.style.display = 'block';
    setTimeout(() => {
        DOM.wavePanel.style.transform = 'translateX(0)';
        DOM.audioPanel.style.transform = 'translateX(110%)';
    }, 20);
    setTimeout(() => { DOM.audioPanel.style.display = 'none'; }, 300);
});

DOM.sidePanel.addEventListener('shown.bs.offcanvas', () => {
	//fix side panel opening when it's on bottom
	//this forces css to change layout
	//this is a dirty fix, but i didn't find a better solution
	if (window.matchMedia('(max-width: 499px)').matches) {
		graph.canvas.style.height = DOM.sidePanel.clientHeight.toString() + 'px';
		setTimeout(() => {
			graph.canvas.style.height = '';
		}, 100);
	}
});

let resizing = false;
let prevX = 0;

DOM.resizer.addEventListener('pointerdown', (e) => {
	DOM.resizer.setPointerCapture(e.pointerId);
	resizing = true;
	prevX = e.clientX;
});

DOM.resizer.addEventListener('pointerup', (e) => {
	resizing = false;
	DOM.resizer.releasePointerCapture(e.pointerId);
});

DOM.resizer.addEventListener('pointermove', (e) => {
	if (resizing) {
		const movementX = e.pageX - prevX;
		const newWidth = -movementX + parseFloat(DOM.sidePanel.style.width);
		//minimum width: 350px
		if (newWidth > 350) {
			DOM.sidePanel.style.width = newWidth.toString() + 'px';
			prevX = e.clientX;
		}
	}
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
    for (const line of lines) {
        line.parser.rules.useDegrees = true;
        //line.updateWorkerRules();
    }
    graph.draw(true);
});

DOM.optionsRadians?.addEventListener('click', () => {
    for (const line of lines) {
        line.parser.rules.useDegrees = false;
        //line.updateWorkerRules();
    }
    graph.draw(true);
});

document.querySelector('#savebtn')?.addEventListener('click', () => {
	saveData('localStorage');
});
document.querySelector('#loadbtn')?.addEventListener('click', () => {
	loadData('localStorage');
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


// ._____________________________________________________.
// |          | freq | ampl | duty | skew | phase | bias |
// |----------|------|------|------|------|-------|------|
// | Sine     | yes  | yes  | no   | no   | yes   | yes  |
// | Square   | yes  | yes  | yes  | no   | yes   | yes  |
// | Triangle | yes  | yes  | no   | yes  | yes   | yes  |
// |----------|------|------|------|------|-------|------|
//
function updateBoxVisibility() {
    if (currentEditedLine.audioData.waveType == 'square')
        DOM.duty.classList.remove('hidden');
    else
		DOM.duty.classList.add('hidden');
	
    if (currentEditedLine.audioData.waveType == 'triangle')
        DOM.skew.classList.remove('hidden');
    else
        DOM.skew.classList.add('hidden');
}

function saveData(where: 'localStorage' | 'download') {
	let linesToSave = [];

	for (const line of lines) {
		let slider;
		if (line.type == LineType.variable) {
			slider = {
				value: parseFloat(line.DOM.slider.value),
				min: parseFloat(line.DOM.slider.min),
				max: parseFloat(line.DOM.slider.max),
				step: parseFloat(line.DOM.slider.step)
			}
		}
		linesToSave.push({
			name: line.getName(),
			color: line.getColor(),
			type: line.type,
			audioData: line.audioData,
			visible: line.getVisibility(),
			expression: line.getExpression(),
			variableSlider: slider
		});
	}

	const data: SaveData = {
		app: 'Graphing calculator (Graph.js)',
		version: '1.7',
		name: '',
		dateSaved: new Date().toUTCString(),
		keyboardClosed: keyboardClosed,
		sidePanelWidth: parseFloat(DOM.sidePanel.style.width),
		xOffset: graph.xOffset,
		yOffset: graph.yOffset,
		xScale: graph.xScale,
		yScale: graph.yScale,
		options: {
			gridAxis: graph.options.grid,
			minorGrid: graph.options.minorGrid,
			axisNumbers: graph.options.axisNumbers,
			connectPoints: true,
			degrees: lines[0]?.parser.rules.useDegrees ?? false
		},
		lines: linesToSave
	}
	localStorage.setItem('savedData', JSON.stringify(data));
}

function loadData(source: 'localStorage' | 'upload') {
	const st = localStorage.getItem('savedData');
	if (st) {
		const data: SaveData = JSON.parse(st);

		//clean everything first
		for (const line of lines) {
			line.destruct();
		}
		DOM.waveList.replaceChildren();

		keyboardClosed = data.keyboardClosed;
		DOM.sidePanel.style.width = data.sidePanelWidth.toString() + 'px';

		graph.xOffset = data.xOffset;
		graph.yOffset = data.yOffset;
		graph.xScale = data.xScale;
		graph.yScale = data.yScale;
		graph.options.grid = data.options.gridAxis;
		graph.options.minorGrid = data.options.minorGrid;
		graph.options.axisNumbers = data.options.axisNumbers;

		for (const line of data.lines) {
			let newLine;
			switch (line.type) {
				case LineType.expression:
					newLine = new Line(LineType.expression);
					break;
				case LineType.audio:
					newLine = new Line(LineType.audio);
					break;
				case LineType.rawData:
					newLine = new Line(LineType.rawData);
					break;
				case LineType.variable:
					newLine = new Line(LineType.variable);
					break;
				case LineType.function:
					newLine = new Line(LineType.function);
					break;
			}
			newLine.parser.rules.resulution = 1 / graph.xScale;

			newLine.setName(line.name);
			newLine.setColor(line.color);
			newLine.setVisibility(line.visible);
			if(line.expression) newLine.setExpression(line.expression);
			newLine.audioData = line.audioData;
			newLine.audioDataChanged();

			if (newLine.DOM.slider && line.variableSlider) {
				newLine.DOM.slider.value = line.variableSlider.value.toString();
				newLine.DOM.slider.min = line.variableSlider.min.toString();
				newLine.DOM.slider.max = line.variableSlider.max.toString();
				newLine.DOM.slider.step = line.variableSlider.step.toString();
			}

			lines.push(newLine);
		}


		graph.draw(true);
	}
}