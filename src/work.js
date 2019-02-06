const {  parentPort, workerData } = require('worker_threads');

parentPort.on('message', (workItem) => {

  workItem.output = `<h1>This is rendered markup: ${workItem.data}</h1>`
  parentPort.postMessage(workItem);

});
