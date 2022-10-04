// TODO list:
//
// - add variable sliders
// - make frequency slider logarithmic
// - fix dpi rendering issues
// - add export audio
// - add how to use
// - add degree operator
// - copy handler to input
// - fix empty parentheses
//
import { ExpressionType } from './parser.js';
//API version 2.0
//changes in 2.0:
// 1. addLine, getLine and removeLine API now uses a new ID based system
// 2. lines member variable is now not array
export class Graph {
    canvas;
    ctx;
    lines = {};
    idCounter = -1;
    moving = false;
    inspecting;
    evCache = [];
    //private evCache: {[pointerId: number]: PointerEvent} = {};
    lastDistance = -1;
    scaleXAxis = false;
    scaleYAxis = false;
    resizeObserver;
    height;
    width;
    xOffset = 0;
    yOffset = 0;
    xScale = 100;
    yScale = 100;
    scrollSensitivity = 1.2;
    options = {
        grid: true,
        minorGrid: true,
        gridColor: 'grey',
        gridResolution: 100,
        axisNumbers: true,
        axisColor: 'white',
        axisActiveColor: 'cyan',
        background: '#111',
        controlButtons: true,
        lineWidth: 4,
        minZoom: 1e-306,
        maxZoom: Number.MAX_SAFE_INTEGER,
    };
    oldpt;
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d'); //TODO: check for null
        this.ctx.translate(0.5, 0.5);
        this.canvas.width = this.width = this.canvas.clientWidth;
        this.canvas.height = this.height = this.canvas.clientHeight;
        this.xOffset = -this.width / 2;
        this.yOffset = this.height / 2;
        this.canvas.style.cursor = 'grab';
        //pointer handlers
        this.canvas.onpointerdown = (e) => {
            const pt = this.isPointOnLine(e.clientX, e.clientY);
            if (pt) {
                this.inspecting = pt.line;
                pt.point.selected = true;
                this.oldpt = pt.point;
                this.draw();
            }
            else {
                this.moving = true;
                this.canvas.style.cursor = 'grabbing';
            }
            this.canvas.setPointerCapture(e.pointerId);
            this.evCache.push(e);
            if (this.evCache.length === 2) {
                if (this.isPointOnAxis(this.evCache[0].clientX, 'x') && this.isPointOnAxis(this.evCache[1].clientX, 'x')) {
                    this.scaleXAxis = true;
                }
                else {
                    this.scaleXAxis = false;
                }
                if (this.isPointOnAxis(this.evCache[0].clientY, 'y') && this.isPointOnAxis(this.evCache[1].clientY, 'y')) {
                    this.scaleYAxis = true;
                }
                else {
                    this.scaleYAxis = false;
                }
            }
        };
        this.canvas.onpointerup = (e) => {
            if (this.moving) {
                this.moving = false;
                this.canvas.style.cursor = 'grab';
            }
            else if (this.inspecting) {
                this.inspecting = undefined;
                const pt = this.isPointOnLine(e.clientX, e.clientY)?.point;
                if (pt)
                    pt.selected = false;
                if (this.oldpt)
                    this.oldpt.selected = false;
            }
            this.canvas.releasePointerCapture(e.pointerId);
            for (let i = 0; i < this.evCache.length; i++) {
                if (this.evCache[i].pointerId === e.pointerId) {
                    this.evCache.splice(i, 1);
                    break;
                }
            }
            if (this.evCache.length < 2) {
                this.lastDistance = -1;
                this.scaleXAxis = false;
                this.scaleYAxis = false;
                this.draw();
            }
        };
        this.canvas.onpointermove = (e) => {
            for (let i = 0; i < this.evCache.length; i++) {
                if (e.pointerId === this.evCache[i].pointerId) {
                    this.evCache[i] = e;
                    break;
                }
            }
            if (this.moving && this.evCache.length > 0) {
                this.move(e.movementX / this.evCache.length, e.movementY / this.evCache.length);
            }
            else if (this.inspecting) {
                const pt = this.findClosestPoint(e.clientX, e.clientY, this.inspecting);
                if (pt) {
                    if (this.oldpt)
                        this.oldpt.selected = false;
                    this.oldpt = pt;
                    pt.selected = true;
                    this.draw();
                }
            }
            else {
                if (this.isPointOnLine(e.clientX, e.clientY)) {
                    this.canvas.style.cursor = 'crosshair';
                }
                else {
                    this.canvas.style.cursor = 'grab';
                }
            }
            if (this.evCache.length === 2) {
                // Calculate the distance between the two pointers
                const curDist = this.getTouchDistance(this.evCache[0].clientX, this.evCache[0].clientY, this.evCache[1].clientX, this.evCache[1].clientY);
                if (this.lastDistance > 0) {
                    const center = this.getTouchCenter(this.evCache[0].clientX, this.evCache[0].clientY, this.evCache[1].clientX, this.evCache[1].clientY);
                    this.zoom(curDist, center.x, center.y, this.scaleXAxis, this.scaleYAxis, true);
                }
                this.lastDistance = curDist;
            }
        };
        this.canvas.addEventListener('wheel', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.zoom(e.deltaY, e.clientX, e.clientY, e.ctrlKey, e.shiftKey);
        });
        //window.addEventListener('resize', this.fixSize);
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    this.fixSize();
                }
            }
        });
        this.resizeObserver.observe(this.canvas);
        document.querySelector('#graph-zoom-in')?.addEventListener('click', () => {
            this.zoom(-100, this.width / 2, this.height / 2);
        });
        document.querySelector('#graph-zoom-out')?.addEventListener('click', () => {
            this.zoom(100, this.width / 2, this.height / 2);
        });
        document.querySelector('#graph-zoom-home')?.addEventListener('click', () => {
            this.resetZoom();
        });
    }
    /**
     * Adds a new line to the graph (you have to call attachFn() or attachArray() function to actually draw something)
     * @param name Name of the line (displayed in tooltip)
     * @param color Line color in a CSS-compatible string
     * @returns Returns the new line's unique ID
     */
    addLine(name, color = 'red') {
        const lineID = ++this.idCounter;
        this.lines[lineID] = { color, id: lineID, name, on: true, points: [], type: ExpressionType.UNKNOWN, calculating: false };
        return lineID;
    }
    removeLine(id) {
        this.lines[id] = undefined;
    }
    getLine(id) {
        const line = this.lines[id];
        if (!line)
            throw new Error('Line with this ID does not exist');
        return line;
    }
    attachFn(id, fn, type) {
        this.getLine(id).fn = fn;
        this.getLine(id).type = type;
        this.calculate(2);
    }
    attachExpression(id, expression, variables) {
        const line = this.getLine(id);
        if (!line.worker) {
            //unfortunaly i have to use absolute adress :(
            line.worker = new Worker('/tools/graphing-calculator/js/worker.js', { type: "module" });
            line.worker.onmessage = (e) => {
                const recvline = e.data;
                if (recvline.finished) {
                    line.calculating = false;
                }
                this.getLine(recvline.ID).points = recvline.points;
                this.draw();
            };
            line.worker.onerror = (error) => {
                console.error(`Worker error: ${error.message}`);
                throw error;
            };
        }
        line.expression = expression;
        line.variables = variables;
        this.calculate(2);
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
    attachArray(id, array) {
        delete this.getLine(id).fn;
        this.getLine(id).type = ExpressionType.UNKNOWN;
        this.getLine(id).points = array;
        this.draw();
    }
    getTouchDistance(x1, y1, x2, y2) {
        const a = Math.abs(x1 - x2);
        const b = Math.abs(y1 - y2);
        return Math.sqrt(a * a + b * b);
    }
    getTouchCenter(x1, y1, x2, y2) {
        return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }
    isPointOnAxis(dist, axis) {
        if (axis == 'x' && Math.abs(-this.xOffset - dist) < 20) { //x -this.xOffset + 10 - (x -this.xOffset - 10)
            return true;
        }
        else if (axis == 'y' && Math.abs(this.yOffset - dist) < 20) {
            return true;
        }
        return false;
    }
    isPointOnLine(x, y) {
        x = (x + this.xOffset) / this.xScale;
        y = (-y + this.yOffset) / this.yScale;
        const dx = 5 / this.xScale;
        const dy = 5 / this.yScale;
        for (const lineKey in this.lines) {
            const line = this.lines[lineKey];
            if (!line || !line.on)
                continue;
            for (const pt of line.points) {
                if (pt.x === undefined || pt.y === undefined)
                    continue;
                if (Math.abs(pt.x - x) < dx && Math.abs(pt.y - y) < dy) {
                    return { point: pt, line: line };
                }
            }
        }
        return undefined;
    }
    findClosestPoint(x, y, line) {
        x = (x + this.xOffset) / this.xScale;
        //y = (-y + this.yOffset) / this.yScale;
        let leastDist = Infinity;
        let leastPt = undefined;
        for (const pt of line.points) {
            const dist = Math.abs(pt.x - x); //Math.sqrt(Math.abs(pt.x - x) ** 2 + Math.abs(pt.y - y) ** 2);
            if (dist < leastDist) {
                leastDist = dist;
                leastPt = pt;
            }
        }
        if (leastPt)
            return leastPt;
        return undefined;
    }
    drawGrid() {
        if (!this.xScale || !this.yScale)
            return;
        const oldFill = this.ctx.fillStyle;
        this.ctx.fillStyle = this.options.gridColor;
        const xGrid = this.getGridScale(this.xScale);
        const yGrid = this.getGridScale(this.yScale);
        const tileWidth = xGrid.scale * this.xScale;
        const tileHeight = yGrid.scale * this.yScale;
        const gridOffsetX = this.getGridOffset(this.xOffset, tileWidth);
        const gridOffsetY = this.getGridOffset(-this.yOffset, tileHeight);
        const startx = Math.floor(this.xOffset / this.xScale / xGrid.scale) * xGrid.scale;
        const starty = -Math.floor(this.yOffset / this.yScale / -yGrid.scale) * yGrid.scale;
        for (let i = gridOffsetX, k = 0; i < this.width; i += tileWidth, k++) {
            this.ctx.beginPath();
            this.ctx.rect(i, 0, 2, this.height);
            this.ctx.fill();
            if (this.options.minorGrid) {
                //draw subgrid
                for (let j = 0; j < tileWidth; j += tileWidth / (xGrid.base == 2 ? 4 : 5)) {
                    this.ctx.beginPath();
                    this.ctx.rect(i + j, 0, 0.5, this.height);
                    this.ctx.fill();
                }
            }
            if (this.options.axisNumbers) {
                let textPos = this.yOffset;
                if (textPos < 0)
                    textPos = 0;
                if (textPos + 30 > this.height)
                    textPos = this.height - 30;
                this.drawNumber(this.convert(startx + k * xGrid.scale), i, textPos, false);
            }
        }
        for (let i = gridOffsetY, k = 0; i < this.height; i += tileHeight, k++) {
            this.ctx.beginPath();
            this.ctx.rect(0, i, this.width, 2);
            this.ctx.fill();
            if (this.options.minorGrid) {
                //draw subgrid
                for (let j = 0; j < tileHeight; j += tileHeight / (yGrid.base == 2 ? 4 : 5)) {
                    this.ctx.beginPath();
                    this.ctx.rect(0, i + j, this.width, 0.5);
                    this.ctx.fill();
                }
            }
            if (this.options.axisNumbers) {
                let textPos = -this.xOffset;
                let alignRight = false;
                if (textPos < 0)
                    textPos = 0;
                if (textPos + 20 > this.width) {
                    textPos = this.width - 20;
                    alignRight = true;
                }
                this.drawNumber(this.convert(starty - k * yGrid.scale), textPos, i, false, alignRight ? 'right' : 'left');
            }
        }
        //this.drawAxes();
        this.ctx.fillStyle = oldFill;
    }
    getGridScale(scale) {
        //if (scale == 0) return { scale: 1, base: 1 };
        let base = Math.abs(this.options.gridResolution / scale);
        let i = 0;
        while (base > 10) {
            base /= 10;
            i++;
        }
        while (base < 1) {
            base *= 10;
            i--;
        }
        if (base > 5)
            base = 10;
        else if (base > 2)
            base = 5;
        else if (base > 1)
            base = 2;
        else
            base = 1;
        return { scale: base * (10 ** i), base: base };
    }
    getGridOffset(offset, tileSize) {
        return -mod(offset, tileSize);
    }
    drawAxes() {
        const oldFill = this.ctx.fillStyle;
        this.ctx.fillStyle = this.scaleYAxis ? this.options.axisActiveColor : this.options.axisColor;
        this.ctx.fillRect(0, this.yOffset, this.width, 2);
        this.ctx.fillStyle = this.scaleXAxis ? this.options.axisActiveColor : this.options.axisColor;
        this.ctx.fillRect(-this.xOffset, 0, 2, this.height);
        this.ctx.fillStyle = oldFill;
    }
    drawNumber(value, posX, posY, background = false, textAlign = 'left') {
        const oldFill = this.ctx.fillStyle;
        this.ctx.font = '20px verdana, Georgia, Arial';
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = textAlign;
        if (background) {
            const w = this.ctx.measureText(value);
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(posX, posY, w.width + 20, 38);
        }
        this.ctx.fillStyle = this.options.axisColor;
        this.ctx.fillText(value, posX + 10, posY + 10);
        this.ctx.fillStyle = oldFill;
    }
    toSup(value) {
        let str = "";
        const convert = [0x2070, 0x00B9, 0x00B2, 0x00B3, 0x2074, 0x2075, 0x2076, 0x2077, 0x2078, 0x2079];
        for (const char of value) {
            if (char == '-') {
                str += String.fromCharCode(0x207B);
                continue;
            }
            str += String.fromCharCode(convert[parseInt(char)]); //8320, 8304
        }
        return str;
    }
    convert(value) {
        const valueAbs = Math.abs(value);
        if (value == undefined || isNaN(value))
            return '';
        if (!isFinite(value))
            return 'Infinity';
        if (value == 0)
            return '0';
        else if (valueAbs < 1e-5 || valueAbs >= 1e6) {
            let str = value.toExponential(2).split('e');
            while (str[0].at(-1) == '0' || str[0].at(-1) == '.') {
                str[0] = str[0].slice(0, -1);
            }
            if (str[1][0] == '+') {
                str[1] = str[1].slice(1);
            }
            return `${str[0]}·10${this.toSup(str[1])}`;
        }
        let str = value.toString();
        if (str.includes('.')) {
            str = value.toPrecision(4);
            //strip trailing zeroes
            if (str.length > 10) {
                str = str.slice(0, 10);
            }
            while (str.at(-1) == '0' || str.at(-1) == '.') {
                str = str.slice(0, -1);
            }
        }
        return str;
    }
    draw(calculateLines = 0) {
        const oldFill = this.ctx.fillStyle;
        this.ctx.fillStyle = this.options.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.options.grid)
            this.drawGrid();
        this.drawAxes();
        if (calculateLines) {
            this.calculate(calculateLines);
        }
        else {
            this.drawLines();
        }
        this.ctx.fillStyle = oldFill;
    }
    async drawLines() {
        let drawLabel;
        for (const lineKey in this.lines) {
            const line = this.lines[lineKey];
            if (!line || !line.on)
                continue;
            this.ctx.beginPath();
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = this.options.lineWidth;
            let prevX = 0;
            let prevY = 0;
            for (const point of line.points) {
                if (point.x === undefined || point.y === undefined)
                    continue;
                const x = point.x * this.xScale - this.xOffset;
                const y = -point.y * this.yScale + this.yOffset;
                // if ((prevY < 0 || prevY > this.height) && (y < 0 || y > this.height)) {
                //     continue;
                // }
                // else if ((prevY < 0 || prevY > this.height) && (y >= 0 && y <= this.height)) {
                //     this.ctx.moveTo(x, prevY);
                //     this.ctx.lineTo(x, prevY);
                // }
                if (point.selected) {
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(x, 0, 1, this.height);
                    this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    this.ctx.moveTo(x, y);
                    drawLabel = { x: point.x, y: point.y, xpos: x, ypos: y };
                }
                if (x < -1 || x > this.width + 1 /*|| y < 0 || y > this.height*/) {
                    continue;
                }
                if (Math.abs(prevX - x) < 1 /*|| Math.abs(prevY - y) < 1*/) {
                    //continue;
                }
                if (!point.connect) {
                    //this.ctx.beginPath();
                    //this.ctx.moveTo(x, y);
                    //this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
                    this.ctx.moveTo(x, y);
                    //this.ctx.stroke();
                    this.ctx.strokeRect(x, y, 1, 1);
                    continue;
                }
                this.ctx.lineTo(x, y);
                prevX = x;
                prevY = y;
                //console.log(`x: ${x}, y: ${y}`);
            }
            this.ctx.stroke();
        }
        if (drawLabel) {
            this.drawNumber(`(${this.convert(drawLabel.x)}, ${this.convert(drawLabel.y)})`, drawLabel.xpos + 5, drawLabel.ypos - 5, true);
        }
    }
    async calculate(recalculate) {
        //const int = setInterval(async () => {
        //    console.log('waiting');
        //    await new Promise(r => setTimeout(r, 2));
        //    
        //    this.draw();
        //}, 1);
        //let time = 0;
        for (const lineKey in this.lines) {
            const line = this.lines[lineKey];
            if (!line || !line.on /* || !line.fn*/)
                continue;
            if (line.fn) {
                line.points = [];
                if (line.type == ExpressionType.FUNCTION) {
                    const start = (this.xOffset / this.xScale);
                    const end = ((this.xOffset + this.width) / this.xScale);
                    //console.log('Start: ' + start + ', End: ' + end);
                    //let prevY = line.fn(start, NaN);
                    //let prevVal = 0
                    for (let i = start, k = 0; i < end; i += 1 / this.xScale, k++) {
                        const y = line.fn(i, NaN);
                        //const prevVal = Math.sin(i - 1 / this.xScale) + Math.sin(2 * i - 1 / this.xScale) + Math.sin(3 * i - 1 / this.xScale) + 2.5;
                        //const val = Math.sin(i) + Math.sin(2 * i) + Math.sin(3 * i) + 2.5;
                        //const y = (val - prevVal)* this.xScale;
                        //prevVal = y;
                        // if (line.points[i] !== undefined) {
                        //     continue;
                        // }
                        //const dt = Math.abs(y - line.fn(i - 1 / this.xScale, NaN)) / (1 / this.xScale);
                        //console.log(`x: ${i}, derivative: ${dt}`);
                        //const delta = Math.abs(prevY - y);
                        //let connect = Math.abs(dt) > 50 ? false : true;//1 * this.xScale
                        // if (dt > 1 / this.xScale) {
                        //     //console.log(`delta is ${delta}, i: ${i}`);
                        //     //debug = 1;
                        //     // for (let j = i - 0.0005; j < i; j += 0.0005 / delta) {
                        //     //     line.points.push({ x: i, y: j, connect: true });
                        //     // }
                        //     const count = Math.floor(dt * this.xScale);
                        //     if (count < this.height) {
                        //         //console.log(count);
                        //         const step = 1 / count;
                        //         for (let j = 1; j < count; j++) {
                        //             const tx = i - (1 / this.xScale) + j * step;
                        //             line.points.push({ x: tx, y: line.fn(tx), connect: false, selected: false, debug: 2 });
                        //         }
                        //     }
                        // }
                        line.points.push({ x: i, y, connect: true, selected: false, debug: 0 });
                        // if (performance.now() - time > 2) {
                        //     console.log('waiting');
                        //     await new Promise(r => setTimeout(r, 2));
                        //     //line.points.sort((a, b) => a.x - b.x);
                        //     this.draw();
                        //     time = performance.now();
                        //     //k = 0;
                        // }
                        //prevY = y;
                    }
                    //line.points.sort((a, b) => a.x - b.x);
                }
                else if (line.type == ExpressionType.YFUNCTION) {
                    const start = (this.yOffset / this.yScale);
                    const end = ((this.yOffset - this.height) / this.yScale);
                    for (let i = start; i >= end; i -= 1 / this.yScale) {
                        const x = line.fn(NaN, i);
                        line.points.push({ x, y: i, connect: true, selected: false, debug: 0 });
                    }
                }
                else if (line.type == ExpressionType.EQUATION) {
                    const startx = (this.xOffset / this.xScale);
                    const endx = ((this.xOffset + this.width) / this.xScale);
                    const starty = (this.yOffset / this.yScale);
                    const endy = ((this.yOffset - this.height) / this.yScale);
                    for (let i = startx; i < endx; i += 1 / this.xScale) {
                        for (let j = starty; j >= endy; j -= 1 / this.yScale) {
                            if (line.fn(i, j) == 1) {
                                line.points.push({ x: i, y: j, connect: false, selected: false, debug: 0 });
                            }
                        } //x^2+y^2=4
                        //await new Promise(r => setTimeout(r, 1));
                        //this.draw();
                    }
                }
                this.draw();
                return;
            }
            //let prevY = 0;
            //line.points = [];
            if (line.worker && !line.calculating) {
                const data = {
                    expression: line.expression ?? [],
                    width: this.width,
                    height: this.height,
                    xOffset: this.xOffset,
                    yOffset: this.yOffset,
                    xScale: this.xScale,
                    yScale: this.yScale,
                    ID: line.id,
                    recalculate,
                    variables: line.variables ?? {}
                };
                line.calculating = true;
                line.worker.postMessage(data);
            }
        }
        //clearInterval(int);
        this.draw();
    }
    move(x, y) {
        this.xOffset += -x;
        this.yOffset += y;
        //console.log(`Xoffset: ${this.xOffset}, YOffset: ${this.yOffset}`);
        this.draw(1);
    }
    zoom(delta, x, y, ctrl = false, shift = false, touch = false) {
        //console.log(`Xoffset: ${this.xOffset}, YOffset: ${this.yOffset}`);
        const scale = touch ?
            delta / this.lastDistance : //for pinch zoom gestures
            delta < 0 ? this.scrollSensitivity : 1 / this.scrollSensitivity; //for mouse wheel
        if (!ctrl && !shift) {
            ctrl = true;
            shift = true;
        }
        if (shift) {
            const newScale = this.xScale * scale;
            if (newScale < this.options.maxZoom && newScale > this.options.minZoom) {
                this.xScale = newScale; //Math.round(this.xScale * scale * 100) / 100;
                this.xOffset = -(x - (x + this.xOffset) * scale);
            }
        }
        if (ctrl) {
            const newScale = this.yScale * scale;
            if (newScale < this.options.maxZoom && newScale > this.options.minZoom) {
                this.yScale = newScale; //Math.round(this.yScale * scale * 100) / 100;
                this.yOffset = y - (y - this.yOffset) * scale;
            }
        }
        this.draw(2);
        //console.log(`Xscale: ${this.xScale}, YScale: ${this.yScale}, x: ${x}, y: ${y}, gridx: ${this.getGridScale(this.xScale).scale}`);
    }
    resetZoom() {
        this.xOffset = -this.width / 2;
        this.yOffset = this.height / 2;
        this.xScale = 100;
        this.yScale = 100;
        this.draw(2);
    }
    fixSize() {
        this.canvas.width = this.width = this.canvas.clientWidth;
        this.canvas.height = this.height = this.canvas.clientHeight;
        this.draw(true);
    }
}
function mod(x, m) {
    return ((x % m) + m) % m;
}
//# sourceMappingURL=graph.js.map