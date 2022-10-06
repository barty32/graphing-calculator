import { ExpressionParser, ExpressionType } from './parser.js';
let xPrevOffset;
let yPrevOffset;
let xPrevScale;
let yPrevScale;
const parser = new ExpressionParser();
let points = [];
self.onmessage = (e) => {
    const line = e.data;
    //if (line.recalculate == 2) {
    points = [];
    //}
    const int = setInterval(() => {
        self.postMessage({
            ID: line.ID,
            points,
            finished: false
        });
    }, 100);
    if (parser.getExpressionType(line.expression) == ExpressionType.FUNCTION) {
        const start = (line.xOffset / line.xScale);
        const end = ((line.xOffset + line.width) / line.xScale);
        const step = 1 / line.xScale;
        let prevY = 0;
        for (let i = start, k = 0; i < end; i += step, k++) {
            // if (points[i] !== undefined) {
            //     continue;
            // }
            let y = undefined;
            line.variables['x'] = i;
            let connect = true;
            try {
                y = parser.evaluate(line.variables, line.expression).result;
                connect = true;
                //line.variables['x'] =- dx// / line.xScale;
                const dy = (y - prevY /*parser.evaluate(line.variables, line.expression)*/) / step;
                //console.log(`x: ${i}, derivative: ${dy}`);
                //const delta = Math.abs(prevY - y);
                //let connect = Math.abs(dt) > 50 ? false : true;//1 * this.xScale
                // if (Math.abs(dt) > 10000) {
                //     connect = false;
                // }
                if (Math.abs(dy) > 10) {
                    //console.log(`delta is ${delta}, i: ${i}`);
                    // let count = Math.ceil(dy /** this.xScale*/);
                    // if (count > line.height) {
                    //     const tx = i;
                    //     line.variables['x'] = tx;
                    //
                    // }
                    // else {
                    //     //console.log(count);
                    //     const step = 1 / count;
                    //     for (let j = 0; j < count; j++) {
                    //         const tx = i - (1 / line.xScale) + j * step;
                    //         line.variables['x'] = tx;
                    //         points.push({ x: tx, y: parser.evaluate(line.variables, line.expression), connect: false, selected: false, debug: 2 });
                    //     }
                    // }
                    let y2prev = prevY;
                    for (let j = i - step; j < i; j += step / 10) {
                        line.variables['x'] = j;
                        let y2 = parser.evaluate(line.variables, line.expression);
                        const dy2 = (y2 - y2prev) / (step / 10);
                        if (Math.abs(dy2) > 1000) {
                            //points.push({ x: j, y: 1000000, connect: true, selected: false, debug: 0 });
                            //points.push({ x: j, y: -1000000, connect: false, selected: false, debug: 0 });
                            connect = false;
                            break;
                        }
                        y2prev = y2;
                    }
                }
            }
            catch (e) {
                console.log('worker error');
            }
            //Math.abs(i-points.at(-1)?.x) < 1/line.xScale?  
            points.push({ x: i, y, connect, selected: false, debug: 0 });
            prevY = y;
        }
    }
    else if (parser.getExpressionType(line.expression) == ExpressionType.YFUNCTION) {
        const start = (line.yOffset / line.yScale);
        const end = ((line.yOffset - line.height) / line.yScale);
        for (let i = start; i >= end; i -= 1 / line.yScale) {
            line.variables['y'] = i;
            const x = parser.evaluate(line.variables, line.expression);
            points.push({ x, y: i, connect: true, selected: false, debug: 0 });
        }
    }
    else if (parser.getExpressionType(line.expression) == ExpressionType.EQUATION) {
        const startx = (line.xOffset / line.xScale);
        const endx = ((line.xOffset + line.width) / line.xScale);
        const starty = (line.yOffset / line.yScale);
        const endy = ((line.yOffset - line.height) / line.yScale);
        for (let i = startx; i < endx; i += 1 / line.xScale) {
            for (let j = starty; j >= endy; j -= 1 / line.yScale) {
                line.variables['x'] = i;
                line.variables['y'] = j;
                if (parser.evaluate(line.variables, line.expression) == 1) {
                    points.push({ x: i, y: j, connect: false, selected: false, debug: 0 });
                }
            }
        }
    }
    xPrevOffset = line.xOffset;
    yPrevOffset = line.yOffset;
    xPrevScale = line.xScale;
    yPrevScale = line.yScale;
    //console.log(xPrevScale);
    clearInterval(int);
    self.postMessage({
        ID: line.ID,
        points,
        finished: true
    });
};
//# sourceMappingURL=worker.js.map