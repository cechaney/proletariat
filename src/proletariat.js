const {Worker} = require('worker_threads');

let maxWorkers = 1;

const workerpool = [];
const busy = [];

module.exports = {

  WorkerPool: class {

    constructor(config, script){

      if(config && config.maxWorkers & !isNaN(config.maxWorkers)){
        maxWorkers = config.maxWorkers;
      }

      for(var i = 0; i < maxWorkers; i++){

        let work = new Worker(script, {
          eval: true,
          workerData: config
        })

        workerpool.push(work);

      }

    }

    exec(data){

      let work = workerpool.shift();

      if(work === undefined){

        return new Promise((resolve, reject) => {
          reject('no worker available');
        });

      }

      return new Promise((resolve, reject) => {

        work.on('message', (result) => {

          workerpool.push(work);

          resolve(result);

        })

        work.on('error', (error) => {

          workerpool.push(work);

          reject(`Worker script failed: ${error}`);

        });

        work.on('exit', (code) => {

          workerpool.push(work);
          
          if(code != 0){
            reject(`Worker stopped with exit code ${code}`);
          }

        });

        work.postMessage(data);

      });

    }

  }
}