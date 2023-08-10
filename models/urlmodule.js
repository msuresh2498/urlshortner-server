import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            require: true,
            unique: true,
        },
        redirectURL: {
            type: String,
            require: true
        },
        creationDate: {
            timestamp: { type: Number }
        },
        visitHistory: [{
            timestamp: { type: Number }
        }]
    },
    { timestamps: true },
    {
        collection: 'URL-shortner-list'
    });

export const Url = mongoose.model('Url', urlSchema);