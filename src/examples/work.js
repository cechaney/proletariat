const {  parentPort, workerData } = require('worker_threads');

parentPort.on('message', (data) => {

  const output = `Hello, ${data.name}!`

  parentPort.postMessage(output);

  return;

});
