const fs = require('fs');
const proletariat = require('./proletariat');

test ('test constructor', () => {

  const script = fs.readFileSync(`src/examples/work.js`, 'utf8');

  const pool = new proletariat.WorkerPool(
    {maxWorkers: 1},
    script);

  pool.shutdown();

  expect(pool).toBeDefined;
 

});

test ('test bad construction with no script', () => {

  function makePool(){
    const pool = new proletariat.WorkerPool(
      {maxWorkers: 1},
      null)
  }

  expect(makePool).toThrowError('No script defined');

});

test ('test not enough workers', () => {

  const script = fs.readFileSync(`src/examples/slow.js`, 'utf8');

  const pool = new proletariat.WorkerPool(
    {maxWorkers: 1},
    script);

  pool.exec({name: 'Jack'}).then((result) => {

    expect(result).toBe('Hello, Jack!');

    pool.shutdown();

  }).catch((reason) => {

    console.log(`FAILED: ${reason}`);

    pool.shutdown();

  });

  // pool.exec({name: 'Jill'}).then((result) => {
  //   console.log('Jill succeded');
  // }).catch((reason) => {
  //   console.log('Jill failed');
  //   expect(reston).toBe('No workers available');
  // });



});