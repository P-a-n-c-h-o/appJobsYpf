const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_USER,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    api_url: process.env.CLOUDINARY_URL,   
    api_preset: process.env.UPLOAD_PRESET,
    secure: true
});

module.exports= cloudinary;