const {  parentPort, workerData } = require('worker_threads');

parentPort.on('message', (workItem) => {

  console.log('got message in worker');

  workItem.output = `<h1>${workItem.data.name}, this is rendered markup</h1>`

  parentPort.postMessage(workItem);

  console.log('sent message back');

  return;

});
