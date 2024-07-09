const express = require('express');
const { spawn } = require('child_process');

const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/chatbot');
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};
connectDB();

const conversationSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
}, { timestamps: true });

const chatSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversations: [conversationSchema]
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema)

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }]
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const user = new User({ username, email, password });
        await user.save();

        console.log(process.env.JWT_SECRET);
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/llm', async (req, res) => {
    try {
        const { question, userId, chatId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let chat;
        if (chatId) {
            chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
        } else {
            chat = new Chat({ user: userId, conversations: [] });
        }

        const conversation = { question };

        const pythonProcess = spawn('python', ['./LLM.py', question]);
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

            if (!chatId) {
                user.chats.push(chat._id);
                await user.save();
            }

            res.json({ response: answer, chatId: chat._id });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/chats', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const chat = new Chat({ user: userId, conversations: [] });
        await chat.save();

        user.chats.push(chat._id);
        await user.save();

        res.json(chat);
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

app.delete('/chats/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const user = await User.findById(chat.user);
        if (user) {
            user.chats = user.chats.filter(c => c.toString() !== chatId);
            await user.save();
        }

        await chat.remove();
        res.status(200).json({ message: 'Chat deleted successfully' });
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