const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT = process.env.PORT || 5000;

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
        const submittedAssignments = client.db('coStudy').collection('submitted')

        // assignment releted api
        app.get('/assignments', async (req, res) => {
            const cursor = coStudyAssignments.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // query assignmet
        app.get('/api/v1/assignments/:label?', async (req, res) => {
            try {
                let label = req.params.label;
                // console.log(label)
                let filter = {};

                if (label) {
                    filter = { difficulty: label };
                }

                const data = coStudyAssignments.find(filter);
                const result = await data.toArray();
                res.send(result)
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ message: 'Error fetching data' });
            }
        })

        app.get('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coStudyAssignments.findOne(query);
            res.send(result);
        })

        app.post('/assignments', async (req, res) => {
            const newAssignments = req.body;
            const result = await coStudyAssignments.insertOne(newAssignments);
            res.send(result);
        })

        app.put('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            // const options = { upsert: true };
            const assignment = req.body;

            const updateAssignment = {
                $set: {
                    title: assignment.updatedTitle,
                    difficulty: assignment.updatedDifficulty,
                    date: assignment.updatedDate,
                    marks: assignment.updatedMarks,
                    thumbnail: assignment.updatedImage,
                    description: assignment.updatedDescription,
                }
            }
            // console.log(updateAssignment)
            const result = await coStudyAssignments.updateOne(query, updateAssignment)
            res.send(result);

        })

        app.delete('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coStudyAssignments.deleteOne(query);
            res.send(result);
        })


        // my assignment 

        app.get('/api/v1/my-assignment', async (req, res) => {

            const options = {
                projection: { _id: 1, user: 1, title: 1, givenMark: 1, examineerFeedback: 1, status: 1, marks: 1 }
            }
            const cursor = submittedAssignments.find({}, options)
            const result = await cursor.toArray();
            res.send(result);
        })



        // submitted assignment

        app.get('/api/v1/submitted-assignment', async (req, res) => {

            const cursor = submittedAssignments.find({ status: 'pending' });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/api/v1/submitted-assignment", async (req, res) => {
            const submitted = req.body;
            const result = await submittedAssignments.insertOne(submitted);
            res.send(result);
        })
        app.put('/api/v1/mark-assignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const assignment = req.body;
            const options = { upsert: true };

            const updateStatus = {
                $set: {
                    status: assignment.status,
                    givenMark: assignment.givenMark,
                    examineerFeedback: assignment.feedback,
                }
            }

            const result = await submittedAssignments.updateOne(query, updateStatus, options);
            res.send(result)
        })

        // total assignments 
        app.get('/api/v1/total-assignments', async (req, res) => {
            const count = await coStudyAssignments.estimatedDocumentCount();
            res.send({ count });
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

app.listen(PORT, () => {
    console.log(`CoStudy app listening on port ${PORT}`)
})