export class ParserFatalError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParserFatalError';
    }
}
export var Severity;
(function (Severity) {
    Severity[Severity["INFO"] = 0] = "INFO";
    Severity[Severity["WARNING"] = 1] = "WARNING";
    Severity[Severity["ERROR"] = 2] = "ERROR";
    // FATAL_ERROR
})(Severity || (Severity = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["INVALID"] = -1] = "INVALID";
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["FUNCTION"] = 1] = "FUNCTION";
    TokenType[TokenType["VARIABLE"] = 2] = "VARIABLE";
    TokenType[TokenType["OPERATOR"] = 3] = "OPERATOR";
    TokenType[TokenType["LPAREN"] = 4] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 5] = "RPAREN";
    TokenType[TokenType["COMMA"] = 6] = "COMMA";
    TokenType[TokenType["EQUAL"] = 7] = "EQUAL";
    //STRING
})(TokenType || (TokenType = {}));
export var ExpressionType;
(function (ExpressionType) {
    ExpressionType[ExpressionType["UNKNOWN"] = -1] = "UNKNOWN";
    ExpressionType[ExpressionType["FUNCTION"] = 0] = "FUNCTION";
    ExpressionType[ExpressionType["YFUNCTION"] = 1] = "YFUNCTION";
    ExpressionType[ExpressionType["INEQUALITY"] = 2] = "INEQUALITY";
    ExpressionType[ExpressionType["POLAR"] = 3] = "POLAR";
    ExpressionType[ExpressionType["POINT"] = 4] = "POINT";
    ExpressionType[ExpressionType["EQUATION"] = 5] = "EQUATION";
})(ExpressionType || (ExpressionType = {}));
const errors = {
    empty: 'The expression is empty',
};
const functions = {
    'sin': { argc: 1, fn: (args) => Math.sin(args[0] * args[1]) },
    'cos': { argc: 1, fn: (args) => Math.cos(args[0] * args[1]) },
    'tan': { argc: 1, fn: (args) => Math.tan(args[0] * args[1]) },
    'tg': { argc: 1, fn: (args) => Math.tan(args[0] * args[1]) },
    'sqrt': { argc: 1, fn: (args) => Math.sqrt(args[0]) },
    'root': { argc: 2, fn: (args) => Math.pow(args[0], 1 / args[1]) },
    'power': { argc: 2, fn: (args) => Math.pow(args[0], args[1]) },
    'pow': { argc: 2, fn: (args) => Math.pow(args[0], args[1]) },
    'abs': { argc: 1, fn: (args) => Math.abs(args[0]) },
    'max': { argc: 2, fn: (args) => Math.max(args[0], args[1]) },
    'min': { argc: 2, fn: (args) => Math.min(args[0], args[1]) },
    'mod': { argc: 2, fn: (args) => ((args[0] % args[1]) + args[1]) % args[1] },
    'fac': { argc: 1, fn: (args) => args[0] * gamma(args[0]) },
    'round': { argc: 1, fn: (args) => Math.round(args[0]) },
    'trunc': { argc: 1, fn: (args) => Math.trunc(args[0]) },
    'ceil': { argc: 1, fn: (args) => Math.ceil(args[0]) },
    'floor': { argc: 1, fn: (args) => Math.floor(args[0]) },
    'sign': { argc: 1, fn: (args) => Math.sign(args[0]) },
    'sgn': { argc: 1, fn: (args) => Math.sign(args[0]) },
    'add': { argc: 2, fn: (args) => args[0] + args[1] },
    'sub': { argc: 2, fn: (args) => args[0] - args[1] },
    'mul': { argc: 2, fn: (args) => args[0] * args[1] },
    'div': { argc: 2, fn: (args) => args[0] / args[1] },
    'shl': { argc: 2, fn: (args) => args[0] << args[1] },
    'shr': { argc: 2, fn: (args) => args[0] >> args[1] },
    'not': { argc: 1, fn: (args) => ~args[0] },
    'and': { argc: 2, fn: (args) => args[0] & args[1] },
    'or': { argc: 2, fn: (args) => args[0] | args[1] },
    'xor': { argc: 2, fn: (args) => args[0] ^ args[1] },
    'ln': { argc: 1, fn: (args) => Math.log(args[0]) },
    'log': { argc: 1, fn: (args) => Math.log10(args[0]) },
    'exp': { argc: 1, fn: (args) => Math.exp(args[0]) },
    //special functions (they need custom implementation)
    'sum': { argc: 4, fn: () => 0 },
    'prod': { argc: 4, fn: () => 0 },
    'derivative': { argc: 1, fn: () => 0 },
    'der': { argc: 1, fn: () => 0 },
    //'integrate':  { argc: 1, fn: () => 0 },
    //'int':        { argc: 1, fn: () => 0 }
};
const operators = {
    '!': { argc: -1, fn: functions['fac'].fn, precedence: 10, assoc: 'left' },
    '~': { argc: 1, fn: functions['not'].fn, precedence: 10, assoc: 'right' },
    '\\+': { argc: 1, fn: (args) => +args[0], precedence: 10, assoc: 'right' },
    '\\-': { argc: 1, fn: (args) => -args[0], precedence: 10, assoc: 'right' },
    '**': { argc: 2, fn: functions['pow'].fn, precedence: 9, assoc: 'right' },
    '^': { argc: 2, fn: functions['pow'].fn, precedence: 9, assoc: 'right' },
    '*': { argc: 2, fn: functions['mul'].fn, precedence: 8, assoc: 'left' },
    '·': { argc: 2, fn: functions['mul'].fn, precedence: 8, assoc: 'left' },
    '×': { argc: 2, fn: functions['mul'].fn, precedence: 8, assoc: 'left' },
    '/': { argc: 2, fn: functions['div'].fn, precedence: 8, assoc: 'left' },
    ':': { argc: 2, fn: functions['div'].fn, precedence: 8, assoc: 'left' },
    '÷': { argc: 2, fn: functions['div'].fn, precedence: 8, assoc: 'left' },
    '%': { argc: 2, fn: functions['mod'].fn, precedence: 8, assoc: 'left' },
    //function without parenthesis
    '+': { argc: 2, fn: functions['add'].fn, precedence: 7, assoc: 'left' },
    '-': { argc: 2, fn: functions['sub'].fn, precedence: 7, assoc: 'left' },
    //'<': { argc: 2, fn: functions['shl'].fn, precedence: 6, assoc: 'left' },
    //'>': { argc: 2, fn: functions['shr'].fn, precedence: 6, assoc: 'left' },
    '<<': { argc: 2, fn: functions['shl'].fn, precedence: 6, assoc: 'left' },
    '>>': { argc: 2, fn: functions['shr'].fn, precedence: 6, assoc: 'left' },
    //'&': {fn: 'and', precedence: 5, assoc: 'left', args: 2 },
    //'|': {fn: 'or', precedence: 4, assoc: 'left', args: 2 },
    //',': { fn: '', precedence: 1, assoc: 'none' },
    //degrees
    //°º˚°˚∘
};
const constants = {
    'π': Math.PI,
    'τ': 2 * Math.PI,
    'e': Math.E,
    '∞': Infinity,
};
function problem(char, len, severity, desc) {
    if (severity == Severity.ERROR) {
        throw new ParserFatalError(desc);
    }
    return { desc, severity, char, len };
}
export class ExpressionParser {
    problems = [];
    tokenStack = []; //output of tokenize()
    outputQueue = []; //output of parse()
    result = null;
    latexToString(input) {
        input = input.replaceAll(/\\left\|/g, ' abs(');
        input = input.replaceAll(/\\right\|/g, ')');
        //for now \left and \right are unnecessary
        input = input.replaceAll(/(\\left)|(\\right)/g, '');
        //basic functions
        input = input.replaceAll(/\\(sin|cos|tan|max|min|ln|log|exp)/g, (_, p1) => ` ${p1}`);
        //any other function
        input = input.replaceAll(/\\operatorname{([^}]*)}/g, (_, p1) => ` ${p1}`);
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
        let res = null;
        //these commands can be self-contained
        do {
            //fraction
            input = input.replaceAll(/\\frac{([^}]*)}{([^}]*)}/g, (_, p1, p2) => `(${p1})/(${p2})`);
            //sqrt
            input = input.replaceAll(/\\sqrt{([^}]*)}/g, (_, p1) => ` sqrt(${p1})`);
            //sum, prod, coprod
            input = input.replaceAll(/\\(sum|prod|coprod)(?:(?:_{(?:([^}=]*)=)?([^}]*)})|_.)(?:(?:\^{([^}]*)})|\^.)/g, (_, p1, p2, p3, p4) => `${p1}(?, ${p2}, ${p3}, ${p4})`);
            //x+\text{test}g\cdot x
            res = /\\([a-z]*)/gi.exec(input);
            if (res && !/frac|sqrt|sum|prod|coprod/g.test(res[1])) {
                problem(0, 0, Severity.ERROR, `Unsupported LaTex command '${res[1]}'.`);
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
    tokenize(expression) {
        //let charStack = '';
        this.problems = [];
        this.tokenStack = [];
        this.outputQueue = [];
        //remove all whitespace
        //expression = expression.trim();
        expression = expression.replace(/\s+/g, '');
        if (!expression.length) {
            this.problems.push(problem(0, 0, Severity.WARNING, errors.empty));
            return this;
        }
        //number: /^([0-9\.]+(\d*[eE]*[-+]*\d+)?)/
        //letter: /^[a-z]+/i
        //lparen: /^\(|\[|\{/
        //rparen: /^\)|\]|\}/
        //quote : /^\'|\"|\`/
        //equal : /^(=|[<>]=?)/, /^[<>]?(?![<>])=?/
        //operator: /^\*\*|[!~*·×^÷/%+\-]|<<|>>/
        let res;
        let pos = 0;
        while (expression.length) {
            //match number
            res = /^(\d*)(\.)?(\d+)([eE][-+]?\d+)?/.exec(expression); //old: /^([0-9\.]+(\d*[eE]*[-+]*\d+)?)/
            if (res) {
                this.tokenStack.push({ type: TokenType.NUMBER, value: parseFloat(res[0]), pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match letter (function or variable)
            res = /^[a-z]+/i.exec(expression);
            if (res) {
                let charStack = res[0];
                charstackLoop: while (charStack.length) {
                    //functions has to be sorted from longest to shortest
                    for (const fn in functions) {
                        if (charStack.search(new RegExp(`^${fn}`)) !== -1) {
                            //found function
                            charStack = charStack.substring(fn.length);
                            this.tokenStack.push({ type: TokenType.FUNCTION, name: fn, pos });
                            pos += fn.length;
                            continue charstackLoop;
                        }
                    }
                    //it can be constant
                    const res2 = /^(pi|tau|e|infinity|infty|inf)/i.exec(charStack);
                    if (res2) {
                        charStack = charStack.slice(res2[0].length);
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
                        this.tokenStack.push({ type: TokenType.NUMBER, value: constants[val], name: res[0], pos });
                        pos += res2[0].length;
                        continue charstackLoop;
                    }
                    this.tokenStack.push({ type: TokenType.VARIABLE, name: charStack[0], pos });
                    //pop from front
                    charStack = charStack.substring(1);
                    pos++;
                }
                //pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match constants
            res = /^[πτe∞]/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.NUMBER, value: constants[res[0]], name: res[0], pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match operator
            res = /^(\*\*|[!~*·×^÷:/%+\-]|<<|>>)/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.OPERATOR, name: res[0], pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match left parenthesis
            res = /^(\(|\[|\{)/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.LPAREN, pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match right parenthesis
            res = /^(\)|\]|\})/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.RPAREN, pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match comma
            res = /^,/.exec(expression);
            if (res) {
                this.tokenStack.push({ type: TokenType.COMMA, pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            //match equality (or inequality) sign
            res = /^(=|[<>]=?)/.exec(expression); //^[<>]?(?![<>])=?
            if (res) {
                this.tokenStack.push({ type: TokenType.EQUAL, name: res[0], pos });
                pos += res[0].length;
                expression = expression.slice(res[0].length);
                continue;
            }
            this.problems.push(problem(pos, 1, Severity.WARNING, `Illegal character '${expression[0]}', ignoring it.`));
            expression = expression.slice(1);
        }
        return this;
    }
    //check syntax of tokenized expression and add missing tokens '*', '(' and ')' where necessary
    checkSyntax(tokens = this.tokenStack) {
        tokenLoop: for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const prevToken = tokens[i - 1];
            const nextToken = tokens[i + 1];
            switch (token.type) {
                // @ts-expect-error
                case TokenType.NUMBER:
                    if (nextToken?.type == TokenType.NUMBER && !nextToken.name) {
                        //if it has name, it was a constant
                        this.problems.push(problem(nextToken.pos, 1, Severity.ERROR, `Number ${nextToken.value?.toString()} has unknown meaning.`));
                    }
                // FALLS THROUGH
                case TokenType.VARIABLE:
                case TokenType.RPAREN:
                    if (nextToken?.type == TokenType.FUNCTION ||
                        nextToken?.type == TokenType.NUMBER ||
                        nextToken?.type == TokenType.VARIABLE ||
                        nextToken?.type == TokenType.LPAREN) {
                        tokens.splice(i + 1, 0, insertMultiplyToken(token.pos));
                    }
                    break;
                case TokenType.FUNCTION:
                    if (nextToken?.type == TokenType.NUMBER ||
                        nextToken?.type == TokenType.FUNCTION ||
                        nextToken?.type == TokenType.OPERATOR ||
                        nextToken?.type == TokenType.VARIABLE) {
                        if (functions[token.name ?? ''].argc > 1) {
                            this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.ERROR, `Functions with more than 1 argument require parentheses.`));
                        }
                        //parentheses are missing, so insert them
                        tokens.splice(i + 1, 0, { type: TokenType.LPAREN, pos: i + 1 });
                        for (let j = i + 2; j < tokens.length; j++) {
                            if (!(tokens[j].type == TokenType.NUMBER ||
                                tokens[j].type == TokenType.FUNCTION ||
                                tokens[j].type == TokenType.VARIABLE ||
                                tokens[j].type == TokenType.RPAREN ||
                                (tokens[j].type == TokenType.OPERATOR &&
                                    (operators[tokens[j].name ?? ''].precedence > operators['+'].precedence)))) {
                                if (tokens[j].type == TokenType.OPERATOR || tokens[j].type == TokenType.RPAREN || tokens[j].type == TokenType.EQUAL) {
                                    tokens.splice(j, 0, { type: TokenType.RPAREN, pos: j });
                                    //decrease index and repeat
                                    i--;
                                    continue tokenLoop;
                                }
                                else {
                                    //throw 'add parentheses'
                                    this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.ERROR, `Try adding parentheses to function '${token.name}'.`));
                                }
                            }
                        }
                        tokens.push({ type: TokenType.RPAREN, pos: tokens.length - 1 });
                    }
                    else if (nextToken?.type == TokenType.LPAREN) {
                        //valid, do nothing
                    }
                    else if (!nextToken || nextToken?.type == TokenType.RPAREN) {
                        this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.WARNING, `Expected function argument, ignoring function '${token.name}'.`));
                    }
                    else {
                        this.problems.push(problem(nextToken.pos, 1, Severity.ERROR, `Invalid token '${nextToken.name}', expected '(', function name, variable or number.`));
                    }
                    break;
                case TokenType.OPERATOR:
                    //move operators which are written after operand (such as '!')
                    // if (operators[token.name ?? ''].argc < 0) {
                    //     let newPos = 0;
                    //     switch (prevToken?.type) {
                    //         case TokenType.NUMBER:
                    //         case TokenType.VARIABLE:
                    //             newPos = i - 1;
                    //             break;
                    //         case TokenType.RPAREN:
                    //             //look for matching parenthesis (ignoring nested scopes)
                    //             let scope = 0;
                    //             for (let j = i - 2; j >= 0; j--) {
                    //                 if (tokens[j].type == TokenType.RPAREN) {
                    //                     scope++;
                    //                     continue;
                    //                 }
                    //                 else if (tokens[j].type == TokenType.LPAREN) {
                    //                     if (scope !== 0) {
                    //                         scope--;
                    //                         continue;
                    //                     }
                    //                     newPos = j
                    //                     break;
                    //                 }
                    //             }
                    //             break;
                    //         default:
                    //             //throw invalid position
                    //             this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.ERROR, `'${token.name}' is in invalid place.`));
                    //     }
                    //     //move it to new position
                    //     this.tokenStack.splice(i, 1);
                    //     this.tokenStack.splice(newPos, 0, token);
                    //     continue;
                    // }
                    //check left-side arg
                    if (operators[token.name ?? ''].argc !== 1) {
                        if (!prevToken ||
                            !(prevToken.type == TokenType.NUMBER ||
                                prevToken.type == TokenType.VARIABLE ||
                                prevToken.type == TokenType.RPAREN)) {
                            if (nextToken && (token.name == '+' || token.name == '-')) {
                                //unary operators have \
                                token.name = '\\' + token.name;
                                //continue;
                            }
                            else {
                                this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.WARNING, `Missing left-side argument for operator '${token.name}', ignoring it`));
                                //tokens.splice(i, 1);
                                //i--;
                                // continue;
                                token.type = TokenType.INVALID;
                            }
                        }
                    }
                    //check right-side arg
                    if (operators[token.name ?? ''].argc > 0) {
                        if (!nextToken ||
                            !(nextToken.type == TokenType.NUMBER ||
                                nextToken.type == TokenType.VARIABLE ||
                                nextToken.type == TokenType.FUNCTION ||
                                nextToken.type == TokenType.OPERATOR ||
                                nextToken.type == TokenType.LPAREN)) {
                            this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.WARNING, `Missing right-side argument for operator '${token.name}', ignoring it`));
                            //tokens.splice(i, 1);
                            //i--;
                            //continue;
                            token.type = TokenType.INVALID;
                        }
                    }
                    break;
                case TokenType.LPAREN:
                    //checking is not necessary
                    break;
                case TokenType.EQUAL:
                    if (!prevToken ||
                        !(prevToken.type == TokenType.NUMBER ||
                            prevToken.type == TokenType.VARIABLE ||
                            prevToken.type == TokenType.OPERATOR ||
                            prevToken.type == TokenType.RPAREN)) {
                        this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.ERROR, `Left-side of '${token.name}' has invalid syntax.`));
                    }
                    if (!nextToken ||
                        !(nextToken.type == TokenType.NUMBER ||
                            nextToken.type == TokenType.VARIABLE ||
                            nextToken.type == TokenType.FUNCTION ||
                            nextToken.type == TokenType.OPERATOR ||
                            nextToken.type == TokenType.LPAREN)) {
                        this.problems.push(problem(token.pos, token.name?.length ?? 0, Severity.ERROR, `Right-side of '${token.name}' has invalid syntax.`));
                    }
                    break;
            }
        }
        //console.log(this.tokenStack);
        return this;
    }
    parse(tokens = this.tokenStack, destination = this.outputQueue) {
        const operatorStack = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            switch (token.type) {
                case TokenType.VARIABLE:
                case TokenType.NUMBER:
                    destination.push(token);
                    break;
                case TokenType.FUNCTION:
                    let scope = 0;
                    let args = [];
                    let currentStart = i + 2;
                    for (let j = currentStart; j < tokens.length; j++) {
                        if (tokens[j].type == TokenType.LPAREN) {
                            scope++;
                            continue;
                        }
                        else if (tokens[j].type == TokenType.RPAREN) {
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
                        else if (scope === 0 && tokens[j].type == TokenType.COMMA) {
                            args.push(tokens.slice(currentStart, j));
                            currentStart = j + 1;
                        }
                    }
                    let parsedArgs = [];
                    //now recursively process all arguments
                    for (let k = 0; k < args.length; k++) {
                        parsedArgs[k] = [];
                        this.parse(args[k], parsedArgs[k]);
                    }
                    token.arguments = parsedArgs;
                    destination.push(token);
                    break;
                case TokenType.OPERATOR:
                    if (operators[token.name ?? ''].argc < 0) {
                        //operators which are written after operand (such as '!')
                        destination.push(token);
                        break;
                    }
                    let top = operatorStack.at(-1);
                    while (top && top.type != TokenType.LPAREN && (operators[top.name ?? ''].precedence > operators[token.name ?? ''].precedence || (operators[top.name ?? ''].precedence === operators[token.name ?? ''].precedence && operators[token.name ?? ''].assoc === 'left'))) {
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
                            return this;
                        }
                        destination.push(lastOp);
                    }
                    const lparen = operatorStack.pop();
                    if (!lparen || lparen.type != TokenType.LPAREN) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Mismatched parentheses: missing right parenthesis ')'`));
                    }
                    const pop = operatorStack.at(-1);
                    if (pop && pop.type == TokenType.FUNCTION) {
                        operatorStack.pop();
                        destination.push(pop);
                    }
                    break;
                // else if (token.type == TokenType.COMMA) {
                // }
                case TokenType.EQUAL:
                    while (operatorStack.length) {
                        const op = operatorStack.pop();
                        if (!op || op.type == TokenType.LPAREN || op.type == TokenType.RPAREN) {
                            this.problems.push(problem(op?.pos ?? 0, op?.name?.length ?? 0, Severity.ERROR, `Mismatched parentheses`));
                            return this;
                        }
                        destination.push(op);
                    }
                    destination.push(token);
                    break;
            }
        }
        while (operatorStack.length) {
            const op = operatorStack.pop();
            if (!op || op.type == TokenType.LPAREN || op.type == TokenType.RPAREN) {
                this.problems.push(problem(op?.pos ?? 0, op?.name?.length ?? 0, Severity.ERROR, `Mismatched parentheses`));
                return this;
            }
            destination.push(op);
        }
        console.log(destination);
        return this;
    }
    evaluate(variables, tokens = this.outputQueue) {
        switch (this.getExpressionType(tokens)) {
            case ExpressionType.FUNCTION:
                const i = tokens.findIndex(e => e.type == TokenType.EQUAL);
                let tok = tokens;
                if (i > -1) {
                    tok = tokens.slice(i + 1);
                }
                return this.evaluateInternal(variables, tok);
            case ExpressionType.YFUNCTION:
                const j = tokens.findIndex(e => e.type == TokenType.EQUAL);
                let tok2 = tokens;
                if (j > -1) {
                    tok2 = tokens.slice(j + 1);
                }
                //variables['y'] = variables['x'];
                //delete variables['x'];
                return this.evaluateInternal(variables, tok2);
            case ExpressionType.EQUATION:
                const k = tokens.findIndex(e => e.type == TokenType.EQUAL);
                if (k > -1) {
                    const left = tokens.slice(0, k);
                    const right = tokens.slice(k + 1);
                    return Math.abs(this.evaluateInternal(variables, left) - this.evaluateInternal(variables, right)) <= 1 / variables['res'] ? 1 : 0;
                }
                throw new ParserFatalError("Internal error: expression is equality and is missing '='");
            case ExpressionType.INEQUALITY:
                throw new ParserFatalError('Inequalities are currently not supported.');
            //case ExpressionType.POLAR:
            default:
                throw new ParserFatalError('This type of expression is currently not supported.');
        }
    }
    evaluateInternal(variables, tokens = this.outputQueue) {
        let tmpStack = [];
        let asymptotes = [];
        for (const token of tokens) {
            switch (token.type) {
                case TokenType.NUMBER:
                    tmpStack.push(token.value ?? NaN);
                    break;
                case TokenType.FUNCTION:
                    const args = [];
                    const argc = Math.abs(functions[token.name ?? ''].argc);
                    if (!token.arguments)
                        token.arguments = [];
                    const providedArgs = token.arguments.length;
                    if (providedArgs > argc) {
                        this.problems.push(problem(0, 0, Severity.WARNING, `Too much arguments: function '${token.name}' expects ${argc} arguments, ${providedArgs} provided. Excess arguments are ignored.`));
                        while (token.arguments.length > argc)
                            token.arguments?.pop();
                    }
                    else if (providedArgs < argc) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Not enough arguments: function '${token.name}' expects ${argc} arguments, ${providedArgs} provided.`));
                    }
                    //special functions
                    //sum(1/(2n-1)sin((2n-1)x),n,1,100)
                    //square
                    //sin(x)+1/3sin(3x)+1/5sin(5x)+1/7sin(7x)+1/9sin(9x)+1/11sin(11x)+1/13sin(13x)+1/15sin(15x)+1/17sin(17x)+1/19sin(19x)+1/21sin(21x)
                    if (token.name == 'sum' || token.name == 'prod') {
                        const start = this.evaluateInternal(variables, token.arguments[2]);
                        const end = this.evaluateInternal(variables, token.arguments[3]);
                        if (token.arguments[1].length !== 1 || token.arguments[1][0].type != TokenType.VARIABLE) {
                            this.problems.push(problem(token.pos, 1, Severity.ERROR, `Second argument to '${token.name}' function must be a variable name (for example 'n').`));
                        }
                        const variable = token.arguments[1][0].name ?? '';
                        let result = 0;
                        for (let i = start; i < end; i++) {
                            variables[variable] = i;
                            if (token.name == 'sum') {
                                result += this.evaluateInternal(variables, token.arguments[0]);
                            }
                            else {
                                result *= this.evaluateInternal(variables, token.arguments[0]);
                            }
                        }
                        tmpStack.push(result);
                        break;
                    }
                    else if (token.name == 'der' || token.name == 'derivative') {
                        const vars = structuredClone(variables);
                        const dx = 1e-6;
                        vars['x'] -= dx;
                        const y1 = this.evaluateInternal(variables, token.arguments[0]);
                        const y2 = this.evaluateInternal(vars, token.arguments[0]);
                        tmpStack.push((y1 - y2) / dx);
                        break;
                    }
                    //else if (token.name == 'int' || token.name == 'integrate') {
                    //const vars = variables;
                    // const dx = 1e-6;
                    // vars['x'] -= dx;
                    // const y1 = this.evaluate(variables, token.arguments![0]);
                    // const y2 = this.evaluate(vars, token.arguments![0]);
                    // tmpStack.push((y1) * dx);
                    //    tmpStack.push(0);
                    //    break;
                    //}
                    // if (token.name == 'log') {
                    //     const vars = structuredClone(variables);
                    //     vars['x'] = 0;
                    //     asymptotes.push(-this.evaluateInternal(vars, token.arguments[0]).result);
                    // }
                    //recursively evaluate all arguments
                    for (const arg of token.arguments) {
                        const res = this.evaluateInternal(variables, arg);
                        args.push(res);
                        //asymptotes = asymptotes.concat(res.asymptotes);
                    }
                    //goniometric functions have one hidden argument (degrees/radians)
                    if (token.name == 'sin' || token.name == 'cos' || token.name == 'tan' || token.name == 'tg') {
                        args.push(variables['degrees'] ? Math.PI / 180 : 1);
                    }
                    tmpStack.push(functions[token.name ?? ''].fn(args));
                    break;
                case TokenType.VARIABLE:
                    const val = variables[token.name ?? ''];
                    if (val === undefined) {
                        this.problems.push(problem(0, 0, Severity.ERROR, `Variable '${token.name}' is not defined.`)); //Value for variable '${token.value}' was not provided
                    }
                    tmpStack.push(val);
                    break;
                case TokenType.OPERATOR:
                    {
                        const args = [];
                        const argc = Math.abs(operators[token.name ?? ''].argc);
                        for (let i = 0; i < argc; i++) {
                            const arg = tmpStack.pop();
                            if (arg === undefined) {
                                this.problems.push(problem(i, 0, Severity.ERROR, `Internal Error: Not enough arguments for operator '${token.name}'.`));
                                //placeholder for typescript, function 'problem' throws
                                throw 0;
                            }
                            args.push(arg);
                        }
                        args.reverse();
                        tmpStack.push(operators[token.name ?? ''].fn(args));
                    }
                    break;
            }
        }
        //console.log(tmpStack);
        // this.result = tmpStack[0];
        // return this;
        return tmpStack[0];
        //return { result: tmpStack[0], asymptotes: asymptotes };
    }
    getExpressionType(tokens = this.outputQueue) {
        const i = tokens.findIndex(e => e.type == TokenType.EQUAL);
        if (i > -1) {
            if (tokens[i].name != '=') {
                return ExpressionType.INEQUALITY;
            }
            const left = tokens.slice(0, i);
            if (left.length == 1 && left[0].type == TokenType.VARIABLE) {
                if (left[0].name == 'y') {
                    //regular function
                    return ExpressionType.FUNCTION;
                }
                else if (left[0].name == 'x') {
                    //function x in terms of y
                    return ExpressionType.YFUNCTION;
                }
            }
            //generic equation
            return ExpressionType.EQUATION;
        }
        //no equal sign: regular function
        return ExpressionType.FUNCTION;
    }
    getSupportedFunctions() {
        let fun = '';
        for (const fn in functions) {
            fun += fn + ' ';
        }
        return fun.trimEnd();
    }
}
function insertMultiplyToken(pos) {
    return { type: TokenType.OPERATOR, name: '*', pos };
}
const g = 7;
const C = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];
// https://en.wikipedia.org/wiki/Lanczos_approximation
const gamma = (z) => {
    if (z < 0.5)
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    else {
        z--;
        let x = C[0];
        for (let i = 1; i < g + 2; i++)
            x += C[i] / (z + i);
        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
};
//# sourceMappingURL=parser.js.map