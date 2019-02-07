const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

const proletariat = require(__dirname + '/src/proletariat');

const script = fs.readFileSync(`${__dirname}/src/work.js`, 'utf8');

const pool = new proletariat.WorkerPool(
  {maxWorkers: 5},
  script);

app.get('/', (req, res) => {

  const name = req.query.name;

  id = pool.exec({name: name});

  result = pool.getResult(id);

  res.send(result);

});

app.listen(port, () => console.log(`Pooled execution app listening on port ${port}!`))
