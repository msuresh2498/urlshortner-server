import express from 'express';
import database from '../urlshortner-server/db/connect.js'
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import userRoutes from '../urlshortner-server/Routes/user.js';
import urlRoutes from '../urlshortner-server/Routes/url.js';
import { User } from './models/usermodule.js';

dotenv.config()
const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();

app.use(express());
app.use(express.json());
app.use(cors());
database();

app.use('/user', userRoutes);
app.use('/url', urlRoutes);
app.get('/', function (req, res) {
    res.send('Welcome to URL shortner APP')
})


app.get('/', cors(), (req, res) => {

})

app.get('/urlList', async (req, res) => {
    try {
        const userList = await User.find().select('urlList');
        if (userList) {
            return res.status(200).json({ urlList: userList });
        } else {
            return res.status(404).json({ message: 'No urlList found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving urlList', error: error.message });
    }
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));