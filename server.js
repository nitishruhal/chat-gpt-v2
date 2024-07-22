const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
require('dotenv').config();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const PORT = 5000;
const ANTHROPIC_API_KEY = `${process.env.ANTHROPIC_API_KEY}`;
const SECRET = `${process.env.SECRET}`;

// MongoDB configuration
const dbUri = 'mongodb+srv://nitish:nitishruhal1@cluster0.iwldmvb.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'signup';

let db;

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403); 
    req.user = user;
    console.log(token)
    next();
  });
};

// Function to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(user, SECRET, { expiresIn: '5min' });
};

// Connect to MongoDB
MongoClient.connect(dbUri)
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API endpoint for Claude completions
app.post('/completions', authenticateToken, async (req, res) => {
  console.log('Received request:', req.body);

  const options = {
    method: 'POST',
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    data: {
      model: 'claude-3-sonnet-20240229',
      messages: [{ role: 'user', content: req.body.message }],
      max_tokens: 100
    }
  };

  try {
    console.log('Sending request to Anthropic API:', JSON.stringify(options, null, 2));
    const response = await axios(options);
    console.log('Received response from Anthropic API:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Anthropic API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

// API endpoint for user signup
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, email, password: hashedPassword };

    const result = await db.collection('users').insertOne(user);
    return res.status(201).json({ message: 'Signup successful', result });
  } catch (err) {
    console.error('Error inserting user:', err);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

// API endpoint for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      console.log("Invalid credentials");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("Invalid credentials");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const access_token = generateAccessToken(user);
    return res.status(200).json({ result: user, message: 'Login successful', token: access_token });
  } catch (err) {
    console.error('Error querying user:', err);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log("Your Server is running on PORT: " + PORT);
});
