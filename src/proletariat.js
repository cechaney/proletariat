const {Worker} = require('worker_threads');
const uniqid = require('uniqid');

let maxWorkers = 1;
let workerAquireTimeout = 5000;
let workFinishTimeout = 5000;

const workerpool = [];
const inProgress = new Map();

function getWorker(){

  return new Promise((resolve, reject) => {

    let w = workerpool.shift();

    if(w === undefined){

      const startTime = new Date().getTime();

      while (w === undefined){

        const milliDiff = new Date().getTime() - startTime;

        if(milliDiff > workerAquireTimeout){
          reject('Worker aquire timed out');
        }

        w = workerpool.shift();

      }

      resolve(w);

    } else {
      resolve(w);
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

          new Promise((resolve, reject) =>{

            work.postMessage(workItem);

            resolve(workItem.id);

          }).then((value) => {
            
            while(!inProgress.get(workItem.id).output){

            }

            resolve(inProgress.get(workItem.id).output);
          }).catch((reason) =>{
            reject(reason);
          });



        }).catch((reason) => {
          reject(reason);
        });

      });

    }

  }
}