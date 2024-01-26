const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = 5000;

// middleware
app.use(cors())
app.use(express.json())

// console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vcouptk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        client.connect();

        const coStudyAssignments = client.db('coStudy').collection('assignments');

        app.get('/assignments', async (req, res) => {
            const result = await coStudyAssignments.find().toArray();
            res.send(result);
        })

        app.post('/assignments', async (req, res) => {
            const newAssignments = req.body;
            const result = await coStudyAssignments.insertOne(newAssignments);
            res.send(result);
        })
        



        // Send a ping to confirm a successful connection
        client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('CoStudy Server running .................')
})

app.listen(port, () => {
    console.log(`CoStudy app listening on port ${port}`)
})