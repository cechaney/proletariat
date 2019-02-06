const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

const proletariat = require(__dirname + '/src/proletariat');

const script = fs.readFileSync(`${__dirname}/src/work.js`, 'utf8');

const pool = new proletariat.WorkerPool(
  {maxWorkers: 3},
  script);

app.get('/', (req, res) => {

  const name = req.query.name;

  pool.exec({name: name})
  .then((result) => {
    res.send(result);
  }).catch((error) => {
    res.status(500);
  });

});

app.listen(port, () => console.log(`Pooled execution app listening on port ${port}!`))
