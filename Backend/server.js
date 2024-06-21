const express = require('express');
const { spawn } = require('child_process');

const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const chatHistories = Object.create(null);

app.post('/llm', (req, res) => {
    try {
        const { question, sessionId } = req.body;

        if (!chatHistories[sessionId]) {
            chatHistories[sessionId] = [];
        }

        const sessionHistory = chatHistories[sessionId];
        const relevantHistory = sessionHistory.slice(-1);
        const chatHistoryJson = JSON.stringify(relevantHistory);

        console.log("Running Python script with question:", question);

        const pythonProcess = spawn('python', ['./LLM.py', question, chatHistoryJson]);

        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                return res.status(500).json({ error: 'Internal server error' });
            }

            console.log("Python script output:", output.trim());

            const answer = output.trim();
            chatHistories[sessionId].push({ answer });
            res.json({ response: answer });
        });

    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/ipl', (req, res) => {
    try {
        const { year } = req.body;
        console.log(year);
        console.log("Python script running!");

        const pythonProcess = spawn('python', ['./IPLPointsTable.py', year]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', () => {
            console.log(output.trim());
            res.json({ response: output.trim() });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});

app.post('/t20', (req, res) => {
    try {
        const { year } = req.body;
        console.log(year);

        const pythonProcess = spawn('python', ['./T20WCStandings.py', year]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', () => {
            console.log(output.trim());
            res.json({ response: output.trim() });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});

app.post('/profiles', (req, res) => {
    try {
        const { name } = req.body;
        console.log(name);

        const pythonProcess = spawn('python', ['./profiles.py', name]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', () => {
            // console.log(output.trim());
            try {
                const parsedOutput = JSON.parse(output.trim());
                res.json(parsedOutput);
            } catch (error) {
                res.status(500).json({ error: 'Player not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});

app.get('/news', (req, res) => {
    try {
        const pythonProcess = spawn('python', ['./News.py']);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', () => {
            // console.log(output.trim());
            try {
                const parsedOutput = JSON.parse(output.trim());
                res.json(parsedOutput);
            } catch (error) {
                res.status(500).json({ error: 'News could not be retrieved' });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'News could not be retrieved' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`App is listening at port ${PORT}`);
});  