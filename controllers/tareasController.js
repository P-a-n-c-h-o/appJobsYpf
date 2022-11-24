const mongoose = require('mongoose');
const Tarea = mongoose.model('Tarea');
const { body, validationResult } = require("express-validator");
//const Tarea =('../models/Tareas.js')
const multer = require('multer');
const shortid = require('shortid');


exports.formularioNuevaTarea = (req, res) => {
    res.render('nueva-tarea', {
        nombrePagina: 'Nueva Tarea',
        tagline: 'Llena el formulario para publicar una nueva tarea',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
    
}

// agregar vacanates a a base de datos
exports.agregarTarea = async (req, res) => {
   const tarea = new Tarea(req.body);

   //usuario autor de la tarea
   tarea.autor = req.user._id;

    //crear arreglo de habilidades (skills)
    tarea.skills= req.body.skills.split(',');

   //console.log(tarea)

    // almacenar en la base de datos
   const nuevaTarea = await tarea.save();

    //redireccionar
   res.redirect(`/tareas/${nuevaTarea.url}`);
}

// mustra una tarea
exports.mostrarTarea = async (req, res, next) => {
    const tarea = await Tarea.findOne({url: req.params.url}).populate('autor').lean();

    //si no hay resuktados
    if(!tarea) return next();

    res.render('tarea', {
        tarea,
        nombrePagina:  tarea.planta,
        barra:true
    })
}

exports.formEditarTarea = async (req, res, next) => {
    const tarea = await Tarea.findOne({url: req.params.url}).lean();

    if(!tarea) return next();

    res.render('editar-tarea',{
        tarea,
        nombrePagina: `Editar - ${tarea.planta}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
        
    })
}

exports.editarTarea = async (req, res) => {
    const tareaActualizada = req.body;

    tareaActualizada.skills = req.body.skills.split(',');

    const tarea = await Tarea.findOneAndUpdate({url: req.params.url}, tareaActualizada, {
        new:true,
        runValidators: true,
    }) ;

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

    console.log(tarea);

    
}

const verificarAutor = (tarea = {}, usuario = {}) => {
    if(!tarea.autor.equals(usuario._id)){
        return false
    }
    return true;
}

//subir archivos en pdf
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
    limits : {fileSize: 200000},
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
        if(file.mimetype === 'application/pdf'){
            //el callback se ejecuta como ture o false: true cuando la imagen se acepta
            cb(null, true);
        } else{
            cb(new Error('Formato No Valido'), false);
        }
    },
    
}

const upload = multer(configuracionMulter).single('cv');

exports.contactar = async (req, res, next) => {

    const tarea = await Varea.findOne({url: req.params.url});

    //sino existe la tarea 
    if(!tarea) return next();

    //todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    //almacenar la tarea
    tarea.candidatos.push(nuevoCandidato);
    await tarea.save();

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu informe Correctamente');
    res.redirect('/')
}

exports.mostrarCandidatos = async (req, res, next) => {
    const tarea = await Tarea.findById(req.params.id).lean();

    //validacion de autor
    if(tarea.autor != req.user._id.toString()){
        return next();
    } 

    if(!tarea) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Tarea - ${tarea.planta}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: tarea.candidatos
    })
}

// Buscador de tareas
exports.buscarTareas = async (req,res) =>{
    const tareas = await Tarea.find({
        $text : {
            $search : req.body.q
        }
    }).lean();

   // modstrar las tareas
   res.render('home', {
    nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
    barra:true,
    tareas
   })
}