const mongoose = require ('mongoose');
const Usuarios = mongoose.model('Usuarios');
const {body,validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const cloudinary = require("../utils/cloudinary");
const path = require('path');
const fs = require('fs-extra');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb ');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;
        } else {
            return next();
        }
    });
}
// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 6000000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, path.join( __dirname+'../../public/uploads/perfiles'));
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');


exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en appJobsYpf',
        tagline: 'Comienza a publicar tus tareas, solo debes crear una cuenta'
    })
}



exports.validarRegistro = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('El password es obligatorio').escape(),
        body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio').escape(),
        body('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales')
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);

    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea una cuenta en appjobsYpf',
            tagline: 'Comienza a publicar tus tareas, solo debes crear una cuenta',
            mensajes: req.flash(),
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}

exports.crearUsuario = async (req, res, next) => {
    //crear el usuario
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');

    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

// formulario para iniciar sesion
exports.formIniciarSesion =(req, res) =>{
    res.render('iniciar-sesion', {
        nombrePagina: 'Iinicair Sesión en appJobsYpf'
    })
}

//form editar  el perfil
exports.formEditarPerfil = async (req, res) => {
    //const imagen = await Usuarios.find();
    res.render('editar-perfil', {
        nombrePagina : 'Editar tu perfil en appJobsYpf',
        usuario: req.user.toObject(),
        novedad:true,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        //imagen: {imagen},
    })
}

//guardar vambios al editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `${usuario._id}_profile`,
        width:500,
        height:500,
        crop:`fill`,
        folder:"perfil"
    });
    
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    

    if(req.body.password) {
        usuario.password = req.body.password
    }

   if(req.file) {
        usuario.imagen = result.secure_url;
        usuario.public_id = result.public_id;
        usuario.path =result.path; 
   }

    await Usuarios.findByIdAndUpdate(usuario._id, {imagen:result.url});
    await fs.unlink(req.file.path);
    req.flash('correcto', 'Cambios Guardados Correctamente');

    //redirect
    res.redirect('/administracion');
}

exports.validarPerfil= async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('El password es obligatorio').escape(),
        //body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio').escape(),
        //body('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales')
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);

    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Editar tu perfil en appJobsYpf',
            usuario: req.user.toObject(),
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}
