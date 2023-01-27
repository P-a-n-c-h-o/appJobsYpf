const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLAUDINARY_USER_NAME,
    api_key: process.env.CLAUDINARY_API_KEY,
    api_secret:process.env.CLAUDINARY_API_SECRET
});

module.exports= cloudinary;