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
        for (let i = start, k = 0; i < end; i += 1 / line.xScale, k++) {
            // if (points[i] !== undefined) {
            //     continue;
            // }
            let y = undefined;
            line.variables['x'] = i;
            try {
                y = parser.evaluate(line.variables, line.expression);
            }
            catch (e) {
            }
            //Math.abs(i-points.at(-1)?.x) < 1/line.xScale?  
            points.push({ x: i, y, connect: true, selected: false, debug: 0 });
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