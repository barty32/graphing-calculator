// TODO list:
//
// - add discontinuity detection
// - make lines interactive
// - allow xy mode
// - add variable sliders
// - make frequency slider logarithmic
// - fix rendering audio lines in negative x region
// - hide unrelevant options from audio line settings
// - fix dpi rendering issues
// - add tooltips to buttons
// - fix side panel animation
//
// for now this is not needed (maybe after introducing xy mode?)
// - add function caching (fix performance issues)
// Done (v1.3)
// - added 'sign' function
// - fixed: scale numbers weren't have right value at some positions
// - fixed: scale numbers with trailing zeroes higher than 10 were rendered incorrectly
// - fixed: some scale numbers weren't exponent pretty-printed
// - ui improvements:
//   -> added options
//
// Done (v1.2)
// - separated id and name systems
// - Graph class now uses different (number-based) ID system
// - completely rewritten audio system
//      -> fixed: audio is started randomly out of phase
//      -> fixed: audio is not playing in Firefox
// - switched to custom math parser -> huge performance boost
// - added ton of new functions
// - added alternative fonts for scale numbers
// - fixed scale numbers + pretty-print exponents
//
// Done (v1.1):
// - add maximum and minimum zoom
// - (add controls to canvas) this
// - add support for color change
// - fixed side panel
// - removed settings buttons from non-audio lines
// - fix stick numbers on right
// - add support for zoom gestures
// - fixed: y-axis numbers were mirrored
// - fixed square wave
// - timebase of audio lines is now 1 ms
//
//API version 2.0
//changes in 2.0:
// 1. addLine, getLine and removeLine API now uses a new ID based system
// 2. lines member variable is now not array
export default class Graph {
    canvas;
    ctx;
    lines = {};
    idCounter = -1;
    moving = false;
    evCache = [];
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
            this.moving = true;
            this.canvas.style.cursor = 'grabbing';
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
            this.moving = false;
            this.canvas.style.cursor = 'grab';
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
    addLine(fn, name, xRes = 0, color) {
        const lineID = ++this.idCounter;
        this.lines[lineID] = { fn, color, id: lineID, name, on: true, xRes };
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
                this.drawNumber(startx + k * xGrid.scale, i, textPos, xGrid.scale);
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
                this.drawNumber(starty - k * yGrid.scale, textPos, i, yGrid.scale, alignRight ? 'right' : 'left');
            }
        }
        this.drawAxes();
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
        this.ctx.beginPath();
        this.ctx.rect(0, this.yOffset, this.width, 2);
        this.ctx.fill();
        this.ctx.fillStyle = this.scaleXAxis ? this.options.axisActiveColor : this.options.axisColor;
        this.ctx.beginPath();
        this.ctx.rect(-this.xOffset, 0, 2, this.height);
        this.ctx.fill();
        this.ctx.fillStyle = oldFill;
    }
    drawNumber(value, posX, posY, round, textAlign = 'left') {
        const oldFill = this.ctx.fillStyle;
        this.ctx.font = '20px verdana, Georgia, Arial';
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = textAlign;
        this.ctx.fillStyle = this.options.axisColor;
        this.ctx.fillText(this.convert(value), posX + 10, posY + 10);
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
        //console.log(str);
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
    draw() {
        const oldFill = this.ctx.fillStyle;
        this.ctx.fillStyle = this.options.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.options.grid)
            this.drawGrid();
        for (const lineKey in this.lines) {
            const line = this.lines[lineKey];
            if (!line || !line.on)
                continue;
            this.ctx.beginPath();
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = this.options.lineWidth;
            //move to initial position
            this.ctx.moveTo(0, line.fn(this.xOffset / this.xScale) * -this.yScale + this.yOffset);
            let yPrev = line.fn(this.xOffset / this.xScale) * -this.yScale + this.yOffset;
            if (!line.xRes) { //infinite resolution
                for (let i = 0; i < this.width; i++) { //let i = -this.xOffset; i < this.width - this.xOffset; i += 1/*1 / this.xScale*/
                    //this.ctx.lineTo(i + this.xOffset, fn(i / 31.8 / (this.width - 2 * this.xOffset)) * -200 + this.yOffset);
                    const x = (i + this.xOffset) / this.xScale;
                    const y = line.fn(x) * -this.yScale + this.yOffset;
                    const delta = Math.abs(y - yPrev);
                    if ((yPrev < 0 || yPrev > this.height) && (y < 0 || y > this.height)) {
                        continue;
                    }
                    else if ((yPrev < 0 || yPrev > this.height) && (y >= 0 && y <= this.height)) {
                        this.ctx.moveTo(i, yPrev);
                        //this.ctx.arc(i, yPrev, 1, 0, 2 * Math.PI);
                        this.ctx.lineTo(i, yPrev);
                    }
                    // if (y < 0 || y > this.height) {
                    //     for (let j = i - 1; j < i; j += 1 / delta * 8) {
                    //         let xNew = (j + this.xOffset) / this.xScale;
                    //         let yNew = line.fn(xNew) * -this.yScale + this.yOffset;
                    //         if (yNew < 0) yNew = 0;
                    //         if (yNew > this.height) yNew = this.height;
                    //         this.ctx.moveTo(j, yNew);
                    //         this.ctx.arc(j, yNew, 1, 0, 2 * Math.PI);
                    //     }
                    // }
                    // TODO: add discontinuity detection
                    // if (y > 10 * this.height || y < -(10 * this.height)) {
                    //     this.ctx.moveTo(i, y);
                    //     continue;
                    // }
                    yPrev = y;
                    //this.ctx.moveTo(i, y);
                    //this.ctx.arc(i, y, 1, 0, 2 * Math.PI);
                    this.ctx.lineTo(i, y);
                }
            }
            else {
                for (let i = -line.xRes * this.xScale; i < this.width + line.xRes * this.xScale; i++) {
                    const x = (i + this.xOffset) / this.xScale;
                    if (line.xRes && Math.abs(x % line.xRes) > 1 / this.xScale)
                        continue;
                    const y = line.fn(x / (line.xRes ? line.xRes : 1)) * -this.yScale + this.yOffset;
                    this.ctx.lineTo(i, y);
                }
            }
            this.ctx.stroke();
        }
        this.ctx.fillStyle = oldFill;
    }
    move(x, y) {
        this.xOffset += -x;
        this.yOffset += y;
        //console.log(`Xoffset: ${this.xOffset}, YOffset: ${this.yOffset}`);
        this.draw();
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
        this.draw();
        //console.log(`Xscale: ${this.xScale}, YScale: ${this.yScale}, x: ${x}, y: ${y}, gridx: ${this.getGridScale(this.xScale).scale}`);
    }
    resetZoom() {
        this.xOffset = -this.width / 2;
        this.yOffset = this.height / 2;
        this.xScale = 100;
        this.yScale = 100;
        this.draw();
    }
    fixSize() {
        this.canvas.width = this.width = this.canvas.clientWidth;
        this.canvas.height = this.height = this.canvas.clientHeight;
        this.draw();
    }
}
function mod(x, m) {
    return ((x % m) + m) % m;
}
// for (let i = -this.xOffset; i < this.width - this.xOffset; i++){
//     if (i % 100 == 0) {
//         this.ctx.beginPath();
//         this.ctx.rect((i + this.xOffset) * this.xScale, 0, 2, this.height);
//         this.ctx.fill();
//     }
// }
// for (let i = -this.yOffset; i < this.width - this.yOffset; i++) {
//     if (i % 100 == 0) {
//         this.ctx.beginPath();
//         this.ctx.rect(0, (i + this.yOffset) * this.yScale, this.width, 2);
//         this.ctx.fill();
//     }
// }
//
//
// for (let i = 0; i < this.width; i += gridScale.x) {
//     this.ctx.beginPath();
//     this.ctx.rect(i, 0, 2, this.height);
//     this.ctx.fill();
// }
// private zoomTouch(distance: number, x: number, y: number) {
//     const newScale = this.xScale * (distance / this.lastDistance);
//     this.yScale = this.xScale = this.xScale * (distance / this.lastDistance);
//     this.xOffset = -(x - (x + this.xOffset) * (distance / this.lastDistance));
//     this.yOffset = y - (y - this.yOffset) * (distance / this.lastDistance);
//     this.draw();
// }
// const scale = 1 / this.xScale;
// const gridScale = 2 ** (Math.log2(128 * scale) | 0);
// const size = Math.max(this.width, this.height) * scale + gridScale * 2;
// const x = ((this.xOffset * scale - gridScale) / gridScale | 0) * gridScale;
// const y = ((this.yOffset * scale - gridScale) / gridScale | 0) * gridScale;
// this.ctx.lineWidth = 1;
// this.ctx.strokeStyle = "grey";
// this.ctx.beginPath();
// for (let i = 0; i < size; i += gridScale) {
//     this.ctx.moveTo(x + i, y);
//     this.ctx.lineTo(x + i, y + size);
//     this.ctx.moveTo(x, y + i);
//     this.ctx.lineTo(x + size, y + i);
// }
// this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
// this.ctx.stroke();
// for (let i = 0; i < this.width; i++){
//     if (Math.abs(((i + this.xOffset) / this.xScale) % xGrid) < 1 / this.xScale) {
//         //draw subgrid
//         for (let j = 0; j < xGrid; j += xGrid / 5){
//             this.ctx.beginPath();
//             this.ctx.rect(i + j, 0, 0.5, this.height);
//             this.ctx.fill();
//         }
//         this.ctx.beginPath();
//         this.ctx.rect(i , 0, 2, this.height);
//         this.ctx.fill();
//     }
// }
// for (let i = 0; i < this.height; i++) {
//     if (Math.abs(((-i + this.yOffset) / this.yScale) % yGrid) < 1 / this.yScale) {
//         this.ctx.beginPath();
//         this.ctx.rect(0, i, this.width, 2);
//         this.ctx.fill();
//     }
// }
//let prevTouch: Touch | null = null;
//touch handlers
// this.canvas.ontouchstart = (e) => {
//     this.moving = true;
// }
// this.canvas.ontouchmove = (e) => {
//     const touch = e.touches[0];
//     if (this.moving && prevTouch) {
//         this.move(touch.pageX - prevTouch.pageX, touch.pageY - prevTouch.pageY);
//     }
//     prevTouch = touch;
// }
// this.canvas.ontouchend = (e) => {
//     this.moving = false;
//     prevTouch = null;
// }
// private prettyPrintExponent(expr: string) {
//     //expr must be valid exponent format string, i.e.:'5e+23' or '6e-8'
//     const num = Number(expr);
//     if (isNaN(num) || !isFinite(num)) {
//         return expr;
//     }
//     if (num == 0) {
//         return '0';
//     }
//     const expPos = expr.indexOf('e');
//     const exponent = expr.substring(expr.charAt(expPos + 1) == '+' ? expPos + 2 : expPos + 1);
//     return `${expr.substring(0, expPos)}·10<sup>${exponent}</sup>`;
// }
//const sp = str.split('.')
//return sp[0] + (sp[1] ? '.' + (sp[1][0] ? sp[1][0] : '') + (sp[1][1] ? sp[1][1] : '') : '');//(Math.round(value / round) * round).toPrecision(1);
// addLine(fn: GraphFn, name: string, xRes = Infinity, color: string) {
//     this.lines.push({ fn, color, id: lineID, name, on: true, xRes });
// }
// removeLine(id: number) {
//     this.lines.find((line: Line, index: number) => {
//         if (line.id == id) {
//             this.lines.splice(index, 1);
//             return true;
//         }
//         return false;
//     });
// }
// getLine(id: number): LineParams {
//     const line = this.lines.find((line) => {
//         if (line.id == id) return true;
//     });
//     if (!line) throw new Error('Line with this ID does not exist');
//     return line;
// }
// private getGridOffsets(tileWidth: number, tileHeight: number) {//xGrid: number, yGrid: number
//     let x = 0;
//     let y = 0;
//     for (let i = 0; i < this.width; i++){
//         if (Math.abs(((i + this.xOffset) / this.xScale) % xGrid) <= 1 / this.xScale) {
//             x = i - xGrid * this.xScale;
//             break;
//         }
//     }
//     for (let i = 0; i < this.height; i++) {
//         if (Math.abs(((-i + this.yOffset) / this.yScale) % yGrid) <= 1 / this.yScale) {
//             y = i - yGrid * this.yScale;
//             break;
//         }
//     }
//     return { x: x, y: y };
// }
//['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
// function roundTo(value: number, round: number) {
//     return value - value % round;
// }
//# sourceMappingURL=graph.js.map