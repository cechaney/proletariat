const {  parentPort, workerData } = require('worker_threads');

parentPort.on('message', (value) => {
  console.log('Got a message from the parent to start work');
  render(value);
});

function render(value){
  parentPort.postMessage(`<h1>This is rendered markup: ${value.name}</h1>`);
}
