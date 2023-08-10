import express from 'express'
import { shortner, shorturl } from '../controllers/url.js';
import { getUser, verifyToken } from '../controllers/user.js';

const router = express.Router();
// url shortner Routes
router.post('/', verifyToken, getUser, shortner);
router.get('/:shortid', shorturl);


export default router