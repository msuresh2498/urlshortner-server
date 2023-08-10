import express  from "express";
import { changePassword, login, passwordReset, sendpasswordlink, signup, userData } from "../controllers/user.js";

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);
router.post('/sendpasswordlink', sendpasswordlink);
router.post('/forgotpassword/:id/:token', passwordReset);
router.post('/:id/:token', changePassword);
router.get('/userdata/:id', userData);

export default router;