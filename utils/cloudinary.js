const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLAUDINARY_USER,
    api_key: process.env.CLAUDINARY_API_KEY,
    api_secret:process.env.CLAUDINARY_API_SECRET,
    api_url:process.env.CLOUDINARY_URL,   
    api_preset:UPLOAD_PRESET
});

module.exports= cloudinary;