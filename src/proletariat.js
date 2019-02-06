const {Worker} = require('worker_threads');

let maxWorkers = 1;

const workerpool = [];
const busy = [];

module.exports = {

  WorkerPool: class {

    constructor(config, script){

      if(config){

        if(config.maxWorkers & !isNaN(config.maxWorkers)){
          maxWorkers = config.maxWorkers;
        }

        if(config.workerAquireTimeout){
          workerAquireTimeout = config.workerAquireTimeout;
        }

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

        const startTime = Date();
        let endTime = Date();

        let milliDiff = endTime - startTime;

        while (work === undefined){

          work = workerPool.shift();

          milliDiff = Date() - startTime;

          if(milliDiff > workerAquireTimeout){

            return new Promise((resolve, reject) => {
              reject('no worker available');
              console.log('Failed to get worker: timeout!');
            });

          }

        }

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