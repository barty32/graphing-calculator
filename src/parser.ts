interface Problem {
    //name: string,
    desc: string,
    severity: Severity,
    char: number,
    len: number
}

export class ParserFatalError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ParserFatalError';
    }
}

export class LatexParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LatexParseError';
    }
}

export enum Severity{
    INFO,
    WARNING,
    ERROR,
    // FATAL_ERROR
}

export enum TokenType{
    INVALID = -1,
    NUMBER,
    FUNCTION,
    VARIABLE,
    OPERATOR,
    LPAREN,
    RPAREN,
    COMMA,
    //EQUAL
    //STRING
}

export enum ExpressionType {
    UNKNOWN = -1,
    FUNCTION,
    YFUNCTION,
    EQUATION,
    INEQUALITY,
    POLAR,
    POINT,
    VARIABLE,
    CUSTOM_FUNCTION,
	CUSTOM_VARIABLE,
	CONSTANT_RESULT
}

export interface Token{
    type: TokenType;
    pos: number;
    value?: number;
    name: string;
    arguments?: Token[][];
}

export interface SpecialRules{
    isCustomFunction: boolean;
    isCustomVariable: boolean;
    useDegrees: boolean;
    resulution: number;
}

export type Variables = { [key: string]: Token[] };
export type Functions = { [key: string]: { args: string[], fn: Token[] } };

const functions: { [key: string]: {argc: number, fn: (args: number[]) => number, type: string } } = {
    
    //audio functions
    'sine':     { argc: 5, type: 'aud', fn: (args) => sine(args[0]!, args[1]!, args[2]!, args[3]!, args[4]!) },
    'square':   { argc: 6, type: 'aud', fn: (args) => square(args[0]!, args[1]!, args[2]!, args[3]!, args[4]!, args[5]!) },
    'triangle': { argc: 6, type: 'aud', fn: (args) => triangle(args[0]!, args[1]!, args[2]!, args[3]!, args[4]!, args[5]!) },

    //hyperbolic inverse
    'arcsinh': { argc: 1, type: 'hyp', fn: (args) => Math.asinh(args[0]!) },
    'asinh':   { argc: 1, type: 'hyp', fn: (args) => Math.asinh(args[0]!) },
    'arccosh': { argc: 1, type: 'hyp', fn: (args) => Math.acosh(args[0]!) },
    'acosh':   { argc: 1, type: 'hyp', fn: (args) => Math.acosh(args[0]!) },
    'arctanh': { argc: 1, type: 'hyp', fn: (args) => Math.atanh(args[0]!) },
    'arctgh':  { argc: 1, type: 'hyp', fn: (args) => Math.atanh(args[0]!) },
    'atanh':   { argc: 1, type: 'hyp', fn: (args) => Math.atanh(args[0]!) },
    'atgh':    { argc: 1, type: 'hyp', fn: (args) => Math.atanh(args[0]!) },
    'arccsch': { argc: 1, type: 'hyp', fn: (args) => Math.asinh(1 / args[0]!) },
    'acsch':   { argc: 1, type: 'hyp', fn: (args) => Math.asinh(1 / args[0]!) },
    'arcsech': { argc: 1, type: 'hyp', fn: (args) => Math.acosh(1 / args[0]!) },
    'asech':   { argc: 1, type: 'hyp', fn: (args) => Math.acosh(1 / args[0]!) },
    'arccoth': { argc: 1, type: 'hyp', fn: (args) => Math.atanh(1 / args[0]!) },
    'acoth':   { argc: 1, type: 'hyp', fn: (args) => Math.atanh(1 / args[0]!) },
    //hyperbolic
    'sinh':   { argc: 1, type: 'hyp', fn: (args) => Math.sinh(args[0]!) },
    'cosh':   { argc: 1, type: 'hyp', fn: (args) => Math.cosh(args[0]!) },
    'tanh':   { argc: 1, type: 'hyp', fn: (args) => Math.tanh(args[0]!) },
    'tgh':    { argc: 1, type: 'hyp', fn: (args) => Math.tanh(args[0]!) },
    'csch':   { argc: 1, type: 'hyp', fn: (args) => 1 / Math.sinh(args[0]!) },
    'sech':   { argc: 1, type: 'hyp', fn: (args) => 1 / Math.cosh(args[0]!) },
    'coth':   { argc: 1, type: 'hyp', fn: (args) => 1 / Math.tanh(args[0]!) },
    
    //trigonometric inverse
    'arcsin': { argc: 1, type: 'trig', fn: (args) => Math.asin(args[0]!) },
    'asin':   { argc: 1, type: 'trig', fn: (args) => Math.asin(args[0]!) },
    'arccos': { argc: 1, type: 'trig', fn: (args) => Math.acos(args[0]!) },
    'acos':   { argc: 1, type: 'trig', fn: (args) => Math.acos(args[0]!) },
    'arctan': { argc: 1, type: 'trig', fn: (args) => Math.atan(args[0]!) },
    'arctg':  { argc: 1, type: 'trig', fn: (args) => Math.atan(args[0]!) },
    'atan':   { argc: 1, type: 'trig', fn: (args) => Math.atan(args[0]!) },
    'atg':    { argc: 1, type: 'trig', fn: (args) => Math.atan(args[0]!) },
    'arccsc': { argc: 1, type: 'trig', fn: (args) => Math.asin(1 / args[0]!) },
    'acsc':   { argc: 1, type: 'trig', fn: (args) => Math.asin(1 / args[0]!) },
    'arcsec': { argc: 1, type: 'trig', fn: (args) => Math.acos(1 / args[0]!) },
    'asec':   { argc: 1, type: 'trig', fn: (args) => Math.acos(1 / args[0]!) },
    'arccot': { argc: 1, type: 'trig', fn: (args) => Math.atan(1 / args[0]!) },
    'acot':   { argc: 1, type: 'trig', fn: (args) => Math.atan(1 / args[0]!) },
    //trigonometric
    'sin':   { argc: 1, type: 'trig', fn: (args) => Math.sin(args[0]!) },
    'cos':   { argc: 1, type: 'trig', fn: (args) => Math.cos(args[0]!) },
    'tan':   { argc: 1, type: 'trig', fn: (args) => Math.tan(args[0]!) },//sin/cos => cos != 0
    'tg':    { argc: 1, type: 'trig', fn: (args) => Math.tan(args[0]!) },
    'csc':   { argc: 1, type: 'trig', fn: (args) => 1 / Math.sin(args[0]!) },//sin != 0
    'sec':   { argc: 1, type: 'trig', fn: (args) => 1 / Math.cos(args[0]!) },//cos != 0
    'cot':   { argc: 1, type: 'trig', fn: (args) => 1 / Math.tan(args[0]!) },//cos/sin => sin != 0

    //arithmetic
    'add':   { argc: 2, type: 'arith', fn: (args) => args[0]! + args[1]! },
    'sub':   { argc: 2, type: 'arith', fn: (args) => args[0]! - args[1]! },
    'mul':   { argc: 2, type: 'arith', fn: (args) => args[0]! * args[1]! },
    'div':   { argc: 2, type: 'arith', fn: (args) => args[0]! / args[1]! },//arg1 != 0
    'sqrt':  { argc: 1, type: 'arith', fn: (args) => Math.sqrt(args[0]!) },//start at 0
    'root':  { argc: 2, type: 'arith', fn: (args) => Math.pow(args[0]!, 1 / args[1]!) },
    'power': { argc: 2, type: 'arith', fn: (args) => Math.pow(args[0]!, args[1]!) },
    'pow':   { argc: 2, type: 'arith', fn: (args) => Math.pow(args[0]!, args[1]!) },
    'ln':    { argc: 1, type: 'arith', fn: (args) => Math.log(args[0]!) },//arg != 0
    'log':   { argc: 1, type: 'arith', fn: (args) => Math.log10(args[0]!) },//arg != 0
    'exp':   { argc: 1, type: 'arith', fn: (args) => Math.exp(args[0]!) },
	'mod': { argc: 2, type: 'stat', fn: (args) => ((args[0]! % args[1]!) + args[1]!) % args[1]! },//k = arg2

    //binary
    'shl':   { argc: 2, type: 'bin', fn: (args) => args[0]! << args[1]! },
    'shr':   { argc: 2, type: 'bin', fn: (args) => args[0]! >> args[1]! },
    'not':   { argc: 1, type: 'bin', fn: (args) => ~args[0]! },
    'and':   { argc: 2, type: 'bin', fn: (args) => args[0]! & args[1]! },
    'or':    { argc: 2, type: 'bin', fn: (args) => args[0]! | args[1]! },
    'xor':   { argc: 2, type: 'bin', fn: (args) => args[0]! ^ args[1]! },
    
    //statistical
    'max':   { argc: 2, type: 'stat', fn: (args) => Math.max(args[0]!, args[1]!) },
    'min':   { argc: 2, type: 'stat', fn: (args) => Math.min(args[0]!, args[1]!) },
    'fac':   { argc: 1, type: 'stat', fn: (args) => args[0]! * gamma(args[0]!) },//lim: k, k = (-inf, 0>  

    //piecewise
    'abs':   { argc: 1, type: 'piece', fn: (args) => Math.abs(args[0]!) },
    'round': { argc: 1, type: 'piece', fn: (args) => Math.round(args[0]!) },
    'trunc': { argc: 1, type: 'piece', fn: (args) => Math.trunc(args[0]!) },
    'ceil':  { argc: 1, type: 'piece', fn: (args) => Math.ceil(args[0]!) },
    'floor': { argc: 1, type: 'piece', fn: (args) => Math.floor(args[0]!) },
    'sign':  { argc: 1, type: 'piece', fn: (args) => Math.sign(args[0]!) },
    'sgn':   { argc: 1, type: 'piece', fn: (args) => Math.sign(args[0]!) },
    
    //special functions (they need custom implementation)
    'sum':        { argc: 4, type: 'spec', fn: () => 0 },
    'prod':       { argc: 4, type: 'spec', fn: () => 0 },
    'derivative': { argc: 2, type: 'spec', fn: () => 0 },
    'der':        { argc: 2, type: 'spec', fn: () => 0 },
    'integrate':  { argc: 4, type: 'spec', fn: () => 0 },
    'int':        { argc: 4, type: 'spec', fn: () => 0 }
};

const operators: { [key: string]: { argc: number, fn: (args: number[]) => number, precedence: number, assoc: 'left' | 'right' | 'none' }} = {
    '!':  { argc: -1, fn: functions['fac']!.fn, precedence: 6, assoc: 'left' },
    '~':  { argc: 1, fn: functions['not']!.fn, precedence: 6, assoc: 'right' },
    '\\+': { argc: 1, fn: (args) => +args[0]!, precedence: 6, assoc: 'right' },
    '\\-': { argc: 1, fn: (args) => -args[0]!, precedence: 6, assoc: 'right' },

    '**':{ argc: 2, fn: functions['pow']!.fn, precedence: 5, assoc: 'right' },
    '^': { argc: 2, fn: functions['pow']!.fn, precedence: 5, assoc: 'right' },

    '*': { argc: 2, fn: functions['mul']!.fn, precedence: 4, assoc: 'left' },
    '·': { argc: 2, fn: functions['mul']!.fn, precedence: 4, assoc: 'left' },
    '×': { argc: 2, fn: functions['mul']!.fn, precedence: 4, assoc: 'left' },
    '/': { argc: 2, fn: functions['div']!.fn, precedence: 4, assoc: 'left' },
    //':': { argc: 2, fn: functions['div'].fn, precedence: 4, assoc: 'left' },
    '÷': { argc: 2, fn: functions['div']!.fn, precedence: 4, assoc: 'left' },
    '%': { argc: 2, fn: functions['mod']!.fn, precedence: 4, assoc: 'left' },

    //function without parenthesis

    '+': { argc: 2, fn: functions['add']!.fn, precedence: 3, assoc: 'left' },
    '-': { argc: 2, fn: functions['sub']!.fn, precedence: 3, assoc: 'left' },

    //'<<':{ argc: 2, fn: functions['shl'].fn, precedence: 6, assoc: 'left' },
    //'>>':{ argc: 2, fn: functions['shr'].fn, precedence: 6, assoc: 'left' },

    '=':  { argc: 2, fn: () => { throw 0 }, precedence: 2, assoc: 'none' },
    '>':  { argc: 2, fn: () => { throw 0 }, precedence: 2, assoc: 'none' },
    '<':  { argc: 2, fn: () => { throw 0 }, precedence: 2, assoc: 'none' },
    '>=': { argc: 2, fn: () => { throw 0 }, precedence: 2, assoc: 'none' },
    '<=': { argc: 2, fn: () => { throw 0 }, precedence: 2, assoc: 'none' },
    

    //',': { fn: '', precedence: 1, assoc: 'none' },
    //degrees
    //°º˚°˚∘
};

const constants: { [key: string]: number } = {
    'π': Math.PI,
    'τ': 2 * Math.PI,
    'e': Math.E,
    '∞': Infinity,
}


function problem(char: number, len: number, severity: Severity, desc: string) {
    return {desc, severity, char, len}
}


export class ExpressionParser{

    functions: Functions = {};
    variables: Variables = {};
    rules: SpecialRules = {
        isCustomFunction: false,
        isCustomVariable: false,
        useDegrees: false,
        resulution: 1//MUST NOT BE 0
    };

    problems: Problem[] = [];

    tokenStack: Token[] = [];//output of tokenize()
	outputQueue: Token[] = [];//output of parse()
	
	private expressionType = ExpressionType.UNKNOWN;//will be determined after parse()
    
    latexToString(input: string) {

        input = input.replaceAll(/\\left\|/g, ' abs(');
        input = input.replaceAll(/\\right\|/g, ')');

        //for now \left and \right are unnecessary
        input = input.replaceAll(/(\\left)|(\\right)/g, '');

        //basic functions
		input = input.replaceAll(/\\(sin|cos|tan|max|min|ln|log|exp|arcsin|arccos|arctan|sinh|cosh|tanh|sec|csc|cot|coth|cosec|cotan|ctg|arg|det|dim|gcd|hom|inf|ker|lg|lim|sup)/g, (_, p1) => ` ${p1}`);//deg|

        //any other function
        input = input.replaceAll(/\\operatorname{([^{}]*)}/g, (_, p1) => ` ${p1}`);

        //pi, tau, infinity, (theta)
        input = input.replaceAll(/\\(pi|tau|infty)/g, (_, p1) => ` ${p1}`);

        //multiply symbols
        input = input.replaceAll(/\\cdot/g, '*');
        input = input.replaceAll(/\\div/g, '/');
        input = input.replaceAll(/\\times/g, '*');
        input = input.replaceAll(/\\sim/g, '~');
        input = input.replaceAll(/\\%/g, '%');
        input = input.replaceAll(/\\ge/g, '>=');
        input = input.replaceAll(/\\le/g, '<=');

        //placeholders
        input = input.replaceAll(/\\placeholder({})?/g, '?');

        //space
        input = input.replaceAll(/\\ /g, ' ');

        let res = null;
        let iter = 0;
        //these commands can be self-contained
        do {

            //fraction
            input = input.replaceAll(/\\frac{([^{}]*)}{([^{}]*)}/g, (_, p1, p2) => `(${p1})/(${p2})`);

            //sqrt
            input = input.replaceAll(/\\sqrt{([^{}]*)}/g, (_, p1) => `sqrt(${p1})`);

            //sum, prod, coprod
            input = input.replaceAll(/\\(sum|prod|coprod)(?:(?:_{(?:([^{}=]*)=)?([^{}]*)})|_(.))(?:(?:\^{([^{}]*)})|\^(.))/g, (_, p1, p2, p3, p4, p5, p6) => `${p1}(${p3 ?? p4},${p5 ?? p6},${p2 ?? ''},`);

            //int
            input = input.replaceAll(/\\int(?:(?:_{([^{}]*)})|_(.))(?:(?:\^{([^{}]*)})|\^(.))(?:(.*)d([a-z]))?/g, (_, p1, p2, p3, p4, p5, p6) => `int(${p1 ?? p2},${p3 ?? p4},${p6},${p5})`);

            //derivative
            input = input.replaceAll(/\(d\)\/\(d([a-z])\)/g, (_, p1) => `derivative(${p1},`);

            //power
            input = input.replaceAll(/\^{([^{}]*)}/g, (_, p1) => `^(${p1})`);

            //x+\text{test}g\cdot x
            res = /\\([a-z]*)/gi.exec(input);
            if (res && !/frac|sqrt|sum|prod|coprod|int/g.test(res[1]!)) {
                throw new LatexParseError(`Unsupported LaTeX command '${res[1]}'.`);
            }
            
            iter++;
            if (iter > 500) {
                throw new LatexParseError(`Script was stuck in a loop. This is probably a bug. Try changing syntax.`);
            }
        } while (res);

        return input;
    }


    //
    //
    //
    // ._____________________________________.
    // |             | N | F | V | O | L | R |
    // |-------------|---|---|---|---|---|---|
    // | Number      | . | * | * | . | * | . |
    // | Function    | x | x | x | ^ | . | x |
    // | Variable    | * | * | * | . | * | . |
    // | Operator    | . | . | . | x | . | . |
    // | Left paren  | . | . | . | x | . | . |
    // | Right paren | * | * | * | . | * | . |
    // |-------------|---|---|---|---|---|---|
    //
    // * - add multiply operator
    // . - don't add anything, valid syntax
    // x - invalid syntax, throw error
    // ^ - only unary operators are valid (and power (i.e. sin^2(x)))
    //

    //tokenizes a string into individual tokens
    tokenize(expression: string) {

        //let charStack = '';
        this.problems = [];
        this.tokenStack = [];
        this.outputQueue = [];

        //remove all whitespace
        //expression = expression.trim();
        expression = expression.replace(/\s+/g, '');

        if (!expression.length) {
            this.problems.push(problem(0, 0, Severity.WARNING, 'Expression is empty.'));
            return this;
        }

        //check custom functions and variables here
        if (this.rules.isCustomFunction) {
            if (!/^[a-z]+\(([a-z],)*[a-z]?\)=.+/i.test(expression)) {
                this.problems.push(problem(0, 0, Severity.ERROR, `Invalid function declaration. Use something like 'fn(a,b) = sin(a)+b'.`));
            }
        }
        else if (this.rules.isCustomVariable) {
            if (!/^[a-z]=.+/i.test(expression)) {
                this.problems.push(problem(0, 0, Severity.ERROR, `Invalid variable declaration. Use something like 'a = 2' or 'b = 3a'.`));
            }
            // if (this.rules.isCustomVariable && i === 0 && (token.type == TokenType.VARIABLE &&
            //     /[deixy]/.test(token.name))) {
            //     this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Using one of reserved variable names '${token.name}'. Try using a different one.`));
            // }
            if (/^[deixy]=.+/.test(expression)) {
                this.problems.push(problem(0, 0, Severity.ERROR, `Using one of reserved variable names. Try using a different one.`));
            }
        }

        //number: /^([0-9\.]+(\d*[eE]*[-+]*\d+)?)/
        //letter: /^[a-z]+/i
        //lparen: /^\(|\[|\{/
        //rparen: /^\)|\]|\}/
        //quote : /^\'|\"|\`/
        //equal : /^(=|[<>]=?)/, /^[<>]?(?![<>])=?/
        //operator: /^\*\*|[!~*·×^÷/%+\-]|<<|>>/

        let res: RegExpExecArray | null;
        let pos = 0;
        let iter = 0;

        while (expression.length) {
            iter++;
            if (iter > 1000) {
                problem(0, 0, Severity.ERROR, `Script was stuck in a loop. This is probably a bug. Try changing syntax.`);
                break;
            }

            //match number
            res = /^(\d*)(\.)?(\d+)([eE][-+]?\d+)?/.exec(expression);//old: /^([0-9\.]+(\d*[eE]*[-+]*\d+)?)/
            if (res) {
                this.tokenStack.push({ type: TokenType.NUMBER, value: parseFloat(res[0]!), name: res[0]!, pos });
                pos += res[0]!.length;
                expression = expression.slice(res[0]!.length);
                continue;
            }

            //match letter (function or variable)
            res = /^[a-z]+/i.exec(expression);
            if (res) {
                let charStack = res[0]!;
                //this is valid only in the beginning
                if (this.rules.isCustomFunction && iter === 1) {
                    this.tokenStack.push({ type: TokenType.FUNCTION, name: res[0]!, pos });
                }
                else {
                    charstackLoop: while (charStack.length) {
                        const searchForFunction = (fn: string) => {
                            if (charStack.search(new RegExp(`^${fn}`)) !== -1) {
                                //found function
                                charStack = charStack.substring(fn.length);
                                this.tokenStack.push({ type: TokenType.FUNCTION, name: fn, pos });
                                pos += fn.length;
                                return true;
                            }
                            return false;
                        }
                        //functions have to be sorted from longest to shortest
                        for (const fn in functions) {
                            if (searchForFunction(fn)) continue charstackLoop;
                        }
                        //look also for custom functions
                        for (const fn in this.functions) {
                            if (searchForFunction(fn)) continue charstackLoop;
                        }
                        //it can be constant
                        const res2 = /^(pi|tau|e|infinity|infty|inf)/.exec(charStack);
                        if (res2) {
                            charStack = charStack.slice(res2[0]!.length);
                            let val = '';
                            switch (res2[0]) {
                                case 'pi':
                                    val = 'π';
                                    break;
                                case 'tau':
                                    val = 'τ';
                                    break;
                                case 'e':
                                    val = 'e';
                                    break;
                                case 'infinity':
                                case 'infty':
                                case 'inf':
                                    val = '∞';
                                    break;
                            }
                            this.tokenStack.push({ type: TokenType.NUMBER, value: constants[val], name: res[0]!, pos });
                            pos += res2[0]!.length;
                            continue charstackLoop;
                        }
                        this.tokenStack.push({ type: TokenType.VARIABLE, name: charStack[0]!, pos });
                        //pop from front
                        charStack = charStack.substring(1);
                        pos++;
                    }
                }
                //pos += res[0].length;
                expression = expression.slice(res[0]!.length);
                continue;
            }

            //match constants
            res = /^[πτe∞]/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.NUMBER, value: constants[res[0]!], name: res[0]!, pos });
                pos += res[0]!.length;
                expression = expression.slice(res[0]!.length);
                continue;
            }

            //match operator
            res = /^(\*\*|>=|<=|[+\-*·×^/÷~!><%=])/.exec(expression);///^(\*\*|[!~*·×^÷:/%+\-]|<<|>>)/
            if (res) {
                const prevLength = res[0]!.length;
                //unary plus and minus
                if ((res[0] == '-' || res[0] == '+')) {
                    switch (this.tokenStack.at(-1)?.type) {
                        case TokenType.NUMBER:
                        case TokenType.VARIABLE:
                        case TokenType.RPAREN:
                            break;
                        default:
                            res[0] = '\\' + res[0];
                    }
                }
                this.tokenStack.push({ type: TokenType.OPERATOR, name: res[0]!, pos });
                pos += prevLength;
                expression = expression.slice(prevLength);
                continue;
            }

            //match left parenthesis
            res = /^(\(|\[|\{)/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.LPAREN, name: res[0]!, pos });
                pos += res[0]!.length;
                expression = expression.slice(res[0]!.length);
                continue;
            }

            //match right parenthesis
            res = /^(\)|\]|\})/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.RPAREN, name: res[0]!, pos });
                pos += res[0]!.length;
                expression = expression.slice(res[0]!.length);
                continue;
            }

            //match comma
            res = /^,/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.COMMA, name: res[0]!, pos });
                pos += res[0]!.length;
                expression = expression.slice(res[0]!.length);
                continue;
            }

            this.problems.push(problem(pos, 1, Severity.ERROR, `Illegal character '${expression[0]}', ignoring it.`));
            expression = expression.slice(1);
        }
        //console.log('Tokenized:');
        //console.log(this.tokenStack);
        if (this.problems.length) {
            throw new ParserFatalError('Tokenization error.');
        }

        return this;
    }

    //check syntax of tokenized expression and add missing tokens '*', '(' and ')' where necessary
    checkSyntax(existingName: string = '', tokens: Token[] = this.tokenStack) {
        tokenLoop: for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]!;
            const prevToken = tokens[i - 1];
            const nextToken = tokens[i + 1];
            if (this.rules.isCustomFunction && i === 0 && token.type != TokenType.FUNCTION) {
                this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Invalid token in function declaration. This message shouldn't appear, this is probably a bug.`));
            }
            if (this.rules.isCustomVariable && i === 0 && (token.type != TokenType.VARIABLE ||
                nextToken?.type != TokenType.OPERATOR || nextToken.name != '=')) {
                this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Invalid variable declaration. This message shouldn't appear, this is probably a bug.`));
            }
            switch (token?.type) {
                // @ts-expect-error
                case TokenType.NUMBER:
                    if (nextToken?.type == TokenType.NUMBER && !nextToken.name) {
                        //if it has name, it was a constant
                        this.problems.push(problem(nextToken.pos, 1, Severity.ERROR, `Number ${nextToken.value?.toString()} has unknown meaning.`));
                        continue;
                    }
                    // FALLS THROUGH
                // @ts-expect-error
                case TokenType.VARIABLE:
                    if (this.rules.isCustomVariable && i === 0) {
                        //check for redefinition
                        if (this.variables[token.name] && token.name != existingName) {
                            this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Variable '${token.name}' already exists. Try using different name.`));
                        }
                    }
                    // FALLS THROUGH
                case TokenType.RPAREN:
                    if (nextToken?.type == TokenType.FUNCTION ||
                        nextToken?.type == TokenType.NUMBER ||
                        nextToken?.type == TokenType.VARIABLE ||
                        nextToken?.type == TokenType.LPAREN) {
                        tokens.splice(i + 1, 0, insertMultiplyToken(token.pos));
                    }
                    break;
                case TokenType.FUNCTION:

                    if (this.rules.isCustomFunction && i === 0) {
                        //check for redefinition
                        if ((functions[token.name] || this.functions[token.name]) && token.name != existingName) {
                            this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Function '${token.name}' already exists. Try using different name.`));
                        }
                        if (nextToken?.name != '(') {
                            this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Custom functions require parentheses.`));
                        }
                        break;
                    }

                    //add second (missing) parenthesis
                    if (token.name == 'sum' || token.name == 'prod' || token.name == 'derivative') {
                        let scope = 0;
                        let commas = 0;
                        let endPos = tokens.length;
                        for (let j = i + 2; j < tokens.length; j++) {
                            if (tokens[j]!.type == TokenType.LPAREN) {
                                scope++;
                                continue;
                            }
                            else if (tokens[j]!.type == TokenType.RPAREN) {
                                if (scope !== 0) {
                                    scope--;
                                    continue;
                                }
                                endPos = j;
                                break;
                            }
                            else if (scope === 0 && tokens[j]!.type == TokenType.COMMA) {
                                commas++;
                            }
                            else if (scope === 0 && (tokens[j]!.type == TokenType.OPERATOR &&
                                (operators[tokens[j]!.name]?.precedence ?? 0) <= operators['+']!.precedence)) {
                                endPos = j;
                                break;
                            }
                        }
                        tokens.splice(endPos, 0, { type: TokenType.RPAREN, name: ')', pos: endPos });
                        //i--
                        //continue tokenLoop;
                    }
                    //valid cases:
                    //   sin(x)   -> sin(x)
                    //   sin2     -> sin(2)
                    //   sin-2    -> sin(-2)
                    //   sinsinx  -> sin(sin(x))
                    //   sinx     -> sin(x)
                    //   sin^-1x  -> arcsin(x)
                    //   sin^2x   -> sin(x)^2
                    //   sin^-1(x)-> arcsin(x)
                    //   sin^2(x) -> sin(x)^2
                    //
                    //invalid cases:
                    //   sin
                    //   sin)
                    //   sin*
                    //   sin
                    // ...anything else
                    // let addPow2 = false;
                    switch (nextToken?.type) {
                        // @ts-expect-error
                        case TokenType.OPERATOR:
                            if (nextToken.name == '^' && (functions[token.name]?.type == 'trig' || functions[token.name]?.type == 'hyp')) {
                                // sin^2
                                //if (tokens[i + 2]?.type == TokenType.NUMBER && tokens[i + 2]?.value == 2) {
                                //    
                                //}
                                // sin^-1
                                if (tokens[i + 2]?.type == TokenType.LPAREN &&
                                    tokens[i + 3]?.type == TokenType.OPERATOR &&
                                    tokens[i + 3]?.name == '\\-' &&
                                    tokens[i + 4]?.type == TokenType.NUMBER &&
                                    tokens[i + 4]?.value == 1)
                                {
                                    const r = /^(?:arc|a)(.*)/.exec(token.name!);
                                    if (r) {
                                        //arcsin^-1 -> sin
                                        token.name = r[1]!;
                                    }
                                    else {
                                        //sin^-1 -> arcsin
                                        token.name = 'arc' + token.name;
                                    }
                                    tokens.splice(i + 1, 5);
                                    //check if next operator is unary
                                    // if (tokens[i + 1]?.type == TokenType.OPERATOR &&
                                    //     tokens[i + 1].name == '+' || tokens[i + 1].name == '-')
                                    // {
                                    //     tokens[i + 1].name = '\\' + tokens[i + 1].name;
                                    // }
                                    //now repeat with modified name
                                    i--;
                                    continue tokenLoop;
                                }
                                else {
                                    this.problems.push(problem(token.pos, 1, Severity.ERROR, `Only ${token.name}<sup>-1</sup> is supported, try adding parentheses.`));
                                }
                            }
                            //not unary operator
                            else if (!(operators[nextToken.name]?.argc === 1/*nextToken.name == '+' || nextToken.name == '-'*/)) {
                                this.problems.push(problem(nextToken.pos, 1, Severity.ERROR, `Invalid token '${nextToken.name}', expected '(', function name, variable or number.`));
                            }
                            // FALLS THROUGH
                        case TokenType.NUMBER:
                        case TokenType.FUNCTION:
                        case TokenType.VARIABLE:
                            if ((functions[token.name]?.argc ?? 0) > 1) {
                                this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Functions with more than 1 argument require parentheses.`));
                            }
                            //parentheses are missing, so insert them
                            tokens.splice(i + 1, 0, { type: TokenType.LPAREN, name: '(', pos: i + 1 });
                            let endPos = tokens.length;
                            for (let j = i + 2; j < tokens.length; j++) {
                                if (!(tokens[j]?.type == TokenType.NUMBER ||
                                    tokens[j]?.type == TokenType.FUNCTION ||
                                    tokens[j]?.type == TokenType.VARIABLE ||
                                    (tokens[j]?.type == TokenType.OPERATOR &&
                                    (operators[tokens[j]!.name]?.precedence ?? 0) > operators['+']!.precedence)))
                                {
                                    if (tokens[j]?.type == TokenType.OPERATOR ||
                                        tokens[j]?.type == TokenType.RPAREN) {
                                        endPos = j;
                                        break;
                                    }
                                    else {
                                        this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Try adding parentheses to function '${token.name}'.`));
                                        break;
                                    }
                                }
                            }
                            tokens.splice(endPos, 0, { type: TokenType.RPAREN, name: ')', pos: endPos });
                            i--
                            continue tokenLoop;
                            //console.log(tokens);
                            //if (addPow2) {
                            //    tokens.splice(endPos + 1, 0, { type: TokenType.OPERATOR, name: '^', pos: endPos + 1 });
                            //    tokens.splice(endPos + 2, 0, { type: TokenType.NUMBER, name: '2', value: 2, pos: endPos + 2 });
                            //}
                            break;
                        case TokenType.LPAREN:
                            break;
                        case TokenType.RPAREN:
                        case undefined:
                            this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Expected function argument for function '${token.name}'.`));
                            break;
                        default:
                            this.problems.push(problem(nextToken?.pos ?? 0, 1, Severity.ERROR, `Invalid token '${nextToken?.name}', expected '(', function name, variable or number.`));

                    }
                    break;
                case TokenType.OPERATOR:
                    if (!token.name) {
                        this.problems.push(problem(token.pos, 0, Severity.ERROR, `Unknown operator.`));
                        continue tokenLoop;
                    }
                    //check left-side arg
                    if (operators[token.name]?.argc !== 1) {
                        if (!prevToken ||
                            !(prevToken.type == TokenType.NUMBER ||
                            prevToken.type == TokenType.VARIABLE ||
                            prevToken.type == TokenType.RPAREN)) {
                            //if (nextToken && (token.name == '+' || token.name == '-')) {
                            //    //unary operators have \
                            //    token.name = '\\' + token.name;
                            //}
                            //else {
                                this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Missing left-side argument for operator '${token.name}'.`));
                                tokens.splice(i, 1);
                                i--;
                                continue tokenLoop;
                            //}
                        }
                    }
                    //check right-side arg
                    if ((operators[token.name]?.argc ?? 0) > 0) {
                        if (!nextToken ||
                            !(nextToken.type == TokenType.NUMBER ||
                            nextToken.type == TokenType.VARIABLE ||
                            nextToken.type == TokenType.FUNCTION ||
                            nextToken.type == TokenType.OPERATOR ||
                            nextToken.type == TokenType.LPAREN)) {
                            this.problems.push(problem(token.pos, token.name.length, Severity.ERROR, `Missing right-side argument for operator '${token.name}'.`));
                            tokens.splice(i, 1);
                            i--;
                        }
                    }
                    break;
                case TokenType.LPAREN:

                    if (nextToken?.type == TokenType.RPAREN) {
                        //empty parentheses, remove them

                        tokens.splice(i, 2);
                        //decrease index and repeat
                        i--;
                        continue tokenLoop;
                    }
                    break;
            }

        }

        if (this.problems.length) {
            throw new ParserFatalError('Syntax error');
        }

        //console.log(this.tokenStack);
        return this;
    }


    parse(tokens: Token[] = this.tokenStack, destination: Token[] = this.outputQueue) {

        const popStack = () => {
            while (operatorStack.length) {
                const op = operatorStack.pop();
                if (!op || op.type == TokenType.LPAREN || op.type == TokenType.RPAREN) {
                    this.problems.push(problem(op?.pos ?? 0, op?.name.length ?? 0, Severity.ERROR, `Mismatched parentheses`));
                    throw new ParserFatalError('Parse error');
                }
                destination.push(op!);
            }
        }

        const operatorStack: Token[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]!;

            switch (token.type) {
                case TokenType.VARIABLE:
                case TokenType.NUMBER:
                    destination.push(token);
                    break;
                case TokenType.FUNCTION:
                    let scope = 0;
                    let args: Token[][] = [];
                    let currentStart = i + 2;
                    for (let j = currentStart; j < tokens.length; j++) {
                        if (tokens[j]!.type == TokenType.LPAREN) {
                            scope++;
                            continue;
                        }
                        else if (tokens[j]!.type == TokenType.RPAREN) {
                            if (scope !== 0) {
                                scope--;
                                continue;
                            }
                            let arg = tokens.slice(currentStart, j);
                            //if there is no argument, don't push it to args
                            if (args.length || arg.length) {
                                args.push(arg);
                                i = j;
                            }
                            break;
                        }
                        else if (scope === 0 && tokens[j]!.type == TokenType.COMMA) {
                            args.push(tokens.slice(currentStart, j));
                            currentStart = j + 1;
                        }
                    }
                    let parsedArgs: Token[][] = [];
                    //now recursively process all arguments
                    for (let k = 0; k < args.length; k++) {
                        //TODO fix this can't work
                        // if (this.rules.isCustomFunction && i === 0 && (args[k].length !== 1 || args[k][0].type != TokenType.VARIABLE)) {
                        //     this.problems.push(problem(args[k][0].pos, args[k][0].name.length, Severity.ERROR, `Parameter of custom function must be a variable.`));
                        // }
                        parsedArgs[k] = [];
                        this.parse(args[k], parsedArgs[k]);
                    }
                    token.arguments = parsedArgs;
                    destination.push(token);
                    break;
                case TokenType.OPERATOR:
                    if ((operators[token.name]?.argc ?? 0) < 0) {
                        //operators which are written after operand (such as '!')
                        destination.push(token);
                        break;
                    }
                    else if (operators[token.name]?.precedence == operators['=']!.precedence) {
                        //equality operators must be kept in place
                        popStack();
                        destination.push(token);
                        break;
                    }
                    let top = operatorStack.at(-1);
                    while (top && top.type != TokenType.LPAREN && (operators[top.name]!.precedence > operators[token.name]!.precedence || (operators[top.name]?.precedence === operators[token.name]?.precedence && operators[token.name]?.assoc === 'left'))) {
                        operatorStack.pop();
                        destination.push(top);
                        top = operatorStack.at(-1);
                    }
                    operatorStack.push(token);
                    break;
                case TokenType.LPAREN:
                    operatorStack.push(token);
                    break;
                case TokenType.RPAREN:
                    while (operatorStack.at(-1)?.type != TokenType.LPAREN) {
                        const lastOp = operatorStack.pop();
                        if (!lastOp) {
                            this.problems.push(problem(token.pos, 1, Severity.ERROR, `Mismatched parentheses: missing left parenthesis '('`));
                            throw new ParserFatalError('Parse error');
                        }
                        destination.push(lastOp);
                    }
                    const lparen = operatorStack.pop();
                    if (!lparen || lparen.type != TokenType.LPAREN) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Mismatched parentheses: missing right parenthesis ')'`));
                        throw new ParserFatalError('Parse error');
                    }
                    const pop = operatorStack.at(-1);
                    if (pop && pop.type == TokenType.FUNCTION) {
                        operatorStack.pop();
                        destination.push(pop);
                    }
                    break;
            }
        }

        if (this.problems.length) {
            throw new ParserFatalError('Parse error.');
        }

		popStack();
		
		//determine expression type
        
		if (this.rules.isCustomFunction) {
			return ExpressionType.CUSTOM_FUNCTION;
		}
		else if (this.rules.isCustomVariable) {
			return ExpressionType.CUSTOM_VARIABLE;
		}
		const i = tokens.findIndex(e => e.type == TokenType.OPERATOR && operators[e.name]?.precedence == operators['=']!.precedence);///^(<|>|<=|>=|=)/.test(e.name)
		if (i > -1) {
			if (tokens[i]?.name != '=') {
				return ExpressionType.INEQUALITY;
			}
			const left = tokens.slice(0, i);
			if (left.length == 1 && left[0]?.type == TokenType.VARIABLE) {
				if (left[0]?.name == 'y') {
					//regular function
					return ExpressionType.FUNCTION;
				}
				else if (left[0]?.name == 'x') {
					//function x in terms of y
					return ExpressionType.YFUNCTION;
				}
				return ExpressionType.VARIABLE;
			}
			//generic equation
			return ExpressionType.EQUATION;
		}
		//look for x or y variables recursively
		const traverseTokens = (tokenList: Token[]): boolean => {
			for (const token of tokenList) {
				if (token.type == TokenType.FUNCTION && token.arguments) {
					for (const arg of token.arguments) {
						if (traverseTokens(arg)) {
							return true;
						}
					}
				}
				else if (token.type == TokenType.VARIABLE && (token.name == 'x' || token.name == 'y')) {
					return true;
				}
			}
			return false;
		}
		//no equal sign: regular function or constant expression
		if (traverseTokens(tokens)) {
			return ExpressionType.FUNCTION;
		}
		//no variables -> constant
		return ExpressionType.CONSTANT_RESULT;


        return this;
    }

    evaluate(tokens: Token[] = this.outputQueue): number/*{ result: number, asymptotes: number[] }*/{
        const eq = tokens.findIndex(e => e.type == TokenType.OPERATOR && e.name == '=');
        switch (this.getExpressionType()) {
			case ExpressionType.FUNCTION:
			case ExpressionType.CONSTANT_RESULT:
                let tok = tokens;
                if (eq > -1) {
                    tok = tokens.slice(eq + 1);
                }
                return this.evaluateInternal(tok);
            case ExpressionType.YFUNCTION:
                let tok2 = tokens;
                if (eq > -1) {
                    tok2 = tokens.slice(eq + 1);
                }
                return this.evaluateInternal(tok2);
            case ExpressionType.EQUATION:
                if (eq > -1) {
                    const left = tokens.slice(0, eq);
                    const right = tokens.slice(eq + 1);
                    return Math.abs(this.evaluateInternal(left) - this.evaluateInternal(right)) <= this.rules.resulution*2 ? 1 : 0;//1/this.variables['res']
                }
                this.problems.push(problem(0, 0, Severity.ERROR, `Internal error: expression is equality and is missing '='`));
                throw new ParserFatalError('Evaluate error');
            case ExpressionType.INEQUALITY:
                this.problems.push(problem(0, 0, Severity.ERROR, `Inequalities are currently not supported.`));
                throw new ParserFatalError('Evaluate error');
            case ExpressionType.CUSTOM_FUNCTION:
                const fn = tokens[0];
                if (eq > -1) {
                    // functions[tokens[0].name] = {
                    //     argc: fn.arguments?.length ?? 0, type: 'custom', fn: (args) => {
                    //         return this.evaluateInternal(tokens.slice(eq + 1));
                    //     }
                    // };
                    const args: string[] = [];
                    for (let i = 0; i < (fn?.arguments?.length ?? 0); i++) {
                        args.push(fn!.arguments![i]![0]!.name);
                    }
                    this.functions[tokens[0]!.name] = { args, fn: tokens.slice(eq + 1),  };
                }
                return NaN;
            case ExpressionType.CUSTOM_VARIABLE:
                const variable = tokens[0];
                if (eq > -1) {
                    this.variables[variable!.name] = tokens.slice(eq + 1);
                }
                return NaN;
            //case ExpressionType.POLAR:
            default:
                this.problems.push(problem(0, 0, Severity.ERROR, `This type of expression is currently not supported.`));
                throw new ParserFatalError('Evaluate error');
        }
    }

    private evaluateInternal(tokens: Token[] = this.outputQueue): number/*{result: number, asymptotes: number[]}*/ {
        let tmpStack: number[] = [];
        let asymptotes: number[] = [];

        for (const token of tokens) {
            switch (token.type) {
                case TokenType.NUMBER:
                    tmpStack.push(token.value ?? NaN);
                    break;
                case TokenType.FUNCTION:
                    const custom = functions[token.name] === undefined;
                    const args: number[] = [];
                    const argc = Math.abs((custom ? this.functions[token.name]?.args.length : functions[token.name]?.argc) ?? 0);
                    if (!token.arguments) token.arguments = [];
                    const providedArgs = token.arguments.length;

                    if (providedArgs > argc) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Too much arguments: function '${token.name}' expects ${argc} arguments, ${providedArgs} provided.`));
                        while (token.arguments.length > argc) token.arguments?.pop();
                    }
                    else if (providedArgs < argc) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Not enough arguments: function '${token.name}' expects ${argc} arguments, ${providedArgs} provided.`));
                        throw new ParserFatalError('Evaluate error');
                    }

                    if (custom) {
                        //custom function
                        const fn = this.functions[token.name];
                        if (!fn) {
                            this.problems.push(problem(0, 0, Severity.ERROR, `Unknown function '${token.name}'.`));
                            throw new ParserFatalError('Evaluate error');
                        }
                        const oldVals: Token[][] = [];
                        for (let i = 0; i < fn.args.length; i++) {
                            if (this.variables[fn.args[i]!]) {
                                oldVals[i] = this.variables[fn.args[i]!]!;
                            }
                            this.variables[fn.args[i]!] = [];
                            this.variables[fn.args[i]!]![0] = { type: TokenType.NUMBER, pos: 0, value: this.evaluateInternal(token.arguments![i]), name: '' };
                        }
                        const result = this.evaluateInternal(fn.fn);
                        //cleanup
                        for (let i = 0; i < fn.args.length; i++) {
                            if (oldVals[i]) {
                                this.variables[fn.args[i]!] = oldVals[i]!;
                            }
                            else {
                                delete this.variables[fn.args[i]!];
                            }
                        }
                        tmpStack.push(result);
                        break;
                    }

                    //special functions
                    //sum(1/(2n-1)sin((2n-1)x),n,1,100)
                    //triangle: $$ -\frac{8}{\pi^2}\sum_{n=1}^{10}\frac{\left(-1\right)^n}{\left(2n-1\right)^2}\operatorname{sin}\left(2\pi\left(2n-1\right)x\right) $$
                    //sawtooth: $$ -\frac{2}{\pi}\sum_{n=1}^{10}\frac{-1^n}{n}\operatorname{sin}\left(2\pi nx\right) $$
                    //square
                    //sin(x)+1/3sin(3x)+1/5sin(5x)+1/7sin(7x)+1/9sin(9x)+1/11sin(11x)+1/13sin(13x)+1/15sin(15x)+1/17sin(17x)+1/19sin(19x)+1/21sin(21x)
                    // sum(from, to, var, expr)
                    if (token.name == 'sum' || token.name == 'prod') {
                        const start = this.evaluateInternal(token.arguments[0]);
                        const end = this.evaluateInternal(token.arguments[1]);
                        if (token.arguments[2]?.length !== 1 || token.arguments[2][0]?.type != TokenType.VARIABLE) {
                            this.problems.push(problem(token.pos, 1, Severity.ERROR, `Second argument to '${token.name}' function must be a variable name (for example 'n').`));
                            throw new ParserFatalError('Evaluate error');
                        }
                        const variable = token.arguments[2]![0]!.name;
                        let oldvar = this.variables[variable];
                        this.variables[variable] = [];

                        let result = 0;
                        for (let i = start; i < end; i++){
                            this.variables[variable]![0] = { type: TokenType.NUMBER, pos: 0, value: i, name: '' };
                            if (token.name == 'sum') {
                                result += this.evaluateInternal(token.arguments[3]);
                            }
                            else {
                                result *= this.evaluateInternal(token.arguments[3]);
                            }
                        }
                        delete this.variables[variable];
                        if (oldvar) {
                            this.variables[variable] = oldvar;
                        }
                        tmpStack.push(result);
                        break;
                    }
                    else if (token.name == 'der' || token.name == 'derivative') {
                        if (token.arguments[0]?.length !== 1 || token.arguments[0][0]?.type != TokenType.VARIABLE) {
                            this.problems.push(problem(token.pos, 1, Severity.ERROR, `Second argument to '${token.name}' function must be a derivation variable name (for example 't').`));
                            throw new ParserFatalError('Evaluate error');
                        }
                        const variable = token.arguments[0][0].name;
                        const prevX = this.getVariable(variable);
                        if (!prevX) {
                            tmpStack.push(Infinity);
                            break;
                        }
                        const y1 = this.evaluateInternal(token.arguments[1]);
                        const dx = 1e-6;
                        this.setVariable(variable, prevX - dx);
                        const y2 = this.evaluateInternal(token.arguments[1]);
                        this.setVariable(variable, prevX);
                        tmpStack.push((y1 - y2) / dx);
                        break;
                    }
                    // integrate(from, to, var, expr)
                    else if (token.name == 'int' || token.name == 'integrate') {
                        const start = this.evaluateInternal(token.arguments[0]);
                        const end = this.evaluateInternal(token.arguments[1]);
                        if (token.arguments[2]?.length !== 1 || token.arguments[2][0]?.type != TokenType.VARIABLE) {
                            this.problems.push(problem(token.pos, 1, Severity.ERROR, `Second argument to '${token.name}' function must be a integration variable name (for example 't').`));
                            throw new ParserFatalError('Evaluate error');
                        }
                        const variable = token.arguments[2][0].name;
                        const oldvar = this.getVariable(variable);
                        const step = this.rules.resulution;
                        let result = 0;
                        if (end < start) {
                            for (let i = start; i > end; i -= step) {
                                this.setVariable(variable, i);
                                result += -step * this.evaluateInternal(token.arguments[3]);
                            }
                        }
                        else {
                            for (let i = start; i < end; i += step) {
                                this.setVariable(variable, i);
                                result += step * this.evaluateInternal(token.arguments[3]);
                            }
                        }
                        if (oldvar) {
                            this.setVariable(variable, oldvar);
                        }
                        else {
                            this.deleteVariable(variable);
                        }
                        tmpStack.push(result);
                        break;
                    }

                    // if (token.name == 'log') {
                    //     const vars = structuredClone(variables);
                    //     vars['x'] = 0;
                    //     asymptotes.push(-this.evaluateInternal(vars, token.arguments[0]).result);
                    // }

                    //recursively evaluate all arguments
                    for (const arg of token.arguments) {
                        const res = this.evaluateInternal(arg);
                        args.push(res);
                        //asymptotes = asymptotes.concat(res.asymptotes);
                    }

                    //goniometric functions have one hidden argument (degrees/radians)
                    if (functions[token.name]?.type == 'trig' || functions[token.name]?.type == 'hyp') {
                        args[0] *= this.rules.useDegrees ? Math.PI / 180 : 1;
                    }
                    tmpStack.push(functions[token.name]!.fn(args));
                    break;
                case TokenType.VARIABLE:
                    if (this.variables[token.name] === undefined) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Variable '${token.name}' is not defined.`));//Value for variable '${token.value}' was not provided
                        throw new ParserFatalError('Evaluate error');
                    }
                    const val = this.evaluateInternal(this.variables[token.name]);
                    tmpStack.push(val);
                    break;
                case TokenType.OPERATOR:
                {
                    const args: number[] = [];
                    const argc = Math.abs(operators[token.name]!.argc);

                    for (let i = 0; i < argc; i++) {
                        const arg = tmpStack.pop();
                        if (arg === undefined) {
                            this.problems.push(problem(i, 0, Severity.ERROR, `Internal Error: Not enough arguments for operator '${token.name}'.`));
                            throw new ParserFatalError('Evaluate error');
                        }
                        args.push(arg);
                    }
                    args.reverse();
                    tmpStack.push(operators[token.name]!.fn(args));
                }
                    break;
            }
        }

        if (this.problems.length) {
            throw new ParserFatalError('Evaluate error');
        }

        //console.log(tmpStack);
        // this.result = tmpStack[0];
        // return this;
        return tmpStack[0]!;
        //return { result: tmpStack[0], asymptotes: asymptotes };
    }


    // static evaluateJSON(input: string, variables: Variables) {
    //     const obj = JSON.parse(input);
    //     let tmpStack: number[] = [];

    //     if (!Array.isArray(obj)) {
    //         throw 0;
    //     }

    //     for (const item of obj) {

    //         let type = 'unknown';
    //         if (typeof item == 'number') {
    //             type = 'number'
    //         }
    //         else if (typeof item == 'object' && typeof item?.num == 'string') {
    //             type = 'numberAsObject';
    //         }
    //         else if (typeof item == 'string') {
    //             if (item[0] === "'") {
    //                 if (item.at(-1) === "'") {
    //                     type = 'string';
    //                 }
    //                 else {
    //                     type = 'stringInvalid';
    //                 }
    //             }
    //             else {
    //                 type = 'symbol';
    //             }
    //         }
    //         else if (Array.isArray(item) && item.length) {
    //             type = 'function';
    //         }
    //         else if (typeof item == 'object') {
    //             if (typeof item?.num == 'string') {
    //                 type = 'numberAsObject';
    //             }
    //             else if (typeof item?.sym == 'string') {
    //                 type = 'symbolAsObject';
    //             }
    //             else if (Array.isArray(item?.fn)) {
    //                 type = 'functionAsObject';
    //             }
    //             else if (typeof item?.str == 'string') {
    //                 type = 'stringAsObject';
    //             }
    //             else if (typeof item?.dict == 'object') {
    //                 type = 'functionAsObject';
    //             }
    //             else {
    //                 type = 'invalidObject';
    //             }
    //         }
    //         else {
    //             'invalid';
    //         }
    //         console.log(type);
    //     }
    // }


    // updateCustomFunctions() {
    //     for (const name in this.functions) {
    //         const fn = this.functions[name];
    //         functions[name] = {
    //             argc: fn.args.length, type: 'custom', fn: (args) => {
    //                 const oldVals: Token[][] = [];
    //                 for (let i = 0; i < fn.args.length; i++) {
    //                     if (this.variables[fn.args[i]]) {
    //                         oldVals[i] = this.variables[fn.args[i]];
    //                     }
    //                     this.variables[fn.args[i]] = [];
    //                     this.variables[fn.args[i]][0] = { type: TokenType.NUMBER, pos: 0, value: args[i], name: '' };
    //                 }
    //                 const result = this.evaluateInternal(fn.fn);
    //                 //cleanup
    //                 for (let i = 0; i < fn.args.length; i++) {
    //                     if (oldVals[i]) {
    //                         this.variables[fn.args[i]] = oldVals[i];
    //                     }
    //                     else {
    //                         delete this.variables[fn.args[i]];
    //                     }
    //                 }
    //                 return result;
    //             }
    //         };
    //     }
    // }


    setVariable(name: string, value: number) {
        if (!this.variables.name) {
            this.variables[name] = [];
            this.variables[name]![0] = { type: TokenType.NUMBER, pos: 0, value, name: '' };
            return;
        }
        this.variables[name]![0]!.value = value;
    }

    getVariable(name: string) {
        return this.variables[name]?.at(0)?.value;
    }

    deleteVariable(name: string) {
        delete this.variables[name];
    }


    getExpressionType(): ExpressionType {
		return this.expressionType;
    }

    getSupportedFunctions() {
        //except: sqrt sum prod coprod int
        let fun = '';
        for (const fn in functions) {
            if (/sqrt|sum|prod|coprod|int/.test(fn)) continue;
            fun += fn + ' ';
        }
        return fun.trimEnd();
    }

    getAutoParenthesisedFunctions() {
        let fun = '';
        for (const fn in functions) {
            if (functions[fn]!.argc < 2) continue;
            fun += fn + ' ';
        }
        return fun.trimEnd();
    }
}

function insertMultiplyToken(pos: number): Token{
    return { type: TokenType.OPERATOR, name: '*', pos };
}

const g = 7;
const C = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

// https://en.wikipedia.org/wiki/Lanczos_approximation
const gamma = (z: number): number => {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    else {
        z--;

        let x = C[0]!;
        for (let i = 1; i < g + 2; i++) x += C[i]! / (z + i);

        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
};


export function sine(x: number, frequency: number, amplitude: number, phase: number, bias: number) {
    return amplitude / 100 * Math.sin(frequency * x / 1000 * 2 * Math.PI - phase / 180 * Math.PI);
}

export function square(x: number, frequency: number, amplitude: number, duty: number, phase: number, bias: number) {
    return amplitude / 100 * (mod(frequency * x / 1000 - phase / 360, 1) < (duty / 100) ? 1 : -1);
}

export function triangle(x: number, frequency: number, amplitude: number, skew: number, phase: number, bias: number) {
    amplitude /= 50;
    skew /= 100;
    const period = 1000 / frequency;
    x -= phase / 360 * period;
    x += skew * period / 2;
    x = mod(x, period);
    const freq = (frequency * x / 1000) * 2;
    return (x < skew * period ? mod(freq / (2 * skew), 1) : mod(-(freq - 2 * skew) / (2 * (1 - skew)), 1)) * amplitude - amplitude / 2;
}

function mod(x: number, m: number) {
    return ((x % m) + m) % m;
}
