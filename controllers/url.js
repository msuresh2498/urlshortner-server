import { Url } from "../models/urlmodule.js";
import shortid from 'shortid'
import { User } from "../models/usermodule.js";

export const shortner = async (req, res) => {
    const userid = req.user.id;
    console.log(userid);

    const url = req.body.url;
    if (!url) {
        return res.status(400).json({ message: "URL required " })
    }

    const shortID = shortid.generate()
    const newURL = await Url.create({
        shortId: shortID,
        redirectURL: url,
        visitHistory: [],
    })

    await User.findOneAndUpdate(
        { _id: userid }, // Assuming you're using _id field for the user's id
        { $push: { urlList: newURL } }
    );

    return res.json({ id: shortID, url: newURL.redirectURL });
}

export const shorturl = async (req, res) => {

    const shortUrl = req.params.shortid;

    const user = await User.findOne({ 'urlList.shortId': shortUrl });
    console.log(user);

    const userid = user.id;

    try {
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const urlList = user.urlList;
        const entry = urlList.find(url => url.shortId === shortUrl);

        if (!entry) {
            return res.status(404).json({ message: 'Short URL not found for this user' });
        }

        entry.visitHistory.push({ timestamp: Date.now() });

        await user.save();

        return res.redirect(entry.redirectURL);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred' });
    }
};



