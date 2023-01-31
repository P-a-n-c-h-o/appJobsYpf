const mongoose = require('mongoose');
const Tarea = mongoose.model('Tarea');
const cloudinary = require("../utils/cloudinary");
const { body, validationResult } = require("express-validator");
//const Tarea =('../models/Tareas.js')
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs-extra');
//subir imagen en tares

exports.subirImagen1 = async (req, res, next) => {
    upload1(req, res, function(error) {
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
const configuracionMulter1 = {
    limits : { fileSize : 600000000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/info');
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg','application/pdf' || file.mimetype === 'image/jpeg','application/pdf' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload1 = multer(configuracionMulter1).single('imagen1');

exports.formularioNuevaTarea = async (req, res) => {
    const imagen1 = await Tarea.find();
    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean();
    const novedades = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    res.render('nueva-tarea', {
        nombrePagina: 'Nueva Tarea',
        tagline: 'Llena el formulario para publicar una nueva tarea',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        imagen1: {imagen1},
        informes,
        novedades
    })
    
}

// agregar vacanates a a base de datos
exports.agregarTarea = async (req, res) => {
   const tarea = new Tarea(req.body);

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder:"Tareas"
    });
   
    //usuario autor de la tarea 
   tarea.autor = req.user._id;

    //crear arreglo de habilidades (skills)
    tarea.skills= req.body.skills.split(',');

    if(req.body.password) {
    usuario.password = req.body.password
    }

    if(req.file) {

        tarea.imagen1 = result.secure_url;
        tarea.public_id = result.public_id;
        tarea.path = result.path
    }
    // almacenar en la base de datos
   const nuevaTarea = await tarea.save();
   await fs.unlink(req.file.path);
    //redireccionar
   res.redirect(`/tareas/${nuevaTarea.url}`);
}



// mustra una tarea
exports.mostrarTarea = async (req, res, next) => {
    const tarea = await Tarea.findOne({url: req.params.url}).populate('autor').lean();
    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    //si no hay resuktados
    if(!tarea) return next();
    


    res.render('tarea', {
       
        nombrePagina:  tarea.planta,
        tarea,
        cerrarSesion: true,
        imagen: req.user.imagen,
        novedad: tarea.novedad,
        informes
       // nombre: req.user.nombre,
       // imagen: req.user.imagen,
    })
}

exports.formEditarTarea = async (req, res, next) => {
    const tarea = await Tarea.findOne({url: req.params.url}).lean();
    const imagen1 = await Tarea.find();
    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    const novedades = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    if(!tarea) return next();

    res.render('editar-tarea',{
        tarea,
        nombrePagina: `Editar - ${tarea.planta}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        imagen1: {imagen1},
        informes,
        novedades
         
    })
}

exports.editarTarea = async (req, res) => {
    const tareaActualizada = req.body;

    const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `${usuario._id}_profile`,
        crop:`fill`,
        folder:"Tareas"
    });
    
    tareaActualizada.skills = req.body.skills.split(',');
   
    if(req.body.password) {
        usuario.password = req.body.password
    }
    
    if(req.file) {
        tareaActualizada.imagen1 = result.secure_url;
    }


    const tarea = await Tarea.findOneAndUpdate({url: req.params.url}, tareaActualizada, {
        new:true,
        runValidators: true,
        imagen1: result.secure_url
    }) ;

    //const tarea = await tarea.save();
    await fs.unlink(req.file.path);
    res.redirect(`/tareas/${tarea.url}`);

 

}


//validar y sanitizar los campos de las nuevas tareas
exports.validarTarea = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('planta').not().isEmpty().withMessage('Agrega una Palnata a la Tarea').escape(),
        body('empresa').not().isEmpty().withMessage('Agrega una empresa').escape(),
        body('prioridad').not().isEmpty().withMessage('Selecciona una Prioridad').escape(),
        body('inicio').not().isEmpty().withMessage('Agregar la fecha de Inicio').escape(),
        body('fin').not().isEmpty().withMessage('Agregar la fecha de Finalizacion').escape(),
        body('skills').not().isEmpty().withMessage('Agrega al menos una Habilidad').escape(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);

    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('nueva-tarea', {
            nombrePagina: 'Nueva Tarea',
            tagline: 'Llena el formulario para publicar una nueva tarea',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        })
       // return;
    }
 
    //si toda la validacion es correcta
    next();
}


exports.eliminarTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id);

    if(verificarAutor(tarea, req.user)){
        //Todo bien si es el usario, eliminar
        tarea.remove();
        res.status(200).send('Tarea Eliminada Correctamente');
    } else{
        // No eliminar 
        res.status(403).send('Error')
    }


    
}

const verificarAutor = (tarea = {}, usuario = {}) => {
    if(!tarea.autor.equals(usuario._id)){
        return false
    }
    return true;
}

//subir archivos en contactar inspectar

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error) {
        if(error){
            
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Máximo 300kb');
                }else{
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;       
        }else {
            return next();
        }
    });
}

// Opciones de Multer
const configuracionMulter = {
    limits : {fileSize: 2000000000},
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename: (req, file,cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null,`${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg','application/pdf' || file.mimetype === 'image/jpeg','application/pdf' ) {
            //el callback se ejecuta como ture o false: true cuando la imagen se acepta
            cb(null, true);
        } else{
            cb(new Error('Formato No Valido'), false);
        }
    },
    
}

const upload = multer(configuracionMulter).single('cv');

//subir archivos en contactar inspectar

exports.subirNov = (req, res, next) => {
    upload2(req, res, function(error) {
        if(error){
            
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Máximo 300kb');
                }else{
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;       
        }else {
            return next();
        }
    });
}

// Opciones de Multer
const configuracionMulter2 = {
    limits : {fileSize: 2000000000},
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/nov')
        },
        filename: (req, file,cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null,`${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg','application/pdf' || file.mimetype === 'image/jpeg','application/pdf' ) {
            //el callback se ejecuta como ture o false: true cuando la imagen se acepta
            cb(null, true);
        } else{
            cb(new Error('Formato No Valido'), false);
        }
    },
    
}

const upload2 = multer(configuracionMulter2).single('nove');

//almacenar informes 

exports.contactarInfo = async (req, res, next) => {
    

    const tarea = await Tarea.findOne({url: req.params.url});

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder:"informes"
    })

    //sino existe la vacante 
    if(!tarea) return next();

    //todo bien, construir el nuevo objeto
    const nuevoInforme = {
        
        nombre: req.body.nombre,
        email: req.body.email,
        cv: result.secure_url,
    }
    
    //almacenar la vacante
    tarea.informes.push(nuevoInforme);
    await tarea.save();
    await fs.unlink(req.file.path);

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Informe Correctamente');
    res.redirect(`/tareas/${tarea.url}`)
    
    
}

//almacenar novedades

exports.contactarNov = async (req, res, next) => {
   // let totalNovedades = 0

    const tarea = await Tarea.findOne({url: req.params.url});

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder:"Novedades"
    })


    //sino existe la vacante 
    if(!tarea) return next();

    //todo bien, construir el nuevo objeto
    const nuevaNovedad = {
        nombre: req.body.nombre,
        email: req.body.email,
        descripNov: req.body.descripNov,
        nove: result.secure_url 
    }

 
    //almacenar la vacante
    tarea.novedad.push(nuevaNovedad);
    await tarea.save();
    await fs.unlink(req.file.path);

    
    //mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Novedad Correctamente');
    res.redirect(`/tareas/${tarea.url}`)

}
/*
exports.mostrarPanelNovedades = async (req, res) => {

    //consultar el usaurio atenticado
    const tareas = await Tarea.find({autor: req.user._id}).lean();


    res.render('novedades', {
        nombrePagina: 'Panel de Novedades',
        tagline: 'Controla las novedades, tienes algo pendiente para hoy??',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        tareas
    })

}
*/
exports.mostrarPanelNovedades = async (req, res) => {

    //consultar el usaurio atenticado
    const tareas = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 

    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 

        return res.render('novedades', {
            nombrePagina: 'Panel de Novedades',
            tagline: 'Controla las novedades, tienes algo pendiente para hoy??',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            tareas,
            informes
        })

}

exports.mostrarPanelInformes = async (req, res) => {

    //consultar el usaurio atenticado
    const tareas = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 

    const novedades = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 

        return res.render('informes', {
            nombrePagina: 'Panel de Informes',
            tagline: 'Controla los informes, tienes algo pendiente para hoy??',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            tareas,
            novedades
        })

}



exports.mostrarInformes = async (req, res, next) => {
    const tarea = await Tarea.findById(req.params.id).lean();
    const novedades = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    //validacion de autor
    if(tarea.autor != req.user._id.toString()){
        return next();
    } 

    
    if(!tarea) return next();
    res.render('informes', {
        nombrePagina: `Informes Tarea - ${tarea.planta}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        informes: tarea.informes,
        novedades
    })
}

exports.mostrarNovedad = async (req, res, next) => {
    const tarea = await Tarea.findById(req.params.id).lean();
    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    //validacion de autor
    if(tarea.autor != req.user._id.toString()){
        return next();
    } 

    if(!tarea) return next();

    res.render('novedad-tarea', {
        nombrePagina: `Novedades Tarea - ${tarea.planta}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        novedad: tarea.novedad,
        informes
    })
}


// Buscador de Vacantes
exports.buscarTareas = async (req,res) =>{
    const tareas = await Tarea.find(({
        
        empresa: new RegExp(req.body.q, 'i'),

        //planta:new RegExp(req.body.q, 'i'),
    
    })).lean();

    
   // modstrar las vacantes
   res.render('home', {
    nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
    barra:true,
    novedad:true,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    tareas,
   })
}

