interface Problem {
    //name: string,
    desc: string,
    severity: Severity,
    char: number,
    len: number
}

class ParserFatalError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ParserFatalError';
    }
}

enum Severity{
    INFO,
    WARNING,
    ERROR,
    FATAL_ERROR
}

enum TokenType{
    INVALID = -1,
    NUMBER,
    FUNCTION,
    VARIABLE,
    OPERATOR,
    LPAREN,
    RPAREN,
    COMMA
}

interface Token{
    type: TokenType;
    value: string | number;
    pos: number;
    precedence: number;
    associativity: 'left' | 'right' | 'none';
    arguments: number;
}

const errors = {
    empty: 'The expression is empty',
};

const operators: { [key: string]: { fn: string, precedence: number, assoc: 'left' | 'right' | 'none', args: number }} = {
    '!': { fn: 'fac', precedence: 10, assoc: 'left', args: 1 },
    '~': { fn: 'not', precedence: 10, assoc: 'left', args: 1 },

    '**': { fn: 'pow', precedence: 9, assoc: 'right', args: 2 },
    '^': { fn: 'pow', precedence: 9, assoc: 'right', args: 2 },

    '*': { fn: 'mul', precedence: 8, assoc: 'left', args: 2 },
    '·': { fn: 'mul', precedence: 8, assoc: 'left', args: 2 },
    '×': { fn: 'mul', precedence: 8, assoc: 'left', args: 2 },
    '/': { fn: 'div', precedence: 8, assoc: 'left', args: 2 },
    '÷': { fn: 'div', precedence: 8, assoc: 'left', args: 2 },
    '%': { fn: 'mod', precedence: 8, assoc: 'left', args: 2 },

    //function without parenthesis

    '+': { fn: 'add', precedence: 7, assoc: 'left', args: 2 },
    '-': { fn: 'sub', precedence: 7, assoc: 'left', args: 2 },
    
    '<': { fn: 'shl', precedence: 6, assoc: 'left', args: 2 },
    '>': { fn: 'shr', precedence: 6, assoc: 'left', args: 2 },
    '<<': { fn: 'shl', precedence: 6, assoc: 'left', args: 2 },
    '>>': { fn: 'shr', precedence: 6, assoc: 'left', args: 2 },

    '&': {fn: 'and', precedence: 5, assoc: 'left', args: 2 },
    '|': {fn: 'or', precedence: 4, assoc: 'left', args: 2 },
    
    //',': { fn: '', precedence: 1, assoc: 'none' },
};

const functions: {[key: string]: number} = {
    'sin': 1,
    'cos': 1,
    'tan': 1,
    'tg': 1,
    'sqrt': 1,
    'root': 2,
    'power': 2,
    'pow': 2,
    'abs': 1,
    'max': 2,
    'min': 2,
    'mod': 2,
    'fac': 1,
    'round': 1,
    'trunc': 1,
    'ceil': 1,
    'floor': 1,
    'sign': 1,
    'add': 2,
    'sub': 2,
    'mul': 2,
    'div': 2,
    'shl': 2,
    'shr': 2,
    'not': 1,
    'and': 2,
    'or': 2,
    'xor': 2,
    'pi': 0,
    'ln': 1,
    'log': 1,
    'exp': 1,
    'sum': 4,
};

const constants: { [key: string]: number } = {
    'π': Math.PI,
    'τ': 2 * Math.PI,
    'e': Math.E,
    '∞': Infinity,
}

function isNumber(char: string) { 
    return /\d|\./.test(char);
}

function isLetter(char: string) {
    if (!char) return false;
    return /[a-z]/i.test(char);
}

function isLParen(char: string) {
    return /\(|\[|\{/.test(char);
}

function isRParen(char: string) {
    return /\)|\]|\}/.test(char);
}

function isOperator(str: string) {
    return operators[str] !== undefined;
}

function isConstant(char: string) {
    return constants[char] !== undefined;
}

// function getPrecedence(op: string) {
//     switch (op) {
//         case '**':
//         case '^':
//             return 8;
//         case '*':
//         case '/':
//         case '÷':
//         case '%':
//             return 7;
//         case '+':
//         case '-':
//             return 6;
//         case '<<':
//         case '>>':
//             return 5;
//         case ',':
//             return 1;
//         default:
//             return 0;
//     }
// }

// function getAssociativity(op: string) {
//     switch (op) {
//         case '**':
//         case '^':
//             return 'right';
//         default:
//             return 'left';
//     }
// }

// function isFunction(str: string) {
//     return /^(sin|cos|tan|min|max|mod|sqrt|root|abs|fac|round|int)$/.test(str);
// }
// declare global {
//     interface Array<T> {
//         top(): T;
//     }
// }

// if (!Array.prototype.top) {
//     Array.prototype.top = function <T>(): T {
//         return this.at(-1);//this.filter(e => e !== elem);
//     }
// }


function problem(char: number, len: number, severity: Severity, desc: string) {
    if (severity == Severity.FATAL_ERROR) {
        throw new ParserFatalError(desc);
    }
    return {desc, severity, char, len}
}


export class ExpressionParser{

    problems: Problem[] = [];

    operatorStack: Token[] = [];
    tokenStack: Token[] = [];//output of tokenize()
    outputQueue: Token[] = [];//output of parse()
    
    result: number | null = null;



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
    // ^ - only power is valid (i.e. sin^2(x))
    //

    tokenize(expression: string) {

        //remove all spaces
        //expression = expression.trim();
        expression = expression.replace(/\s+/g, '');

        if (!expression.length) {
            this.problems.push(problem(0, 0, Severity.ERROR, errors.empty));
            return this;
        }

        let charStack = '';
        this.problems = [];
        this.tokenStack = [];
        this.outputQueue = [];
        this.operatorStack = [];

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            const nextChar = expression[i + 1];

            if (char === ' ') {
                continue;
            }
            else if (isConstant(char)) {
                this.tokenStack.push({ type: TokenType.NUMBER, value: constants[char], precedence: 10, associativity: 'none', pos: i, arguments: 0 });
            }
            else if (isNumber(char)) {
                charStack += char;
                if (isNumber(nextChar)) {
                    continue;
                }
                this.tokenStack.push({ type: TokenType.NUMBER, value: parseFloat(charStack), precedence: 10, associativity: 'none', pos: i, arguments: 0 });
                charStack = '';
            }
            else if (isLetter(char)) {
                charStack += char;
                if (isLetter(nextChar)) {
                    continue;
                }
                //now inspect charstack if it is a function or a variable
                // charStack.toLowerCase();
                // let fnFound = '';
                // for (const fn in functions) {
                //     if (charStack.includes(fn)) {
                //         //found function
                //         //this.operatorStack.push(charStack);
                //         fnFound = fn;
                //         charStack = charStack.replace(fn, '');
                //         break;
                //     }
                // }
                // for (const letter of charStack) {
                //     this.tokenStack.push({type: TokenType.VARIABLE, value: letter, precedence: 0, associativity: 'none', pos: i});
                // }

                // if (fnFound) {
                //     this.tokenStack.push({ type: TokenType.FUNCTION, value: fnFound, precedence: 10, associativity: 'none', pos: i });
                // }


                if (isLParen(nextChar)) {
                    //function
                    
                    let args = 0;
                    let found = -1;
                    for (let j = i + 1; j < expression.length; j++){
                        if (isRParen(expression[j])) {
                            found = j;
                        }
                    }
                    if (i + 2 == found) {
                        args = 0;
                    }
                    else {
                        args = expression.substring(i + 2, found == -1 ? undefined : found - 1).split(',').length;
                    }
                    //console.log('Args:' + args);
                    this.tokenStack.push({ type: TokenType.FUNCTION, value: charStack, precedence: 10, associativity: 'none', pos: i, arguments: args });

                }
                else {
                    //variable(s)
                    for (const letter of charStack) {
                        this.tokenStack.push({type: TokenType.VARIABLE, value: letter, precedence: 0, associativity: 'none', pos: i, arguments: 0});
                    }
                }
                charStack = '';
            }
            else if (isOperator(char)) {
                let ch = char;
                if (nextChar == '*' || nextChar == '<' || nextChar == '>') {
                    ch += nextChar;
                    i++;
                }
                if (ch == '!') {
                    let newPos = -1;
                    switch (this.tokenStack.at(-1)?.type) {
                        case TokenType.NUMBER:
                        case TokenType.VARIABLE:
                            newPos = this.tokenStack.length - 1;
                            break;
                        case TokenType.RPAREN:
                            for (let j = this.tokenStack.length - 1; j >= 0; j--) {
                                if (this.tokenStack[j].type == TokenType.LPAREN) {
                                    newPos = j;
                                    break;
                                }
                            }
                            //throw mismatched parentheses
                            break;
                        default:
                            //throw invalid position
                    }
                    this.tokenStack.splice(newPos, 0, { type: TokenType.OPERATOR, value: ch, precedence: operators[ch].precedence, associativity: operators[ch].assoc, pos: i, arguments: operators[ch].args });
                    continue;
                }
                this.tokenStack.push({ type: TokenType.OPERATOR, value: ch, precedence: operators[ch].precedence, associativity: operators[ch].assoc, pos: i, arguments: operators[ch].args });
            }
            else if (isLParen(char)) {
                this.tokenStack.push({ type: TokenType.LPAREN, value: char, precedence: 10, associativity: 'none', pos: i, arguments: 0});
            }
            else if (isRParen(char)) {
                this.tokenStack.push({ type: TokenType.RPAREN, value: char, precedence: 10, associativity: 'none', pos: i, arguments: 0});
            }
            else if (char == ',') {
                this.tokenStack.push({ type: TokenType.COMMA, value: char, precedence: 1, associativity: 'none', pos: i, arguments: 0 });
            }
            else {
                this.problems.push(problem(i, 1, Severity.FATAL_ERROR, `Invalid token '${char}'`));
            }
        }
        return this;
    }


    parse(tokens: Token[] = this.tokenStack) {
        //let commas = 0;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            if (token.type == TokenType.VARIABLE) {
                if (nextToken?.type == TokenType.NUMBER ||
                    nextToken?.type == TokenType.FUNCTION ||
                    nextToken?.type == TokenType.VARIABLE ||
                    nextToken?.type == TokenType.LPAREN) {
                    tokens.splice(i + 1, 0, createMultiplyToken());
                }

                this.outputQueue.push(token);
            }
            else if (token.type == TokenType.FUNCTION) {
                if (nextToken?.type == TokenType.OPERATOR) {
                    //tokens.splice(i+1, 0, createMultiplyToken());
                }
                else if (!nextToken) {
                    this.problems.push(problem(token.pos, token.value.toString().length, Severity.ERROR, `Expected function argument, ignoring function '${token.value}'`));
                    continue;
                }
                else if (nextToken.type == TokenType.NUMBER ||
                    nextToken.type == TokenType.FUNCTION ||
                    nextToken.type == TokenType.VARIABLE ||
                    nextToken.type == TokenType.RPAREN) {
                    this.problems.push(problem(nextToken.pos, nextToken.value.toString().length, Severity.FATAL_ERROR, `Invalid token '${nextToken.value}', expected '(' or function name`));
                }
                //commas = 0;

                this.operatorStack.push(token);
            }
            else if (token.type == TokenType.NUMBER) {
                if (nextToken?.type == TokenType.FUNCTION ||
                    nextToken?.type == TokenType.VARIABLE ||
                    nextToken?.type == TokenType.LPAREN) {
                    tokens.splice(i+1, 0, createMultiplyToken());
                }

                this.outputQueue.push(token);
            }
            else if (token.type == TokenType.OPERATOR) {

                if (nextToken?.type == TokenType.OPERATOR) {
                    this.problems.push(problem(nextToken.pos, nextToken.value.toString().length, Severity.ERROR, `Excess operator '${nextToken.value}', ignoring it`));
                    nextToken.type = TokenType.INVALID;
                }
                else if (!nextToken || nextToken.type == TokenType.RPAREN) {
                    this.problems.push(problem(token.pos, token.value.toString().length, Severity.ERROR, `Missing right-side argument for operator '${token.value}', ignoring it`));
                    continue;
                }
                let top = this.operatorStack.at(-1);
                while (top && top.type != TokenType.LPAREN && (top.precedence > token.precedence || (top.precedence === token.precedence && token.associativity === 'left'))) {
                    this.operatorStack.pop();
                    if (top.type == TokenType.OPERATOR) {
                        this.outputQueue.push(convertOpToFn(top));
                    } else {
                        this.outputQueue.push(top);
                    }
                    top = this.operatorStack.at(-1);
                }
                this.operatorStack.push(token);
            }
            else if (token.type == TokenType.LPAREN) {
                if (nextToken?.type == TokenType.OPERATOR && nextToken.arguments > 1) {
                    this.problems.push(problem(nextToken.pos, nextToken.value.toString().length, Severity.ERROR, `Missing left-side argument for operator '${nextToken.value}', ignoring it`));
                    nextToken.type = TokenType.INVALID;
                }

                this.operatorStack.push(token);
            }
            else if (token.type == TokenType.RPAREN) {

                if (nextToken?.type == TokenType.NUMBER ||
                    nextToken?.type == TokenType.FUNCTION ||
                    nextToken?.type == TokenType.VARIABLE ||
                    nextToken?.type == TokenType.LPAREN) {
                    tokens.splice(i+1, 0, createMultiplyToken());
                }

                while (this.operatorStack.at(-1)?.type != TokenType.LPAREN) {
                    const lastOp = this.operatorStack.pop();
                    if (!lastOp) {
                        this.problems.push(problem(token.pos, token.value.toString().length, Severity.FATAL_ERROR, `Mismatched parentheses: missing left parenthesis '('`));
                        return this;
                    }
                    if (lastOp.type == TokenType.OPERATOR) {
                        this.outputQueue.push(convertOpToFn(lastOp));
                    } else {
                        this.outputQueue.push(lastOp);
                    }
                }
                const lparen = this.operatorStack.pop();
                if (!lparen || lparen.type != TokenType.LPAREN) {
                    this.problems.push(problem(0, 0, Severity.FATAL_ERROR, `Mismatched parentheses: missing right parenthesis ')'`));
                }
                const top = this.operatorStack.at(-1);
                if (top && top.type == TokenType.FUNCTION) {
                    this.operatorStack.pop();
                    this.outputQueue.push(top);
                }
            }
            else if (token.type == TokenType.COMMA) {
                //ignore
                //this.operatorStack.push(token);
            }
        }
        while (this.operatorStack.length) {
            const op = this.operatorStack.pop();
            if (!op || op.type == TokenType.LPAREN || op.type == TokenType.RPAREN) {
                this.problems.push(problem(op?.pos ?? 0, op?.value.toString().length ?? 0, Severity.FATAL_ERROR, `Mismatched parentheses`));
                return this;
            }
            if (op.type == TokenType.OPERATOR) {
                this.outputQueue.push(convertOpToFn(op));
            } else {
                this.outputQueue.push(op);
            }
        }
        return this;
    }


    evaluate(variables: { [key: string]: number }, tokens: Token[] = this.outputQueue) {
        let tmpStack: number[] = [];
        //let result = 0;

        //console.log(tokens);

        for (const token of tokens) {
            switch (token.type) {
                case TokenType.NUMBER:
                    tmpStack.push(token.value as number);
                    break;
                case TokenType.FUNCTION:
                    const args: number[] = [];
                    const argc = functions[token.value];
                    const providedArgs = token.arguments;

                    if (providedArgs > argc) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Too much arguments: function '${token.value}' expects ${argc} arguments, ${providedArgs} provided`));
                    }
                    else if (providedArgs < argc) {
                        this.problems.push(problem(0, 0, Severity.FATAL_ERROR, `Not enough arguments: function '${token.value}' expects ${argc} arguments, ${providedArgs} provided`));
                    }


                    for (let i = 0; i < argc; i++){
                        const arg = tmpStack.pop();
                        if (arg === undefined) {
                            this.problems.push(problem(i, 0, Severity.FATAL_ERROR, `Internal Error: Not enough arguments for function '${token.value}'`));
                            return this;
                        }
                        args.push(arg);
                    }
                    args.reverse();
                    let fnResult = 0;
                    switch (token.value) {
                        case 'sin':
                            fnResult = Math.sin(args[0]);
                            break;
                        case 'cos':
                            fnResult = Math.cos(args[0]);
                            break;
                        case 'tan':
                        case 'tg':
                            fnResult = Math.tan(args[0]);
                            break;
                        case 'sqrt':
                            fnResult = Math.sqrt(args[0]);
                            break;
                        case 'root':
                            fnResult = Math.pow(args[0], 1 / args[1]);
                            break;
                        case 'pow':
                        case 'power':
                            fnResult = Math.pow(args[0], args[1]);
                            break;
                        case 'abs':
                            fnResult = Math.abs(args[0]);
                            break;
                        case 'min':
                            fnResult = Math.min(args[0], args[1]);
                            break;
                        case 'max':
                            fnResult = Math.max(args[0], args[1]);
                            break;
                        case 'mod':
                            fnResult = ((args[0] % args[1]) + args[1]) % args[1];
                            break;
                        case 'fac':
                            fnResult = args[0] * gamma(args[0]);
                            break;
                        case 'round':
                            fnResult = Math.round(args[0]);
                            break;
                        case 'trunc':
                            fnResult = Math.trunc(args[0]);
                            break;
                        case 'ceil':
                            fnResult = Math.ceil(args[0]);
                            break;
                        case 'floor':
                            fnResult = Math.floor(args[0]);
                            break;
                        case 'sign':
                            fnResult = Math.sign(args[0]);
                            break;
                        case 'add':
                            fnResult = args[0] + args[1];
                            break;
                        case 'sub':
                            fnResult = args[0] - args[1];
                            break;
                        case 'mul':
                            fnResult = args[0] * args[1];
                            break;
                        case 'div':
                            fnResult = args[0] / args[1];
                            break;
                        case 'shl':
                            fnResult = args[0] << args[1];
                            break;
                        case 'shr':
                            fnResult = args[0] >> args[1];
                            break;
                        case 'not':
                            fnResult = ~args[0];
                            break;
                        case 'and':
                            fnResult = args[0] & args[1];
                            break;
                        case 'or':
                            fnResult = args[0] | args[1];
                            break;
                        case 'xor':
                            fnResult = args[0] ^ args[1];
                            break;
                        case 'pi':
                            fnResult = Math.PI;
                            break;
                        case 'ln':
                            fnResult = Math.log(args[0]);
                            break;
                        case 'log':
                            fnResult = Math.log10(args[0]);
                            break;
                        case 'exp':
                            fnResult = Math.exp(args[0]);
                            break;
                        //case 'sum':
                            //break;
                        default:
                            this.problems.push(problem(0, 0, Severity.FATAL_ERROR, `Unknown function '${token.value}'`));
                            return this;
                        
                    }
                    tmpStack.push(fnResult);
                    break;
                case TokenType.VARIABLE:
                    const val = variables[token.value];
                    if (val === undefined) {
                        this.problems.push(problem(0, 0, Severity.FATAL_ERROR, `Value for variable '${token.value}' was not provided`));
                    }
                    tmpStack.push(val);
                    break;
                // case TokenType.OPERATOR:
                //     const arg1 = tmpStack.pop() as number;
                //     const arg0 = tmpStack.pop() as number;
                //     let result = 0;
                //     switch (token.value) {
                //         case '+':
                //             result = arg0 + arg1;
                //             break;
                //         case '-':
                //             result = arg0 - arg1;
                //             break;
                //         case '*':
                //         case '·':
                //             result = arg0 * arg1;
                //             break;
                //         case '/':
                //         case '÷':
                //             result = arg0 / arg1;
                //             break;
                //         case '^':
                //         case '**':
                //             result = Math.pow(arg0, arg1);
                //             break;
                //         case '%':
                //             result = arg0 % arg1;
                //             break;
                //     }
                //     tmpStack.push(result);
                //     break;
            }
        }

        //console.log(tmpStack);
        this.result = tmpStack[0];
        return this;
        //return tmpStack[0];
    }
}


function createMultiplyToken(): Token{
    return { type: TokenType.OPERATOR, value: '*', precedence: operators['*'].precedence, associativity: operators['*'].assoc, pos: -1, arguments: operators['*'].args }
}

function convertOpToFn(token: Token): Token {
    return { type: TokenType.FUNCTION, value: operators[token.value].fn, precedence: 10, associativity: 'none', pos: token.pos, arguments: token.arguments };
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

        let x = C[0];
        for (let i = 1; i < g + 2; i++) x += C[i] / (z + i);

        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
};


// for (let i = 0; i < expression.length; i++) {
//     const char = expression[i];
//     const nextChar = expression[i + 1];

//     if (char === ' ') {
//         continue;
//     }
//     else if (isLetter(char)) {
//         charStack += char;
//         if (isLetter(nextChar)) {
//             continue;
//         }
//         //now inspect charstack if it is a function or a variable
//         charStack.toLowerCase();
//         let fnFound = '';
//         for (const fn of functions) {
//             if (charStack.includes(fn)) {
//                 //found function
//                 //this.operatorStack.push(charStack);
//                 fnFound = fn;
//                 charStack = charStack.replace(fn, '');
//                 break;
//             }
//         }
//         for (const letter of charStack) {
//             this.outputQueue.push(letter);
//             //this.operatorStack.push('*');
//         }

//         if (fnFound) {
//             this.operatorStack.push(fnFound);
//         }
//         charStack = '';
//     }
//     else if (isNumber(char)) {
//         charStack += char;
//         if (isNumber(nextChar)) {
//             continue;
//         }
//         if (isLParen(nextChar) || isLetter(nextChar)) {
//             this.operatorStack.push('*');
//         }
//         //push number to output queue
//         this.outputQueue.push(charStack);
//         charStack = '';
//     }
//     else if (isOperator(char)) {
//         let ch = char;
//         if (nextChar == char) {
//             ch += nextChar;
//             i++;
//         }
//         let top = this.operatorStack.length ? this.operatorStack[this.operatorStack.length - 1] : '';
//         while (top && !isLParen(top) && (getPrecedence(top) > getPrecedence(ch) || (getPrecedence(top) === getPrecedence(ch) && getAssociativity(ch) === 'left'))) {
//             this.operatorStack.pop();
//             this.outputQueue.push(top);
//             top = this.operatorStack.length ? this.operatorStack[this.operatorStack.length - 1] : '';
//         }
//         this.operatorStack.push(ch);
//     }
//     else if (isLParen(char)) {
//         this.operatorStack.push(char);
//     }
//     else if (isRParen(char)) {

//         while (!isLParen(this.operatorStack[this.operatorStack.length - 1])) {
//             const lastOp = this.operatorStack.pop();
//             if (!lastOp) {
//                 this.errors.push({ name: '', description: 'Mismatched parentheses: missing left parenthesis', character: i, length: 1 });
//                 return;
//             }
//             this.outputQueue.push(lastOp);
//         }
//         const lparen = this.operatorStack.pop();
//         if (!lparen || !isLParen(lparen)) {
//             this.errors.push({ name: '', description: 'Mismatched parentheses: missing left parenthesis', character: i, length: 1 });
//             return;
//         }
//         const top = this.operatorStack[this.operatorStack.length - 1];
//         if (top) {
//             for (const fn of functions) {
//                 if (top.includes(fn)) {
//                     //found function
//                     this.operatorStack.pop();
//                     this.outputQueue.push(top);
//                     break;
//                 }
//             }
//         }
//         if (nextChar && !isOperator(nextChar)) {
//             this.operatorStack.push('*');
//         }
//     }
// }
// while (this.operatorStack.length) {
//     const op = this.operatorStack.pop();
//     if (!op || isLParen(op) || isRParen(op)) {
//         //throw error
//         return;
//     }
//     this.outputQueue.push(op);
// }
// return this.outputQueue;
