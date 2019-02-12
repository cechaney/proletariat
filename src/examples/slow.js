const {  parentPort, workerData } = require('worker_threads');

parentPort.on('message', (data) => {

  const output = `Hello, ${data.name}!`

  setTimeout(function(){
    parentPort.postMessage(output);
  }, 1000);

  return;

});
