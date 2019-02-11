const {  parentPort, workerData } = require('worker_threads');

parentPort.on('message', (data) => {

  const output = `<h1>${data.name}, this is rendered markup</h1>`

  parentPort.postMessage(output);

  return;

});
