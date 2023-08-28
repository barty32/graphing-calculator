

interface Key {
	row: string,
	col: string,
	class?: string,
	content: string,
	cmd: string,
	shiftContent?: string,
	shiftCmd?: string,
	holdAction?: 'repeat' | { content: string, cmd: string }[]
}

//SVGs
const shift = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height"24" viewBox="0 0 384 512" fill="currentColor"><path d="M2.438 252.3C7.391 264.2 19.06 272 32 272h80v160c0 26.51 21.49 48 48 48h64C250.5 480 272 458.5 272 432v-160H352c12.94 0 24.61-7.797 29.56-19.75c4.953-11.97 2.219-25.72-6.938-34.88l-160-176C208.4 35.13 200.2 32 192 32S175.6 35.13 169.4 41.38l-160 176C.2188 226.5-2.516 240.3 2.438 252.3zM192 86.63L313.4 224H224v208H160V224H70.63L192 86.63z"></path></svg>`;
const enter = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height"24" viewBox="0 0 512 512" fill="currentColor"><path d="M135 432.1l-128-128C2.344 300.3 0 294.2 0 288s2.344-12.28 7.031-16.97l128-128c9.375-9.375 24.56-9.375 33.94 0s9.375 24.56 0 33.94L81.94 264H464v-208C464 42.75 474.8 32 488 32S512 42.75 512 56V288c0 13.25-10.75 24-24 24H81.94l87.03 87.03c9.375 9.375 9.375 24.56 0 33.94S144.4 442.3 135 432.1z"></path></svg>`;
const backspace = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height"24" viewBox="0 0 576 512" fill="currentColor"><path d="M432.1 208.1L385.9 256L432.1 303C442.3 312.4 442.3 327.6 432.1 336.1C423.6 346.3 408.4 346.3 399 336.1L352 289.9L304.1 336.1C295.6 346.3 280.4 346.3 271 336.1C261.7 327.6 261.7 312.4 271 303L318.1 256L271 208.1C261.7 199.6 261.7 184.4 271 175C280.4 165.7 295.6 165.7 304.1 175L352 222.1L399 175C408.4 165.7 423.6 165.7 432.1 175C442.3 184.4 442.3 199.6 432.1 208.1V208.1zM512 64C547.3 64 576 92.65 576 128V384C576 419.3 547.3 448 512 448H205.3C188.3 448 172 441.3 160 429.3L9.372 278.6C3.371 272.6 0 264.5 0 256C0 247.5 3.372 239.4 9.372 233.4L160 82.75C172 70.74 188.3 64 205.3 64L512 64zM528 128C528 119.2 520.8 112 512 112H205.3C201 112 196.9 113.7 193.9 116.7L54.63 256L193.9 395.3C196.9 398.3 201 400 205.3 400H512C520.8 400 528 392.8 528 384V128z"></path></svg>`;
const left = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
const right = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
const trash = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
const keyboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" fill="currentColor"><path d="M64 112c-8.8 0-16 7.2-16 16V384c0 8.8 7.2 16 16 16H512c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zM0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM176 320H400c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm-72-72c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16z" /></svg>`;
const caretdown = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 320 512" fill="currentColor"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" /></svg>`;

const sqrt = `<svg
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   stroke-width="2"
   stroke-linecap="round"
   stroke-linejoin="round"
   xmlns="http://www.w3.org/2000/svg">
  <path
     style="stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
     d="M 2.1249352,13.091278 2.9725735,11.354824 5.9668308,17.574401 10.832184,5.0804153 h 11.29932" />
  <rect
     style="stroke-width:0.8;stroke-linecap:round;stroke-dasharray:0.80000001,1.60000002;stroke-opacity:1;stroke-dashoffset:0"
     width="8.3290119"
     height="7.8160138"
     x="12.340064"
     y="8.332737"
     d="m 13.340064,8.332737 h 6.329012 a 1,1 45 0 1 1,1 v 5.816014 a 1,1 135 0 1 -1,1 h -6.329012 a 1,1 45 0 1 -1,-1 V 9.332737 a 1,1 135 0 1 1,-1 z" />
</svg>`;

const sqrtn = `<svg
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   stroke-width="2"
   stroke-linecap="round"
   stroke-linejoin="round"
   xmlns="http://www.w3.org/2000/svg">
  <path
     style="stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
     d="M 2.1249352,13.091278 2.9725735,11.354824 5.9668308,17.574401 10.832184,5.0804153 h 11.29932"
     />
  <rect
     style="stroke-width:0.8;stroke-linecap:round;stroke-dasharray:0.80000001,1.60000002;stroke-opacity:1;stroke-dashoffset:0"
     width="8.3290119"
     height="7.8160138"
     x="12.340064"
     y="8.332737"
     d="m 13.340064,8.332737 h 6.329012 a 1,1 45 0 1 1,1 v 5.816014 a 1,1 135 0 1 -1,1 h -6.329012 a 1,1 45 0 1 -1,-1 V 9.332737 a 1,1 135 0 1 1,-1 z" />
  <path
     style="stroke-width:0.7;stroke-linecap:round;stroke-dasharray:0.69999999,1.39999998;stroke-dashoffset:1.67999997;stroke-opacity:1;stroke-miterlimit:4;stroke-linejoin:miter"
     width="4.54777"
     height="4.2676649"
     x="2.5456882"
     y="4.3631086"
     d="m 3.5456882,4.3631086 h 2.54777 a 1,1 45 0 1 1,1 v 2.2676649 a 1,1 135 0 1 -1,1 h -2.54777 a 1,1 45 0 1 -1,-1 V 5.3631086 a 1,1 135 0 1 1,-1 z" />
</svg>`;
const reciprocal = `<svg
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="currentColor"
   stroke="currentColor"
   stroke-width="2"
   stroke-linecap="round"
   stroke-linejoin="round"
   xmlns="http://www.w3.org/2000/svg">
  <path
     style="fill:none;stroke-width:0.8;stroke-linecap:round;stroke-dasharray:0.8, 1.6;stroke-dashoffset:0;stroke-opacity:1"
     width="8.3290119"
     height="7.8160138"
     x="7.835494"
     y="14.084469"
     d="m 8.835494,14.084469 h 6.329012 a 1,1 45 0 1 1,1 v 5.816014 a 1,1 135 0 1 -1,1 H 8.835494 a 1,1 45 0 1 -1,-1 v -5.816014 a 1,1 135 0 1 1,-1 z" />
  <path
     style="stroke-width:0.886463px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
     d="M 6.7464733,12 H 17.253527"
      />
  <text
     xml:space="preserve"
     style="font-style:normal;font-weight:normal;font-size:12px;line-height:1.25;font-family:'Times New Roman';fill-opacity:1;stroke:none;-inkscape-font-specification:'Times New Roman, ';font-stretch:normal;font-variant:normal"
     x="9.0644531"
     y="10.180139"
     id="text8505"><tspan
       id="tspan8503"
       x="9.0644531"
       y="10.180139"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:12px;font-family:'Times New Roman';-inkscape-font-specification:'Times New Roman, '">1</tspan></text>
</svg>`;

const keysNumbers: Key[] = [
	{ row: '1', col: '1', class: 'char italic', content: `x`, cmd: 'x', shiftContent: `a`, shiftCmd: 'a', },
	{ row: '1', col: '2', class: 'char italic', content: `y`, cmd: 'y', shiftContent: `b`, shiftCmd: 'b', },
	{ row: '2', col: '1', class: 'symbol', content: `&lt;`, cmd: '<', shiftContent: `≤`, shiftCmd: '<=' },
	{ row: '2', col: '2', class: 'symbol', content: `&gt;`, cmd: '>', shiftContent: `≥`, shiftCmd: '>=' },
	{ row: '3', col: '1', content: '(', cmd: '(', shiftContent: '[', shiftCmd: '[', },
	{ row: '3', col: '2', content: ')', cmd: ')', shiftContent: ']', shiftCmd: ']', },
	{ row: '4', col: '1 / span 2', content: shift, cmd: '\\shift', shiftContent: shift, shiftCmd: '\\unshift' },

	{ row: '4', col: '4', content: '0', cmd: '0', shiftContent: `<span class="symbol">∞</span>`, shiftCmd: 'infty' },
	{ row: '3', col: '4', content: '1', cmd: '1', shiftContent: `<span class="char"><i>x</i><sup>-1</sup></span>`, shiftCmd: '^-1\\moveright' },
	{ row: '3', col: '5', content: '2', cmd: '2', shiftContent: `<span class="char"><i>x</i><sup>2</sup></span>`, shiftCmd: '^2\\moveright' },
	{ row: '3', col: '6', content: '3', cmd: '3', shiftContent: `<span class="char"><i>x</i><sup>3</sup></span>`, shiftCmd: '^3\\moveright' },
	{ row: '2', col: '4', content: '4', cmd: '4', shiftContent: `<span class="char"><i>x</i><sup>4</sup></span>`, shiftCmd: '^4\\moveright' },
	{ row: '2', col: '5', content: '5', cmd: '5', shiftContent: `<span class="char"><i>x</i><sup>5</sup></span>`, shiftCmd: '^5\\moveright' },
	{ row: '2', col: '6', content: '6', cmd: '6', shiftContent: `<span class="char"><i>x</i><sup>6</sup></span>`, shiftCmd: '^6\\moveright' },
	{ row: '1', col: '4', content: '7', cmd: '7', shiftContent: `<span class="char"><i>x</i><sup>7</sup></span>`, shiftCmd: '^7\\moveright' },
	{ row: '1', col: '5', content: '8', cmd: '8', shiftContent: `<span class="char"><i>x</i><sup>8</sup></span>`, shiftCmd: '^8\\moveright' },
	{ row: '1', col: '6', content: '9', cmd: '9', shiftContent: `<span class="char"><i>x</i><sup>9</sup></span>`, shiftCmd: '^9\\moveright' },

	{ row: '4', col: '5', content: '.', cmd: '.', shiftContent: `<span style="font-family: Symbola, 'Times New Roman', serif">,</span>`, shiftCmd: ',' },
	{ row: '1', col: '7', content: '<b>÷</b>', cmd: '/', shiftContent: reciprocal, shiftCmd: '1/' },
	{ row: '2', col: '7', content: '<b>×</b>', cmd: '*', shiftContent: `<span class="symbol">∏</span>`, shiftCmd: 'prod' },
	{ row: '3', col: '7', content: '<b>-</b>', cmd: '-', shiftContent: `<span class="symbol">±</span>`, shiftCmd: '±' },
	{ row: '4', col: '7', content: '<b>+</b>', cmd: '+', shiftContent: `<span class="symbol">∑</span>`, shiftCmd: 'sum' },
	{ row: '4', col: '6', content: '<b>=</b>', cmd: '=', shiftContent: `<span class="symbol">≠</span>`, shiftCmd: '≠' },

	{ row: '1', col: '9', content: `<span style="font-family: 'Times New Roman', Symbola, serif"><i>x</i><sup>2</sup></span>`, cmd: '^2\\moveright', shiftContent: `<span style="font-family: 'Times New Roman', Symbola, serif"><i>x</i><sup>2</sup></span>`, shiftCmd: '^3\\moveright' },
	{ row: '1', col: '10', content: `<span style="font-family: 'Times New Roman', Symbola, serif"><i>x</i><sup>n</sup></span>`, cmd: '^', shiftContent: `<span style="font-family: 'Times New Roman', Symbola, serif"><i>x</i><sub>n</sub></span>`, shiftCmd: '_' },
	{ row: '1', col: '11', content: sqrt, cmd: 'sqrt', shiftContent: sqrtn, shiftCmd: 'root' },
	{ row: '2', col: '9', content: `<span style="font-family: 'Times New Roman', Symbola, serif">π</span>`, cmd: 'pi', shiftContent: `<span style="font-family: 'Times New Roman', Symbola, serif"><i>e</i></span>`, shiftCmd: 'e' },
	{ row: '2', col: '10', content: `<span style="font-family: 'Times New Roman', Symbola, serif">|<i>a</i>|</span>`, cmd: '|', shiftContent: `<span style="font-family: 'Times New Roman', Symbola, serif"><i>a</i>!</span>`, shiftCmd: '!' },
	{ row: '2', col: '11', content: `<span style="font-family: 'Times New Roman', Symbola, serif">%</span>`, cmd: '%', shiftContent: '°', shiftCmd: '°' },
	{ row: '3', col: '9', content: '\'', cmd: '\'', shiftContent: '\'\'', shiftCmd: '\'\'' },
	{ row: '3', col: '10', content: `<span style="font-family: Symbola, 'Times New Roman', serif">∫</span>`, cmd: 'int', shiftContent: `<span style="font-family: Symbola, 'Times New Roman', serif">∫</span>`, shiftCmd: 'int' },
	{ row: '3', col: '11', content: backspace, cmd: '\\backspace', shiftContent: trash, shiftCmd: '\\deleteall', holdAction: 'repeat' },
	{ row: '4', col: '9', content: left, cmd: '\\moveleft', shiftContent: '<<', shiftCmd: '\\start' },
	{ row: '4', col: '10', content: right, cmd: '\\moveright', shiftContent: '>>', shiftCmd: '\\end' },
	{ row: '4', col: '11', content: enter, cmd: '\\enter', shiftContent: enter, shiftCmd: '\\enter' },
];

const keysFunctions: Key[] = [
	{ row: '1', col: '1 / span 2', content: 'sin', cmd: 'sin', shiftContent: '', shiftCmd: '', },
	{ row: '2', col: '1 / span 2', content: 'cos', cmd: 'cos', shiftContent: '', shiftCmd: '', },
	{ row: '3', col: '1 / span 2', content: 'tan', cmd: 'tan', shiftContent: '', shiftCmd: '', },
	{ row: '4', col: '1', content: 'trig', cmd: '', shiftContent: '', shiftCmd: '', },
	{ row: '4', col: '2', content: 'hyp', cmd: '', shiftContent: '', shiftCmd: '', },

	{ row: '1', col: '4', content: sqrt, cmd: 'sqrt', shiftContent: '', shiftCmd: '' },
	{ row: '1', col: '5', content: sqrtn, cmd: '', shiftContent: '', shiftCmd: '' },
	{ row: '2', col: '4', content: '!', cmd: '!', shiftContent: '', shiftCmd: '' },
	{ row: '2', col: '5', content: 'ln', cmd: 'ln', shiftContent: '', shiftCmd: '' },
	{ row: '3', col: '4', content: 'log', cmd: 'log', shiftContent: '', shiftCmd: '' },
	{ row: '3', col: '5', content: 'log<sub>a</sub>', cmd: 'log_', shiftContent: '', shiftCmd: '' },
	{ row: '4', col: '4', content: '∑', cmd: 'sum', shiftContent: '', shiftCmd: '' },
	{ row: '4', col: '5', content: '∏', cmd: 'prod', shiftContent: '', shiftCmd: '' },

	{ row: '1', col: '7', content: '\'', cmd: '\'', shiftContent: '', shiftCmd: '' },
	{ row: '1', col: '8', content: '\'\'', cmd: '\'\'', shiftContent: '', shiftCmd: '' },
	{ row: '2', col: '7', content: '∫_a^b', cmd: 'int', shiftContent: '', shiftCmd: '' },
	{ row: '2', col: '8', content: '∫', cmd: 'int_0^x', shiftContent: '', shiftCmd: '' },
	{ row: '3', col: '7', content: 'exp', cmd: 'exp', shiftContent: '', shiftCmd: '' },
	{ row: '3', col: '8', content: 'abs', cmd: 'abs', shiftContent: '', shiftCmd: '' },
	{ row: '4', col: '7', content: 'π', cmd: 'pi', shiftContent: '', shiftCmd: '' },
	{ row: '4', col: '8', content: 'e', cmd: 'e', shiftContent: '', shiftCmd: '' },

	{ row: '1', col: '10', content: 'mod', cmd: 'mod', shiftContent: '', shiftCmd: '' },
	{ row: '1', col: '11', content: 'sign', cmd: 'sign', shiftContent: '', shiftCmd: '' },
	{ row: '2', col: '10', content: 'round', cmd: 'round', shiftContent: '', shiftCmd: '' },
	{ row: '2', col: '11', content: 'trunc', cmd: 'trunc', shiftContent: '', shiftCmd: '' },
	{ row: '3', col: '10', content: 'floor', cmd: 'floor', shiftContent: '', shiftCmd: '' },
	{ row: '3', col: '11', content: 'ceil', cmd: 'ceil', shiftContent: '', shiftCmd: '' },
	{ row: '4', col: '10', content: 'min', cmd: 'min', shiftContent: '', shiftCmd: '' },
	{ row: '4', col: '11', content: 'max', cmd: 'max', shiftContent: '', shiftCmd: '' },
];

const keysLetters: Key[] = [
	{ row: '1', col: '1 / span 2', content: '1', cmd: '1', shiftContent: 'x<sup>-1</sup>', shiftCmd: '^-1\\moveright' },
	{ row: '1', col: '3 / span 2', content: '2', cmd: '2', shiftContent: 'x<sup>2</sup>', shiftCmd: '^2\\moveright' },
	{ row: '1', col: '5 / span 2', content: '3', cmd: '3', shiftContent: 'x<sup>3</sup>', shiftCmd: '^3\\moveright' },
	{ row: '1', col: '7 / span 2', content: '4', cmd: '4', shiftContent: 'x<sup>4</sup>', shiftCmd: '^4\\moveright' },
	{ row: '1', col: '9 / span 2', content: '5', cmd: '5', shiftContent: 'x<sup>5</sup>', shiftCmd: '^5\\moveright' },
	{ row: '1', col: '11 / span 2', content: '6', cmd: '6', shiftContent: 'x<sup>6</sup>', shiftCmd: '^6\\moveright' },
	{ row: '1', col: '13 / span 2', content: '7', cmd: '7', shiftContent: 'x<sup>7</sup>', shiftCmd: '^7\\moveright' },
	{ row: '1', col: '15 / span 2', content: '8', cmd: '8', shiftContent: 'x<sup>8</sup>', shiftCmd: '^8\\moveright' },
	{ row: '1', col: '17 / span 2', content: '9', cmd: '9', shiftContent: 'x<sup>9</sup>', shiftCmd: '^9\\moveright' },
	{ row: '1', col: '19 / span 2', content: '0', cmd: '0', shiftContent: '∞', shiftCmd: 'infty' },

	{ row: '2', col: '1 / span 2', content: 'q', cmd: 'q', shiftContent: 'Q', shiftCmd: 'Q', },
	{ row: '2', col: '3 / span 2', content: 'w', cmd: 'w', shiftContent: 'W', shiftCmd: 'W', },
	{ row: '2', col: '5 / span 2', content: 'e', cmd: 'e', shiftContent: 'E', shiftCmd: 'E', },
	{ row: '2', col: '7 / span 2', content: 'r', cmd: 'r', shiftContent: 'R', shiftCmd: 'R', },
	{ row: '2', col: '9 / span 2', content: 't', cmd: 't', shiftContent: 'T', shiftCmd: 'T', },
	{ row: '2', col: '11 / span 2', content: 'y', cmd: 'y', shiftContent: 'Y', shiftCmd: 'Y', },
	{ row: '2', col: '13 / span 2', content: 'u', cmd: 'u', shiftContent: 'U', shiftCmd: 'U', },
	{ row: '2', col: '15 / span 2', content: 'i', cmd: 'i', shiftContent: 'I', shiftCmd: 'I', },
	{ row: '2', col: '17 / span 2', content: 'o', cmd: 'o', shiftContent: 'O', shiftCmd: 'O', },
	{ row: '2', col: '19 / span 2', content: 'p', cmd: 'p', shiftContent: 'P', shiftCmd: 'P', },

	{ row: '3', col: '2 / span 2', content: 'a', cmd: 'a', shiftContent: 'A', shiftCmd: 'A', },
	{ row: '3', col: '4 / span 2', content: 's', cmd: 's', shiftContent: 'S', shiftCmd: 'S', },
	{ row: '3', col: '6 / span 2', content: 'd', cmd: 'd', shiftContent: 'D', shiftCmd: 'D', },
	{ row: '3', col: '8 / span 2', content: 'f', cmd: 'f', shiftContent: 'F', shiftCmd: 'F', },
	{ row: '3', col: '10 / span 2', content: 'g', cmd: 'g', shiftContent: 'G', shiftCmd: 'G', },
	{ row: '3', col: '12 / span 2', content: 'h', cmd: 'h', shiftContent: 'H', shiftCmd: 'H', },
	{ row: '3', col: '14 / span 2', content: 'j', cmd: 'j', shiftContent: 'J', shiftCmd: 'J', },
	{ row: '3', col: '16 / span 2', content: 'k', cmd: 'k', shiftContent: 'K', shiftCmd: 'K', },
	{ row: '3', col: '18 / span 2', content: 'l', cmd: 'l', shiftContent: 'L', shiftCmd: 'L', },

	{ row: '4', col: '1 / span 3', content: shift, cmd: '\\shift', shiftContent: shift, shiftCmd: '\\unshift', },
	{ row: '4', col: '4 / span 2', content: 'z', cmd: 'z', shiftContent: 'Z', shiftCmd: 'Z', },
	{ row: '4', col: '6 / span 2', content: 'x', cmd: 'x', shiftContent: 'X', shiftCmd: 'X', },
	{ row: '4', col: '8 / span 2', content: 'c', cmd: 'c', shiftContent: 'C', shiftCmd: 'C', },
	{ row: '4', col: '10 / span 2', content: 'v', cmd: 'v', shiftContent: 'V', shiftCmd: 'V', },
	{ row: '4', col: '12 / span 2', content: 'b', cmd: 'b', shiftContent: 'B', shiftCmd: 'B', },
	{ row: '4', col: '14 / span 2', content: 'n', cmd: 'n', shiftContent: 'N', shiftCmd: 'N', },
	{ row: '4', col: '16 / span 2', content: 'm', cmd: 'm', shiftContent: 'M', shiftCmd: 'M', },
	{ row: '4', col: '18 / span 3', content: backspace, cmd: '\\backspace', shiftContent: trash, shiftCmd: '\\deleteall', holdAction: 'repeat' },

	{ row: '5', col: '1 / span 2', content: '-', cmd: '-', shiftContent: '+-', shiftCmd: 'pm', },
	{ row: '5', col: '3 / span 2', content: '+', cmd: '+', shiftContent: 'sum', shiftCmd: 'sum', },
	{ row: '5', col: '5 / span 2', content: '=', cmd: '=', shiftContent: '!=', shiftCmd: '!=', },
	{ row: '5', col: '7 / span 3', content: ' ', cmd: ' ', shiftContent: ' ', shiftCmd: ' ', },
	{ row: '5', col: '10 / span 2', content: ',', cmd: ',', shiftContent: ',', shiftCmd: ',', },
	{ row: '5', col: '12 / span 2', content: '.', cmd: '.', shiftContent: '.', shiftCmd: '.', },
	{ row: '5', col: '14 / span 2', content: left, cmd: '\\moveleft', shiftContent: '<<', shiftCmd: '\\start' },
	{ row: '5', col: '16 / span 2', content: right, cmd: '\\moveright', shiftContent: '>>', shiftCmd: '\\end' },
	{ row: '5', col: '18 / span 3', content: enter, cmd: '\\enter', shiftContent: enter, shiftCmd: '\\enter', },
]

var keyboardShown = false;

export class Keyboard {

	DOM: {
		keyboard: HTMLDivElement,
		container: HTMLDivElement,
		closeBtn: HTMLSpanElement,
		numberKeyboard: HTMLDivElement,
		functionKeyboard: HTMLDivElement,
		letterKeyboard: HTMLDivElement,
		numberSwitcher: HTMLSpanElement,
		functionSwitcher: HTMLSpanElement,
		letterSwitcher: HTMLSpanElement,
	};

	shown = false;
	shifted = false;
	handler: (cmd: string) => void;
	onOpened: () => void;
	onClosed: () => void;

	constructor(element: HTMLDivElement, handler: (cmd: string) => void) {
		this.handler = handler;

		element.innerHTML = `
			<div class="keyboard-container">
				<span class="keyboard-switcher">
					<span id="kb-switcher-numbers" class="active">123</span>
					<span id="kb-switcher-functions">sin</span>
					<span id="kb-switcher-letters">abc</span>
				</span>
				<div id="keyboard-numbers"></div>
				<div id="keyboard-functions" style="display: none"></div>
				<div id="keyboard-letters" style="display: none"></div>
				<div id="keyboard-greek-letters" style="display: none"></div>
			</div>
			<span id="keyboard-close" class="kb-control-button" >
				${keyboardSvg}${caretdown}
			</span>`;
		
		//get DOM elements
		this.DOM = {
			keyboard: element,
			container: element.querySelector('.keyboard-container') as HTMLDivElement,
			closeBtn: element.querySelector('#keyboard-close') as HTMLSpanElement,
			numberKeyboard: element.querySelector('#keyboard-numbers') as HTMLDivElement,
			functionKeyboard: element.querySelector('#keyboard-functions') as HTMLDivElement,
			letterKeyboard: element.querySelector('#keyboard-letters') as HTMLDivElement,
			numberSwitcher: element.querySelector('#kb-switcher-numbers') as HTMLSpanElement,
			functionSwitcher: element.querySelector('#kb-switcher-functions') as HTMLSpanElement,
			letterSwitcher: element.querySelector('#kb-switcher-letters') as HTMLSpanElement,
		}

		//fill keyboards
		this.fillKeyboard(this.DOM.numberKeyboard, keysNumbers);
		this.fillKeyboard(this.DOM.functionKeyboard, keysFunctions);
		this.fillKeyboard(this.DOM.letterKeyboard, keysLetters);

		//attach event listeners
		this.DOM.container.addEventListener('pointerdown', (e) => {
			e.preventDefault();
		});

		this.DOM.closeBtn.addEventListener('click', (e) => {
			this.hide();
		});

		this.DOM.closeBtn.addEventListener('pointerdown', (e) => {
			e.preventDefault();
		});

		//horizontal scrolling
		this.DOM.functionKeyboard.addEventListener('wheel', (e) => {
			this.DOM.functionKeyboard.scrollLeft += e.deltaY;
		});

		this.DOM.numberSwitcher.addEventListener('click', () => {
			this.DOM.numberKeyboard.style.display = '';
			this.DOM.functionKeyboard.style.display = 'none';
			this.DOM.letterKeyboard.style.display = 'none';
			this.DOM.numberSwitcher.classList.add('active');
			this.DOM.functionSwitcher.classList.remove('active');
			this.DOM.letterSwitcher.classList.remove('active');
		});

		this.DOM.functionSwitcher.addEventListener('click', () => {
			this.DOM.numberKeyboard.style.display = 'none';
			this.DOM.functionKeyboard.style.display = '';
			this.DOM.letterKeyboard.style.display = 'none';
			this.DOM.numberSwitcher.classList.remove('active');
			this.DOM.functionSwitcher.classList.add('active');
			this.DOM.letterSwitcher.classList.remove('active');
		});

		this.DOM.letterSwitcher.addEventListener('click', () => {
			this.DOM.numberKeyboard.style.display = 'none';
			this.DOM.functionKeyboard.style.display = 'none';
			this.DOM.letterKeyboard.style.display = '';
			this.DOM.numberSwitcher.classList.remove('active');
			this.DOM.functionSwitcher.classList.remove('active');
			this.DOM.letterSwitcher.classList.add('active');
		});
	}


	fillKeyboard(keyboard: HTMLDivElement, keys: Key[]) {
		for (const key of keys) {
			const el = document.createElement('div');
			el.classList.add('keyboard-button');
			if (key.class) {
				key.class.split(' ').forEach((e) => {
					el.classList.add(e);
				});
			}
			el.style.gridRow = key.row;
			el.style.gridColumn = key.col;
			el.innerHTML = key.content;
			el.setAttribute('data-content', key.content);
			el.setAttribute('data-shift-content', key.shiftContent ?? key.content);
			el.tabIndex = -1;

			let repeatTimeout: number;
			let repeatInterval: number;

			if (key.holdAction) {
				el.addEventListener('pointerdown', () => {
					if (key.holdAction == 'repeat') {
						repeatTimeout = setTimeout(() => {
							repeatInterval = setInterval(() => {
								this.keyHandler(key);
							}, 50);
						}, 500);
					}
				});
			}
			el.addEventListener('pointerup', (e) => {
				this.keyHandler(key);
				e.preventDefault();
			});

			window.addEventListener('pointerup', () => {
				clearTimeout(repeatTimeout);
				clearInterval(repeatInterval);
			});

			keyboard.appendChild(el);
		}
	}

	shift() {
		this.shifted = true;
		const buttons = this.DOM.keyboard.querySelectorAll('.keyboard-button');
		for (const button of buttons) {
			const attr = button.getAttribute('data-shift-content');
			if (attr && attr != '') {
				button.innerHTML = attr;
			}
		}
	}

	unshift() {
		this.shifted = false;
		const buttons = this.DOM.keyboard.querySelectorAll('.keyboard-button');
		for (const button of buttons) {
			const attr = button.getAttribute('data-content');
			if (attr && attr != '') {
				button.innerHTML = attr;
			}
		}
	}

	show() {
		this.shown = true;
		this.DOM.keyboard.classList.add('show');
		// this.DOM.keyboard.classList.remove('hidden');
		if (this.onOpened) this.onOpened();
	}

	hide() {
		this.shown = false;
		this.DOM.keyboard.classList.remove('show');
		// this.DOM.keyboard.classList.add('hidden');
		if (this.onClosed) this.onClosed();
	}

	keyHandler(key: Key) {
		if (key.cmd == '\\shift') {
			if (!this.shifted) {
				this.shift();
			}
			else {
				this.unshift();
			}
		}
		else {
			this.handler(this.shifted ? key.shiftCmd ?? key.cmd : key.cmd);
		}
	}
}




// const el = document.activeElement?.parentNode?.parentNode as HTMLElement;
// if (el) {
// 	const match = el.id.match(/expr-input-(\d+)/);
// 	if (match && match[1]) {
// 		const id = parseInt(match[1]);
// 		const fnInput = lines[id]?.DOM.fnInput;
// 		if (fnInput) {
// 			const cmd = keyboardShifted ? key.shiftCmd : key.cmd;
// 			if (cmd.includes('\\')) {
// 				for (const letter of cmd) {
// 					if (letter == '\\') {
// 						switch (cmd.substring(cmd.search(/\\/) + 1)) {
// 							case 'backspace':
// 								fnInput.keystroke('Backspace');
// 								break;
// 							case 'moveright':
// 								fnInput.keystroke('Right');
// 								break;
// 							case 'moveleft':
// 								fnInput.keystroke('Left');
// 								break;
// 							case 'start':
// 								fnInput.keystroke('Home');
// 								break;
// 							case 'end':
// 								fnInput.keystroke('End');
// 								break;
// 							case 'deleteall':
// 								fnInput.latex('');
// 								break;
// 							case 'enter':
// 								fnInput.keystroke('Enter');
// 								break;
// 						}
// 						break;
// 					}
// 					else {
// 						fnInput.typedText(letter);
// 					}
// 				}
// 			}
// 			else {
// 				fnInput.typedText(cmd);
// 			}
// 		}
// 	}
// }