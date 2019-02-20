const {Worker} = require('worker_threads');
const EventEmitter = require('events').EventEmitter;

module.exports = {

  WorkerPool: class {

    constructor(config, script){

      this.maxWorkers = 1;
      this.workerAquireTimeout = 100;

      this.pool = [];

      if(config){

        if(config.hasOwnProperty('maxWorkers') && !isNaN(config.maxWorkers)){
          this.maxWorkers = config.maxWorkers;
        }

        if(config.hasOwnProperty('workerAquireTimeout')){
          this.workerAquireTimeout = config.workerAquireTimeout;
        }

      }

      if(script == null){
        throw new Error('No script defined');
      }

      EventEmitter.defaultMaxListeners = config.maxWorkers * 3;

      const wp = this;

      for(var i = 0; i < this.maxWorkers; i++){

        let w = new Worker(script, {
          eval: true,
          workerData: config
        });

      wp.pool.push(w);  

      }

    }

    getPoolsize(){
      return this.pool.length;
    }

    getWorker(){

      let w = this.pool.shift();
    
      if(w === undefined){
    
        setTimeout(() =>{
          w = this.pool.shift;
        }, this.workerAquireTimeout);
    
        if(w === undefined){
          throw new Error('No workers available');
        }
    
      }
    
      return w;
    
    }    

    exec(data){

      let that = this;
      let w;

      try{
        w = this.getWorker();
      } catch(e){
        return Promise.reject(e);
      }

      return new Promise((resolve, reject) => {

        w.on('message', (result) => {

          that.releaseWorker(w);

          resolve(result);

        })

        w.on('error', (error) => {

          that.releaseWorker(w);

          reject(error);

        });

        w.on('exit', (code) => {

          that.releaseWorker(w);

          if(code != 0){
            reject(`Worker exited with non 0 code: ${code}`);
          }

        });

        w.postMessage(data);

      });

    }

    releaseWorker(w){

      w.removeAllListeners('online');
      w.removeAllListeners('message');
      w.removeAllListeners('error');
      w.removeAllListeners('exit');
    
      this.pool.push(w);
    
    }

    shutdown(){

      this.pool.forEach((w) => {
        w.terminate((error, exitCode) =>{
          //eat shutdown errors for now
        });
      });

    }

  }

}