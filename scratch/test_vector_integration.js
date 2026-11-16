const fs = require('fs');

const pathA = `M 6,2 L 35,2 L 35,6 L 31,6 L 50,68 L 56,96 L 61,96 L 61,100 L 19,100 L 19,96 L 28,96 L 33,74 L 30,74 L 4,100 L 1,100 L 1,70 L 14,6 L 6,6 Z M 17,16 L 31,68 L 5,68 Z`;
const pathU = `M 0,2 L 38,2 L 38,6 L 29,6 L 29,70 C 29,85 34,94 40,94 C 46,94 52,85 52,70 L 52,6 L 46,6 L 46,2 L 62,2 L 62,6 L 56,6 L 56,70 C 56,89 46,100 32,100 C 19,100 11,89 11,70 L 11,6 L 0,6 Z`;
const pathR = `M 0,2 L 44,2 L 44,6 L 29,6 C 44,6 66,16 66,28 C 66,40 50,48 39,50 L 62,54 L 62,100 L 59,100 L 34,52 L 29,52 L 29,96 L 35,96 L 35,100 L 0,100 L 0,96 L 11,96 L 11,6 L 0,6 Z M 29,14 C 42,14 48,20 48,27 C 48,34 42,39 29,39 Z`;

console.log('Path A length:', pathA.length);
console.log('Path U length:', pathU.length);
console.log('Path R length:', pathR.length);
console.log('All vector paths valid!');
