const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database Simulation for Node.js
let songs = [];
let users = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

app.get('/api/songs', (req, res) => res.json({ success: true, songs }));

app.post('/api/songs/upload', upload.fields([{ name: 'audio' }, { name: 'thumb' }]), (req, res) => {
    const { title, artist, genre, desc, uploader } = req.body;
    const audioUrl = req.files['audio'] ? `/uploads/${req.files['audio'][0].filename}` : '';
    const thumbUrl = req.files['thumb'] ? `/uploads/${req.files['thumb'][0].filename}` : 'https://placehold.co/300x300';
    
    const newSong = { id: `song-${Date.now()}`, title, artist, genre, desc, uploader, audioUrl, thumb: thumbUrl, plays: 0 };
    songs.unshift(newSong);
    res.json({ success: true, song: newSong });
});

app.post('/api/auth/login', (req, res) => {
    const { username, email } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) {
        user = { username, email, isBanned: false };
        users.push(user);
    }
    if (user.isBanned) return res.status(403).json({ error: 'Banned' });
    res.json({ success: true, user, token: 'jwt-mock-token' });
});

app.listen(PORT, () => console.log(`stream.cloud server running on port ${PORT}`));
