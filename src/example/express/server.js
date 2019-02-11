const fs = require('fs');
const express = require('express');
const proletariat = require('../../proletariat');

const app = express();
const port = 3000;

const script = fs.readFileSync(`../work.js`, 'utf8');

const pool = new proletariat.WorkerPool(
  {maxWorkers: 100},
  script);

app.get('/', (req, res) => {

  const name = req.query.name;

  pool.exec({name: name}).then((result) =>{
    res.send(result);
  }).catch((reason)=>{
    res.statusCode = 500;
  });

});

app.listen(port, () => console.log(`Pooled execution app listening on port ${port}!`))
