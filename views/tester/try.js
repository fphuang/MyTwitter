const pug = require('pug');

const result = pug.compileFile('try.pug');

console.log(pug.renderFile('try.pug', {name: 'Michael'}));