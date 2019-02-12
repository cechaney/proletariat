const {Worker} = require('worker_threads');
const EventEmitter = require('events').EventEmitter;

let maxWorkers = 1;
let workerAquireTimeout = 100;

const pool = [];

function getWorker(){

  let w = pool.shift();

  if(w === undefined){

    setTimeout(() =>{
      w = pool.shift;
    }, workerAquireTimeout);

    if(w === undefined){
      throw new Error('No workers available');
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

      if(script == null){
        throw new Error('No script defined');
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

      let w;

      try{
        w = getWorker();
      } catch(e){
        return Promise.reject(e);
      }

      return new Promise((resolve, reject) => {

        w.on('message', (result) => {

          releaseWorker(w);

          resolve(result);

        })

        w.on('error', (error) => {

          releaseWorker(w);

          reject(error);

        });

        w.on('exit', (code) => {

          releaseWorker(w);

          if(code != 0){
            reject(`Worker exited with non 0 code: ${code}`);
          }

        });

        w.postMessage(data);

      });

    }

    shutdown(){

      pool.forEach((w) => {
        w.terminate((error, exitCode) =>{
          //eat shutdown errors
        });
      });

    }

  }

}