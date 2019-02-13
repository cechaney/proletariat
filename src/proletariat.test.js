const fs = require('fs');
const proletariat = require('./proletariat');

test ('test constructor', () => {

  const script = fs.readFileSync(`src/examples/work.js`, 'utf8');

  const pool = new proletariat.WorkerPool(
    {maxWorkers: 10},
    script);

  /*
  Yes, we didn't actually create any workers with this test, but doing so makes Jest sad because it knows that 
  scripts have been started somewhere and doesn't know if they are done yet.

  Change the maxWorkers property to > 0 and receive the following message from Jest
  "Jest has detected the following 1 open handle potentially keeping Jest from exiting"
  
  Add to that the Jest process hangs and does not exit.
  */

  expect(pool).toBeDefined();

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

  const slowScript = fs.readFileSync(`src/examples/work.js`, 'utf8');

  const slowPool = new proletariat.WorkerPool(
    {maxWorkers: 0},
    slowScript);

  return slowPool.exec({name: 'Jill'}).then((result) => {
    //do nothing  
  }).catch((result) => {
    expect(result).toEqual(new Error('No workers available'));
  });

});