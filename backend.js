const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const WebSocket = require('ws');
const { exec } = require('child_process'); // Ensure you're importing exec


const app = express();
const port = 3000;
const wsPort = 8080; // WebSocket server port, can be the same as HTTP port if you configure it correctly
app.use(express.json());


app.use(cors());

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/Users/jason_sutanto/lab6_part2/data'); // Make sure this path exists or can be written to by your Node.js process.
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res, next) => {

    res.send("Uploaded successfully");
});

app.post('/get', (req, res) => {
    let userInput = req.body.msg; 
    console.log(`User Input: ${userInput}`);

    exec(`python Q_A_with_documents.py "${userInput}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).send('Error executing Python script.');
        }

        try {
            const result = JSON.parse(stdout); // Parses the stdout as JSON
            console.log("Python script output:", result);
            res.send(result); // Send the parsed JSON as a response
        } catch (parseError) {
            console.error(`Error parsing Python script output: ${parseError}`);
            res.status(500).send('Error processing response from Python script.');
        }
    });
});



app.listen(port, () => console.log(`Server running on port ${port}`));

const wss = new WebSocket.Server({ port: wsPort });

wss.on('connection', function connection(ws) {
  console.log('A new client connected');
  ws.send('Welcome New Client!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // You can also broadcast to all clients, respond to the message, etc.
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
