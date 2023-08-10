import { Point } from "./graph.js";
import { ExpressionParser, ExpressionType, Token, TokenType, Variables, Functions, SpecialRules } from './parser.js';

export interface IWorkerCalculateData{
    expression: Token[];
    width: number;
    height: number;
    xOffset: number;
    yOffset: number;
    xScale: number;
	yScale: number;
	rules: SpecialRules;
	variables: Variables;
	functions: Functions;
	detectDiscontinuity: boolean;
}

export interface IWorkerReceiveData {
    points: Point[];
    finished: boolean;
}

self.onmessage = (e) => {
    switch (e.data.msg) {

        case 'calculate':
			const line = e.data.data as IWorkerCalculateData;
			const parser = new ExpressionParser();
			let points: Point[] = [];
			const int = setInterval(() => {
				self.postMessage({
					points,
					finished: false
				});
			}, 10);

			parser.variables = line.variables;
			parser.functions = line.functions;
			parser.rules = line.rules;
			
			calculateLine(line, parser, points);

            clearInterval(int);
            self.postMessage({
                points,
                finished: true
            });
            break;
    }
}

//let xPrevOffset: number;
//let yPrevOffset: number;
//let xPrevScale: number;
//let yPrevScale: number;

export function calculateLine(line: IWorkerCalculateData, parser: ExpressionParser, points: Point[]): boolean {
	points.splice(0, points.length);
	parser.problems.splice(0, points.length);

	if (parser.getExpressionType(line.expression) == ExpressionType.FUNCTION) {
		const start = (line.xOffset / line.xScale);
		const end = ((line.xOffset + line.width) / line.xScale);
		const step = 1 / line.xScale;
		let prevY = 0;
		//parser.variables['x'] = [];

		for (let i = start, k = 0; i < end; i += step, k++) {
			// if (points[i] !== undefined) {
			//     continue;
			// }
			let y = undefined;
			parser.setVariable('x', i);
			//parser.variables['x'][0] = { type: TokenType.NUMBER, pos: 0, name: '', value: i };
			let connect = true;
			try {
				y = parser.evaluate(line.expression)//.result;
				connect = true;

				//line.variables['x'] =- dx// / line.xScale;
				const dy = (y - prevY/*parser.evaluate(line.variables, line.expression)*/) / step;
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
						parser.setVariable('x', j);
						//parser.variables['x'][0] = { type: TokenType.NUMBER, pos: 0, name: '', value: j };
						let y2 = parser.evaluate(line.expression);
						const dy2 = (y2 - y2prev) / (step / 10);

						if (line.detectDiscontinuity && Math.abs(dy2) > 1000) {
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
				//console.error(e);
				return false;
			}

			//Math.abs(i-points.at(-1)?.x) < 1/line.xScale?  
			points.push({ x: i, y, connect, selected: false, debug: 0 });
			prevY = y ?? Infinity;
		}
	}
	else if (parser.getExpressionType(line.expression) == ExpressionType.YFUNCTION) {
		parser.variables['y'] = [];
		const start = (line.yOffset / line.yScale);
		const end = ((line.yOffset - line.height) / line.yScale);
		for (let i = start; i >= end; i -= 1 / line.yScale) {
			parser.variables['y'][0] = { type: TokenType.NUMBER, pos: 0, name: '', value: i };
			let x = undefined
			try {
				x = parser.evaluate(line.expression);
			}
			catch (e) {
				return false;
			}
			points.push({ x, y: i, connect: true, selected: false, debug: 0 });
		}
	}
	else if (parser.getExpressionType(line.expression) == ExpressionType.EQUATION) {
		parser.variables['x'] = [];
		parser.variables['y'] = [];
		const startx = (line.xOffset / line.xScale);
		const endx = ((line.xOffset + line.width) / line.xScale);
		const starty = (line.yOffset / line.yScale);
		const endy = ((line.yOffset - line.height) / line.yScale);
		for (let i = startx; i < endx; i += 1 / line.xScale) {
			for (let j = starty; j >= endy; j -= 1 / line.yScale) {
				parser.variables['x'][0] = { type: TokenType.NUMBER, pos: 0, name: '', value: i };
				parser.variables['y'][0] = { type: TokenType.NUMBER, pos: 0, name: '', value: j };
				try {
					if (parser.evaluate(line.expression) == 1) {
						points.push({ x: i, y: j, connect: false, selected: false, debug: 0 });
					}
				}
				catch (e) {
					return false;
				}
			}
		}
	}
	//xPrevOffset = line.xOffset;
	//yPrevOffset = line.yOffset;
	//xPrevScale = line.xScale;
	//yPrevScale = line.yScale;
	//console.log(xPrevScale);
	return true;
}


