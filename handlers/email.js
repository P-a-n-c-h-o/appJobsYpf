const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');


let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:{
        user: process.env.USERG ,
        pass: process.env.PASSG 
    }
});

// Utilizar templates de Handlebars
transport.use('compile', hbs({
    viewEngine: {
    extName: '.handlebars',
    partialsDir: __dirname+'/../views/emails',
    layoutsDir: __dirname+'/../views/emails',
    defaultLayout: 'reset.handlebars',
   },
    viewPath : __dirname+'/../views/emails',
    extName : '.handlebars'
   }));


exports.enviar = async(opciones) => {
    const opcionesEmail = {
        from: '"appJobsYpf" <appjobsypf@gmail.com>',
        to: opciones.usuario.email,
        subject : opciones.subject, 
        template: opciones.archivo,
        context: {
            resetUrl : opciones.resetUrl
        },
    };
    const sendMail = util.promisify(transport.sendMail,transport);
    return sendMail.call(transport,opcionesEmail);
}