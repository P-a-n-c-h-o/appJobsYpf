const mongoose = require('mongoose');
require('./config/db');
const express = require('express');
const exphbs = require('express-handlebars');
const router = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
//const expressValidator = require ('express-validator');
const flash = require ('connect-flash');
const createError = require('http-errors')
const passport = require('./config/passport');
mongoose.set('strictQuery', false);

//require('dotenv').config({ path : 'variablesypf.env'});
require('dotenv').config({ path : 'variablesAppYpf.env'});

const app = express();

//habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//validacion de campos
//app.use(expressValidator());


// app.use('/', router());

//Habilitar handlebars como view
app.engine('handlebars', 
    exphbs.engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, '/public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection : mongoose.connection })
    
}));

//Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Alerats y flash messages
app.use(flash());

//Crear nustro  middleware // este va a guardar los mensajes y que usuario está autenticado 
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});



app.use('/', router());

//404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado'));
})

//Administracion de los errores
app.use((error, req, res,next) =>{
    res.locals.mensaje = error.message;
    const status = error.status || 4000;
    res.locals.status = status;
    res.status(status);
    res.render('error');
})

//dejar que heroku asigne el puerto 
const host= '0.0.0.0';
const port = process.env.PORT || 4000;

/*app.use('/public/uploads/info', upload.array('image'), async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path,'Images')

    if (req.method === 'POST')
    {
        const urls = []

        const files = req.files

        for(const file of files){
            const {path} = file

            const newPath = await uploader(path)

            urls.push(newPath)

            fs.unlinkSync(path)
        }

        res.status(200).json({
            message:'Imagen Guardada con Exito',
            data: urls
        })

    }else{
        res.status(405).json({
            err:"la imagen no se cargo cortrectamente "
        })
        
    }
})*/

app.use(express.json());
app.use(fileupload({
    useTempFiles : true,
}))




app.post("/", async (req,res)=> {
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
        folder: "images"
    })

    res.json(result.info.secure.url);

})

    

app.listen(port, host, ()=>{
    console.log('El servidor esta funcionando');
});