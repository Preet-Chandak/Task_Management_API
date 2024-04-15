const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = 'mongodb+srv://preetchandak5:ge7etskOifY1yVED@cluster0.g7mdegy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'nxg_task';
const COLLECTION_NAME = 'preet';

app.use(bodyParser.json());

let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db(DB_NAME);
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, status, dueDate } = req.body;
    if (!title || !dueDate) {
        return res.status(400).json({ error: 'Title and due date are required' });
    }

    const currentDate = new Date();
    const taskDueDate = new Date(dueDate);
    if (taskDueDate <= currentDate) {
        return res.status(400).json({ error: 'Due date should be in the future' });
    }

    if (status !== "completed" && status !== "pending" && status !== "active") {
        return res.status(400).json({ error: 'Status should be "completed", "pending", or "active"' });
    }

    const task = { title, description, status, dueDate };
    db.collection(COLLECTION_NAME).insertOne(task)
        .then(result => {
            res.status(201).json(result);
        })
        .catch(error => {
            console.error('Error creating task:', error);
            res.status(500).json({ error: 'Error creating task' });
        });
});

// Get all tasks
app.get('/tasks', (req, res) => {
    db.collection(COLLECTION_NAME).find().toArray()
        .then(tasks => {
            res.json(tasks);
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ error: 'Error fetching tasks' });
        });
});

// Get a specific task
app.get('/tasks/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    
    db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(taskId) })
        .then(task => {
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json(task);
        })
        .catch(error => {
            console.error('Error fetching task:', error);
            res.status(500).json({ error: 'Error fetching task' });
        });
});

// Update a task
app.put('/tasks/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const { title, description, status, dueDate } = req.body;
    if (!title || !dueDate) {
        return res.status(400).json({ error: 'Title and due date are required' });
    }
    // Check if due date is in the future
    const currentDate = new Date();
    const taskDueDate = new Date(dueDate);
    if (taskDueDate <= currentDate) {
        return res.status(400).json({ error: 'Due date should be in the future' });
    }

    if (status !== "completed" && status !== "pending" && status !== "active") {
        return res.status(400).json({ error: 'Status should be "completed", "pending", or "active"' });
    }

    db.collection(COLLECTION_NAME).updateOne({ _id: new ObjectId(taskId) }, { $set: { title, description, status, dueDate } })
        .then(() => {
            res.json({ _id: taskId, title, description, status, dueDate });
        })
        .catch(error => {
            console.error('Error updating task:', error);
            res.status(500).json({ error: 'Error updating task' });
        });
});

// Delete a task
app.delete('/tasks/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(taskId) })
        .then(() => {
            res.status(204).json({'The task has been succesfully deleted :':taskId});
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            res.status(500).json({ error: 'Error deleting task' });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
