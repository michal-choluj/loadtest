/**
 * Thanks to the code below we have just one .js file that imports any .ts file 
 * so that we can use TypeScript with Worker Threads easily.
 */
const path = require('path');
require('ts-node').register();
require(path.resolve(__dirname, 'threads.worker.ts'));