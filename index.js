const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = 5000;

// middleware
app.use(cors())
app.use(express.json())




app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })