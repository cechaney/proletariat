const {Worker} = require('worker_threads');
const uniqid = require('uniqid');

let maxWorkers = 1;
let workerAquireTimeout = 5000;
let workFinishTimeout = 5000;

const pool = [];
const queue = new Map();

function getWorker(){

  let w = pool.shift();

  if(w === undefined){
    throw(new Error('Worker queue is full'));
  }

  return w;

}

function releaseWorker(work){
  pool.push(work);
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

        w.on('message', (result) => {

          console.log(result);

          let workItem = queue.get(result.id);

          workItem.output = result.output;

          workItem.done = true;

          queue.set(result.id, workItem);

          releaseWorker(w);

        })

        w.on('error', (error) => {

          console.log(`Worker script failed: ${error}`);

          releaseWorker(w);
        });

        w.on('exit', (code) => {

          if(code != 0){
            console.log(`Worker stopped with exit code ${code}`);
          }

          releaseWorker(w);

        });

        releaseWorker(w);

      }

    }

    exec(data){

      const w = getWorker();

      let workItem = {
        id: uniqid(),
        done: false,
        data: data,
        output: null
      }

      queue.set(workItem.id, workItem);

      w.postMessage(workItem);

      return workItem.id;

    }

  }
}