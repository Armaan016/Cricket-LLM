const express = require('express');
const { spawn } = require('child_process');

const app = express();
const cors = require('cors');

// const mongoose = require('mongoose');
const connectDB = require('./mongo');
const Chat = require('./Schemas');
const User = require('./User')
connectDB();

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = new User({ username, email, password });
        await user.save();

        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(user.username, "logged in");
        res.status(200).json({ userId: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/llm', async (req, res) => {
    try {
        const { question, userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let chat = await Chat.findOne({ user: userId });
        if (!chat) {
            chat = new Chat({ user: userId, conversations: [] });
        }

        const conversation = { question };

        const pythonProcess = spawn('python', ['./LLM.py', question, JSON.stringify(chat.conversations)]);
        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            const answer = output.trim() || "Sorry, I cannot answer this question.";
            conversation.answer = answer;

            chat.conversations.push(conversation);
            await chat.save();

            user.chats.push(chat._id);
            await user.save();

            res.json({ response: answer });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/chats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('chats');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.chats);
    } catch (error) {
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