import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import { User } from "../models/usermodule.js";


export const signup = async (request, response) => {

    const { firstname, lastname, email, password } = request.body;

    console.log(request.body);
    try {
        const emailexist = await User.findOne({ email: email })
        console.log(emailexist);
        if (emailexist) {
            return response.status(400).json("Email alredy Exist")
        } else {
            const hash = await bcrypt.hash(password, 10)

            const user = new User({
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                email: request.body.email,
                password: hash
            });

            const data = await user.save();
            response.json(data);
        }

    } catch (err) {
        response.status(400).json(err)
    }
};


export const login = async (request, response) => {

    try {
        const userData = await User.findOne({ email: request.body.email })
        if (!userData) {
            return response.status(400).json("email not Exist");
        }

        const validpwd = await bcrypt.compare(request.body.password, userData.password);

        if (!validpwd) {
            return response.status(400).json("Invalid credentials");
        }
        const userId = userData._id
        const token = jwt.sign({ id: userData.id }, process.env.SECRECT_KEY);

        return response.status(200).json({ message: "login successfully", user: userData, token, userId })
    } catch (err) {
        response.status(400).json(err)
    }
};

export const sendpasswordlink = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        res.status(401).json({ status: 401, message: "Enter Your Email" })
    }

    try {
        const userfind = await User.findOne({ email: email });
        console.log(userfind);

        //token generate for reset password
        const token = jwt.sign({ _id: userfind._id }, process.env.SECRECT_KEY, {
            expiresIn: "1h"
        })
        console.log(token);

        const setusertoken = await User.findByIdAndUpdate({ _id: userfind._id }, { verifytoken: token }, { new: true });
        console.log(setusertoken);


        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        if (setusertoken) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Sending Email For password Reset",
                text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${token}`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error", error);
                    res.status(401).json({ status: 401, message: "email not send" })
                } else {
                    console.log("Email sent", info.response);
                    res.status(201).json({ status: 201, message: "Email sent Succsfully" })
                }
            })

        }

    } catch (error) {
        res.status(401).json({ status: 401, message: "invalid user", error })
    }
}

export const passwordReset = async (req, res) => {
    const { id, token } = req.params;

    try {
        const validuser = await User.find({ _id: id, verifytoken: token });

        const verifyToken = jwt.verify(token, process.env.SECRECT_KEY);

        if (validuser && verifyToken._id) {
            res.status(201).json({ status: 201, validuser })
        } else {
            res.status(401).json({ status: 401, message: "user not found" })
        }

    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
}

export const changePassword = async (req, res) => {
    const { id, token } = req.params;

    const { password } = req.body;

    try {
        const validuser = await User.find({ _id: id, verifytoken: token });

        const verifyToken = jwt.verify(token, process.env.SECRECT_KEY);

        if (validuser && verifyToken._id) {
            const newpassword = await bcrypt.hash(password, 12);

            const setnewuserpass = await User.findByIdAndUpdate({ _id: id }, { password: newpassword });

            setnewuserpass.save();
            res.status(201).json({ status: 201, message: "Password changed", setnewuserpass })
            console.log(newpassword);

        } else {
            res.status(401).json({ status: 401, message: "user not exist" })
        }
    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
}

export const userData = async (req, res) => {
    const userId = req.params.id
    console.log(userId);
    let user;
    try {
        user = await User.findById(userId)

    } catch (error) {
        return new Error(error)
    }
    if (!user) {
        return res.status(404).json({ message: " User not found" })
    }
    return res.status(200).json({ user })

}

export const verifyToken = async (request, response, next) => {

    const token = request.header('x-auth-token');
    console.log("token", token);

    if (!token) {
        return response.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.SECRECT_KEY, (error, user) => {
        if (error) {
            return response.status(403).json({ message: 'Invalid token', error });
        }

        request.user = user;
        console.log(user);
        next();
    });
}

export const getUser = async (req, res, next) => {
    const userId = req.user.id
    console.log(userId);
    let user;
    try {
        user = await User.findById(userId)

    } catch (error) {
        return new Error(error)
    }
    if (!user) {
        return res.status(404).json({ message: " User not found" })
    }
    console.log(user);
    next()

}