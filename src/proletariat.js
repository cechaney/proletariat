const {Worker} = require('worker_threads');
const uniqid = require('uniqid');

let maxWorkers = 1;
let workerAquireTimeout = 5000;
let workFinishTimeout = 30000;

const workerpool = [];
const inProgress = new Map();

function getWorker(){

  return new Promise((resolve, reject) => {

    let work = workerpool.shift();

    if(work === undefined){

      const startTime = Date().getTime();

      while (work === undefined){

        const milliDiff = Date().getTime() - startTime;

        if(milliDiff > workerAquireTimeout){
          reject('Worker aquire timed out');
        }

        work = workerpool.shift();

      }

      resolve(work);

    } else {
      resolve(work);
    }

  });

}

function releaseWorker(work){
  workerpool.push(work);
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

        let work = new Worker(script, {
          eval: true,
          workerData: config
        });

        work.on('message', (result) => {

          let workItem = inProgress.get(result.id);

          workItem.output = result.output;
          workItem.done = true;

        })

        work.on('error', (error) => {
          console.log(`Worker script failed: ${error}`);
        });

        work.on('exit', (code) => {

          if(code != 0){
            console.log(`Worker stopped with exit code ${code}`);
          }

        });

        releaseWorker(work);

      }

    }

    exec(data){

      return new Promise((resolve, reject) => {

        getWorker().then((work) => {

          let workItem = {
            id: uniqid(),
            done: false,
            data: data,
            output: null
          }

          inProgress.set(workItem.id, workItem);

          work.postMessage(workItem);

          const startTime = new Date().now();

          while (inProgress.get(workItem.id).done === false){

            const milliDiff = new Date().now() - startTime;

            if(milliDiff > workFinishTimeout){
              reject('Worker timed out');
              break;
             }

          }

          inProgress.delete(workItem);

          if(result !== null){
            resolve(inProgress.get(workItem.id).output);
          } else {
            reject('No output from worker')
          }

        }).catch((reason) => {
          reject(reason);
        });

      });

    }

  }
}