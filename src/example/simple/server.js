const fs = require('fs');
const proletariat = require('../../proletariat');

const script = fs.readFileSync(`../work.js`, 'utf8');

const pool = new proletariat.WorkerPool(
  {maxWorkers: 100},
  script);

const names = ['Jack', 'Jill', 'Hanzel', 'Gretel'];
const workers = [];
const output = new Map();

names.forEach((name) =>{
  workers.push(
    pool.exec({name: name}).then((result) =>{
      output.set(name, result);
    }).catch((reason)=>{
      console.log(`Worker failed: ${reason}`);
    })
  );
});

Promise.all(workers).then((values) => {

  console.log('Done');

  output.forEach((value, key, map) => {
    console.log(`${key}: ${value}`);
  })

  process.exit(0);

});
