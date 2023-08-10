import mongoose from "mongoose";

//Signup Model
const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        verifytoken: {
            type: String,
        },
        urlList: [
            {
                shortId: {
                    type: String,
                    required: true,
                    unique: true,
                },
                redirectURL: {
                    type: String,
                    required: true,
                },
                creationDate: {
                    type: Date,
                    default: Date.now,
                },
                visitHistory: [
                    {
                        timestamp: { type: Number },

                    },
                ],
            },
        ],
    },
    {
        collection: "URL-shortner",
    }
)
export const User = new mongoose.model("UrlShortner", userSchema);