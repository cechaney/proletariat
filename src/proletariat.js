const {Worker} = require('worker_threads');
const EventEmitter = require('events').EventEmitter;

let maxWorkers = 1;
let workerAquireTimeout = 5000;

const pool = [];

function getWorker(){

  let w = pool.shift();

  if(w === undefined){

    console.log('overran the queue!');

    const startTime = new Date().getTime();

    let diff = 0;

    while(diff <= workerAquireTimeout && w === undefined){
      w = pool.shift;
    }

    if(w === undefined || diff >= workerAquireTimeout){
      throw(new Error('Worker queue is full'));
    }

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

      }

      EventEmitter.defaultMaxListeners = config.maxWorkers * 3;

      for(var i = 0; i < maxWorkers; i++){

        let w = new Worker(script, {
          eval: true,
          workerData: config
        });

        pool.push(w);

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