const fs = require('fs');
const proletariat = require('./proletariat');

test ('test constructor', () => {

  const script = fs.readFileSync(`src/examples/work.js`, 'utf8');

  const pool = new proletariat.WorkerPool(
    {maxWorkers: 1},
    script);

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