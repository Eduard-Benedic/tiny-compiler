 
// (add 2(subtract 4 2))   => [{ type: 'paren', value: '(' }, ...]
let express = require('express');

let app = express();


app.get('/', (req, res) => {
     let result = tokenizer('(add 2 (subtract (add 3 4) 2))');

     
     let AST = parser(result);
     res.json(AST)
})

app.listen(3005, () => {
     console.log('Listening on 3005')
})

function tokenizer(input) {
     let current = 0;

     let tokens = [];

     while (current < input.length) {
          let char = input[current];

          if (char === '(') {
               tokens.push({
                    type: 'paren',
                    value: '('
               })

               current++;

               continue;
          }

          if (char === ')') {
               tokens.push({
                    type: 'paren',
                    value: ')'
               })

               current++;
               
               continue;
          }

          let WHITESPACE = /\s/;

          if (WHITESPACE.test(char)) {
               current++;

               continue;
          }

          let NUMBERS = /[0-9]/;

          if (NUMBERS.test(char)) {
               let value = '';

               while (NUMBERS.test(char)) {
                    value += char;

                    char = input[++current];
               }

               tokens.push({
                    type: 'number',
                    value: value
               })

               continue;
          }

          if (char === '"') {
               let value = '';

               char = input[++current];

               while (char !== '"') {
                    value += char;

                    char = input[++current];
               }

               char = input[++current];

               tokens.push({
                    type: 'string',
                    value: value
               })

               continue;
          }

          let LETTERS = /[a-z]/i;

          if (LETTERS.test(char)) {
               let value = '';

               while (LETTERS.test(char)) {
                    value += char;

                    char = input[++current];
               }

               tokens.push({
                    type: 'name', 
                    value: value
               })

               continue;
          }

          throw new TypeError('Unknown character: ' + char);

     }

     return tokens;
}


function parser(tokens) {

     let current = 0;

     function walk () {

          let token = tokens[current];

          if (token.type === 'number') {
               
               current++;

               return {
                    type: 'NumberLiteral',
                    value: token.value
               }
          }

          if (token.type === 'string') {

               current++;

               return {
                    type: 'StringLiteral',
                    value: token.value
               }
          }

          if (
               token.type === 'paren' &&
               token.value === '('
          ) {
               token = tokens[++current];

               let node = {
                    type: 'CallExpression',
                    name: token.value,
                    params: []
               }

               token = tokens[++current];

               while (
                    (token.type !== 'paren') ||
                    (token.type === 'paren' && token.value !== ')')
               ) {
                    node.params.push(walk());

                    token = tokens[current];
               }

               current++;

               return node;
          }

          throw new TypeError(token.type);
     }

     let ast = {
          type: 'Program',
          body: []
     }

     while (current < tokens.length) {
          ast.body.push(walk())
     }

     return ast;
}


let res = tokenizer('(add 2 (subtract (add 3 4) 2))');

console.log(res)
let AST = parser(res);
console.log(JSON.stringify(AST));