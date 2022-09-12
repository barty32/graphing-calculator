import { ExpressionParser } from '../parser.js';


const Parser = new ExpressionParser();


const expressions = [
    '2(x-3)',
    '2x + 3'
];

for (const expr of expressions) {
    console.log('Testing expression: ' + expr + Parser.parse(Parser.tokenize(expr)));
}

// test('test 1', () => {
//     expect(Parser.parse(Parser.tokenize('2(x-3)'))).toBe(3);
// });