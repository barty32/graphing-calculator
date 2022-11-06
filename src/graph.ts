
//type GraphFn = (x: number, y: number) => (number | undefined);

//import { ExpressionType, Token } from './parser.js';

interface LineParams {
    //fn?: GraphFn;   //callback function for drawing
    color: string; //rendered color of the line
    id: number;    //line id (must be unique)
    name: string;  //name which is displayed in tooltip
    on: boolean;   //if line is visible or not
    //xRes: number;  //horizontal line resolution
    //yRes: number;  //vertical line resolution (not implemented)
    points: Point[];
    //type: ExpressionType;
    //worker?: Worker;
    //variables?: { [key: string]: number };
    //expression?: Token[];
    //calculating: boolean;
}

export interface Point {
    x: number | undefined;
    y: number | undefined;
    connect: boolean;
    selected: boolean;
    debug: number;
}

export class Graph {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private lines: { [index: number]: LineParams | undefined } = {};
    private idCounter = -1;
    private moving = false;
    private inspecting: LineParams | undefined;
    private evCache: PointerEvent[] = [];
    private evPrevCache: { [pointerId: number]: PointerEvent } = {};
    private lastDistance = -1;
    private scaleXAxis = false;
    private scaleYAxis = false;
    private resizeObserver: ResizeObserver;
    height: number;
    width: number;
    xOffset = 0;
    yOffset = 0;
    xScale = 100;
    yScale = 100;
    scrollSensitivity = 1.2;
    onRequestData: () => void = () => { };
    options = {
        grid: true,
        minorGrid: true,
        gridColor: 'grey',
        gridResolution: 100,//lower number means denser grid
        axisNumbers: true,
        axisColor: 'white',
        axisActiveColor: 'cyan',
        background: '#111',
        controlButtons: true,
        lineWidth: 4,
        minZoom: 1e-306,
        maxZoom: Number.MAX_SAFE_INTEGER,
    }
    prevX = -1;
    prevY = -1;

    private oldpt: Point | undefined;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;//TODO: check for null
        this.ctx.translate(0.5, 0.5);
        this.canvas.width = this.width = this.canvas.clientWidth;
        this.canvas.height = this.height = this.canvas.clientHeight;
        this.xOffset = -this.width / 2;
        this.yOffset = this.height / 2;
        this.canvas.style.cursor = 'grab';

        //pointer handlers
        this.canvas.onpointerdown = (e) => this.onPointerDown(e);
        this.canvas.onpointerup = (e) => this.onPointerUp(e);
        this.canvas.onpointermove = (e) => this.onPointerMove(e);
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
        })

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
    addLine(name: string, color: string = 'red') {
        const lineID = ++this.idCounter;
        this.lines[lineID] = { color, id: lineID, name, on: true, points: [] };
        return lineID;
    }

    removeLine(id: number) {
        delete this.lines[id];
    }

    getLine(id: number): LineParams {
        const line = this.lines[id];
        if (!line) throw new Error('Line with this ID does not exist');
        return line;
    }

    attachData(id: number, array: Point[]) {
        this.getLine(id).points = array;
        this.draw();
    }

    private getTouchDistance(x1: number, y1: number, x2: number, y2: number) {
        const a = Math.abs(x1 - x2);
        const b = Math.abs(y1 - y2);
        return Math.sqrt(a * a + b * b);
    }

    private getTouchCenter(x1: number, y1: number, x2: number, y2: number) {
        return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }

    private isPointOnAxis(dist: number, axis: string) {
        if (axis == 'x' && Math.abs(-this.xOffset - dist) < 20) {//x -this.xOffset + 10 - (x -this.xOffset - 10)
            return true;
        }
        else if (axis == 'y' && Math.abs(this.yOffset - dist) < 20) {
            return true;
        }
        return false;
    }

    private isPointOnLine(x: number, y: number): { point: Point, line: LineParams } | undefined {
        x = (x + this.xOffset) / this.xScale;
        y = (-y + this.yOffset) / this.yScale;
        const dx = 5 / this.xScale;
        const dy = 5 / this.yScale;
        for (const lineKey in this.lines) {
            const line = this.lines[lineKey];
            if (!line || !line.on) continue;

            for (const pt of line.points) {
                if (pt.x === undefined || pt.y === undefined) continue;
                if (Math.abs(pt.x - x) < dx && Math.abs(pt.y - y) < dy) {
                    return { point: pt, line: line };
                }
            }
        }
        return undefined;
    }

    private findClosestPoint(x: number, y: number, line: LineParams): Point | undefined {
        x = (x + this.xOffset) / this.xScale;
        //y = (-y + this.yOffset) / this.yScale;
        let leastDist = Infinity;
        let leastPt = undefined;
        for (const pt of line.points) {
            const dist = Math.abs((pt.x ?? Infinity) - x);//Math.sqrt(Math.abs(pt.x - x) ** 2 + Math.abs(pt.y - y) ** 2);
            if (dist < leastDist) {
                leastDist = dist;
                leastPt = pt;
            }
        }
        if (leastPt) return leastPt;
        return undefined;
    }

    private drawGrid() {
        if (!this.xScale || !this.yScale) return;
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
                if (textPos < 0) textPos = 0;
                if (textPos + 30 > this.height) textPos = this.height - 30;
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
                if (textPos < 0) textPos = 0;
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

    private getGridScale(scale: number) {
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
        if (base > 5) base = 10;
        else if (base > 2) base = 5;
        else if (base > 1) base = 2;
        else base = 1;
        return { scale: base * (10 ** i), base: base };
    }

    private getGridOffset(offset: number, tileSize: number) {
        return -mod(offset, tileSize);
    }

    private drawAxes() {
        const oldFill = this.ctx.fillStyle;
        this.ctx.fillStyle = this.scaleYAxis ? this.options.axisActiveColor : this.options.axisColor;
        this.ctx.fillRect(0, this.yOffset, this.width, 2);
        this.ctx.fillStyle = this.scaleXAxis ? this.options.axisActiveColor : this.options.axisColor;
        this.ctx.fillRect(-this.xOffset, 0, 2, this.height);
        this.ctx.fillStyle = oldFill;
    }

    private drawNumber(value: string, posX: number, posY: number, background: boolean = false, textAlign: CanvasTextAlign = 'left') {
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

    private toSup(value: string) {
        let str = "";
        const convert = [0x2070, 0x00B9, 0x00B2, 0x00B3, 0x2074, 0x2075, 0x2076, 0x2077, 0x2078, 0x2079];
        for (const char of value) {
            if (char == '-') {
                str += String.fromCharCode(0x207B);
                continue;
            }
            str += String.fromCharCode(convert[parseInt(char)]!);//8320, 8304
        }
        return str;
    }

    private convert(value: number): string {
        const valueAbs = Math.abs(value);
        if (value == undefined || isNaN(value)) return '';
        if (!isFinite(value)) return 'Infinity';
        if (value == 0) return '0';
        else if (valueAbs < 1e-5 || valueAbs >= 1e6) {
            let str = value.toExponential(2).split('e');
            while (str[0]!.at(-1) == '0' || str[0]!.at(-1) == '.') {
                str[0] = str[0]!.slice(0, -1);
            }
            if (str[1]![0] == '+') {
                str[1] = str[1]!.slice(1);
            }
            return `${str[0]}·10${this.toSup(str[1]!)}`;
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

    private onPointerDown(e: PointerEvent) {
        this.canvas.setPointerCapture(e.pointerId);
        this.evCache.push(e);

        const pt = this.isPointOnLine(e.clientX, e.clientY);
        if (pt) {
            this.inspecting = pt.line;
            pt.point.selected = true;
            this.oldpt = pt.point;
            this.draw();
        }
        else {
            this.moving = true;
            this.evPrevCache[e.pointerId] = e;
            /*if (this.prevX == -1) *///this.prevX = this.evCache[0].clientX;
            /*if (this.prevY == -1) *///this.prevY = this.evCache[0].clientY;
            this.canvas.style.cursor = 'grabbing';
        }


        if (this.evCache.length === 2) {
            if (this.isPointOnAxis(this.evCache[0]!.clientX, 'x') && this.isPointOnAxis(this.evCache[1]!.clientX, 'x')) {
                this.scaleXAxis = true;
            } else {
                this.scaleXAxis = false;
            }
            if (this.isPointOnAxis(this.evCache[0]!.clientY, 'y') && this.isPointOnAxis(this.evCache[1]!.clientY, 'y')) {
                this.scaleYAxis = true;
            } else {
                this.scaleYAxis = false;
            }
        }
    }

    private onPointerUp(e: PointerEvent) {
        if (this.moving) {
            this.moving = false;
            //this.prevX = -1;
            //this.prevY = -1;
            this.canvas.style.cursor = 'grab';
        }
        else if (this.inspecting) {
            this.inspecting = undefined;
            const pt = this.isPointOnLine(e.clientX, e.clientY)?.point;
            if (pt) pt.selected = false;
            if (this.oldpt) this.oldpt.selected = false;
        }
        this.canvas.releasePointerCapture(e.pointerId);
        delete this.evPrevCache[e.pointerId];
        for (let i = 0; i < this.evCache.length; i++) {
            if (this.evCache[i]!.pointerId === e.pointerId) {
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
    }

    private onPointerMove(e: PointerEvent) {
        for (let i = 0; i < this.evCache.length; i++) {
            if (e.pointerId === this.evCache[i]!.pointerId) {
                this.evCache[i] = e;
                if (this.moving) {
                    const movementX = this.evCache[i]!.clientX - this.evPrevCache[e.pointerId]!.clientX;//this.prevX;
                    const movementY = this.evCache[i]!.clientY - this.evPrevCache[e.pointerId]!.clientY;//this.prevY;
                    //console.log(`movex:${movementX},movey${movementY}`);
                    this.move(movementX / this.evCache.length, movementY / this.evCache.length);
                }
                break;
            }
        }
        this.evPrevCache[e.pointerId] = e;

        if (this.moving && this.evCache.length > 0) {
        }
        else if (this.inspecting) {
            const pt = this.findClosestPoint(e.clientX, e.clientY, this.inspecting);
            if (pt) {
                if (this.oldpt) this.oldpt.selected = false;
                this.oldpt = pt;
                pt.selected = true;
                this.draw();
            }
        }
        else {
            if (this.isPointOnLine(e.clientX, e.clientY)) {
                this.canvas.style.cursor = 'crosshair';
            } else {
                this.canvas.style.cursor = 'grab';
            }
        }

        if (this.evCache.length === 2) {
            // Calculate the distance between the two pointers
            const curDist = this.getTouchDistance(this.evCache[0]!.clientX, this.evCache[0]!.clientY, this.evCache[1]!.clientX, this.evCache[1]!.clientY);

            if (this.lastDistance > 0) {
                const center = this.getTouchCenter(this.evCache[0]!.clientX, this.evCache[0]!.clientY, this.evCache[1]!.clientX, this.evCache[1]!.clientY);
                this.zoom(curDist, center.x, center.y, this.scaleXAxis, this.scaleYAxis, true);
            }
            this.lastDistance = curDist;
        }
    }

    draw(requestRecalculation = false) {
        const oldFill = this.ctx.fillStyle;
        this.ctx.fillStyle = this.options.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.options.grid)
            this.drawGrid();
        
        this.drawAxes();

        if (requestRecalculation) {
            this.onRequestData();
        }
        this.drawLines();
        
        this.ctx.fillStyle = oldFill;
    }

    private async drawLines() {

        let drawLabel: { x: number, y: number, xpos: number, ypos: number } | undefined;
        for (const lineKey in this.lines) {
            const line = this.lines[lineKey];
            if (!line || !line.on) continue;
            this.ctx.beginPath();
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = this.options.lineWidth;
            let prevX = 0;
            let prevY = 0;

            for (const point of line.points) {
                if (point.x === undefined || point.y === undefined) continue;

                const x = point.x * this.xScale - this.xOffset;
                const y = -point.y * this.yScale + this.yOffset;

                if (x < -1 || x > this.width + 1 /*|| y < 0 || y > this.height*/) {
                    continue;
                }
                if (Math.abs(prevX - x) < 1 /*|| Math.abs(prevY - y) < 1*/) {
                    continue;
                }

                if (point.debug == 1) {
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(x-2, y-2, 4, 4);
                    continue;
                }
                else {
                    this.ctx.strokeStyle = line.color;
                }

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
                    drawLabel = {x: point.x, y: point.y, xpos: x, ypos: y};
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

    private move(x: number, y: number) {
        this.xOffset += -x;
        this.yOffset += y;
        //console.log(`Xoffset: ${this.xOffset}, YOffset: ${this.yOffset}`);
        this.draw(true);
    }

    private zoom(delta: number, x: number, y: number, ctrl = false, shift = false, touch = false) {
        
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
                this.xScale = newScale;//Math.round(this.xScale * scale * 100) / 100;
                this.xOffset = -(x - (x + this.xOffset) * scale);
            }
        }
        if (ctrl) {
            const newScale = this.yScale * scale;
            if (newScale < this.options.maxZoom && newScale > this.options.minZoom) {
                this.yScale = newScale;//Math.round(this.yScale * scale * 100) / 100;
                this.yOffset = y - (y - this.yOffset) * scale;
            }
        }
        this.draw(true);
        //console.log(`Xscale: ${this.xScale}, YScale: ${this.yScale}, x: ${x}, y: ${y}, gridx: ${this.getGridScale(this.xScale).scale}`);
    }

    resetZoom() {
        this.xOffset = -this.width / 2;
        this.yOffset = this.height / 2;
        this.xScale = 100;
        this.yScale = 100;
        this.draw(true);
    }

    fixSize() {
        this.canvas.width = this.width = this.canvas.clientWidth;
        this.canvas.height = this.height = this.canvas.clientHeight;
        this.draw(true);
    }
}

function mod(x: number, m: number) {
    return ((x % m) + m) % m;
}