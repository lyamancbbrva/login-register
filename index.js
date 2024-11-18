const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

const SECRET_KEY = 'salamMenKeyem';

const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync('db.json', 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        return [];
    }
};

const writeUsersToFile = (users) => {
    fs.writeFileSync('db.json', JSON.stringify(users, null, 2));
};

const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
};

const authorize = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'sen yoxsan!' });
    }

    const token = authHeader.split(" ")[1]; 
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'tokenin sehvdi sey' });
    }
};

app.post('/createuser', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'sehv yazmisan' });
    }

    const users = readUsersFromFile();
    const existUser = users.find((item) => item.username === username);

    if (existUser) {
        return res.status(200).json({ message: 'onsuz varsanda deli' });
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
    };

    users.push(newUser);
    writeUsersToFile(users);

    const token = generateToken(newUser);
    res.status(201).json({ message: 'Yarandin get', token });
});


app.post('/login', (req, res) => {

    const { username, password } = req.body;
    const users = readUsersFromFile();
    const user = users.find((item) => item.username === username && item.password === password);

    if (!user) {
        return res.status(401).json({ message: 'yoxsan' });
    }

    const token = generateToken(user);
    res.json({ token });
});

app.get('/profile', authorize, (req, res) => {
    res.json({ message: `Salam e ${req.user.username}` });
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
