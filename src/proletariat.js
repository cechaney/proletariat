const {Worker} = require('worker_threads');
const uniqid = require('uniqid');

let maxWorkers = 1;
let workerAquireTimeout = 5000;
let workFinishTimeout = 5000;

const pool = [];

function getWorker(){

  let w = pool.shift();

  if(w === undefined){
    throw(new Error('Worker queue is full'));
  }

  return w;

}

function releaseWorker(w){

  w.removeAllListeners('message');
  w.removeAllListeners('error');
  w.removeAllListeners('exit');

  pool.push(w);
}


module.exports = {

  WorkerPool: class {

    constructor(config, script){

      if(config){

        if(config.maxWorkers && !isNaN(config.maxWorkers)){
          maxWorkers = config.maxWorkers;
        }

        if(config.workerAquireTimeout){
          workerAquireTimeout = config.workerAquireTimeout;
        }

        if(config.workFinishTimeout){
          workFinishTimeout = config.workFinishTimeout;
        }

      }

      for(var i = 0; i < maxWorkers; i++){

        let w = new Worker(script, {
          eval: true,
          workerData: config
        });

        releaseWorker(w);

      }

    }

    exec(data){

      return new Promise((resolve, reject) => {

        const w = getWorker();

        w.on('message', (result) => {

          releaseWorker(w);

          resolve(result);

        })

        w.on('error', (error) => {

          releaseWorker(w);

          reject(error);

        });

        w.on('exit', (code) => {

          if(code != 0){
            console.log(`Worker stopped with exit code ${code}`);
          }

          releaseWorker(w);

          reject(code);

        });

        w.postMessage(data);

      });

    }

  }
}