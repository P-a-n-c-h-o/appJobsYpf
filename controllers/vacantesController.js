const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require("express-validator");
//const Vacante =('../models/Vacantes.js')
const multer = require('multer');
const shortid = require('shortid');


exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario para publicar una nueva vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
    
}

// agregar vacanates a a base de datos
exports.agregarVacante = async (req, res) => {
   const vacante = new Vacante(req.body);

   //usuario autor de la vacante
   vacante.autor = req.user._id;

    //crear arreglo de habilidades (skills)
   vacante.skills= req.body.skills.split(',');

   //console.log(vacante)

    // almacenar en la base de datos
   const nuevaVacante = await vacante.save();

    //redireccionar
   res.redirect(`/vacantes/${nuevaVacante.url}`);
}

// mustra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor').lean();

    //si no hay resuktados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina:  vacante.titulo,
        barra:true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    if(!vacante) return next();

    res.render('editar-vacante',{
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
        
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new:true,
        runValidators: true,
    }) ;

    res.redirect(`/vacantes/${vacante.url}`);

}

//validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('titulo').not().isEmpty().withMessage('Agrega un Título a la Vacnte').escape(),
        body('empresa').not().isEmpty().withMessage('agrega una empresa').escape(),
        body('ubicacion').not().isEmpty().withMessage('Agrega una Ubicaión').escape(),
        body('contrato').not().isEmpty().withMessage('Selecciona el tipo de contrato').escape(),
        body('skills').not().isEmpty().withMessage('Agrega al menos una Habilidad').escape(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);

    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario para publicar una nueva vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
       // return;
    }
 
    //si toda la validacion es correcta
    next();
}


exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        //Todo bien si es el usario, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else{
        // No eliminar 
        res.status(403).send('Error')
    }

    console.log(vacante);

    
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
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
            cb(null, __dirname+'../public/uploads/cv')
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

    const vacante = await Vacante.findOne({url: req.params.url});

    //sino existe la vacante 
    if(!vacante) return next();

    //todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    //almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Curruculum Correctamente');
    res.redirect('/')
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean();

    //validacion de autor
    if(vacante.autor != req.user._id.toString()){
        return next();
    } 

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

// Buscador de Vacantes
exports.buscarVacantes = async (req,res) =>{
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    }).lean();

   // modstrar las vacantes
   res.render('home', {
    nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
    barra:true,
    vacantes
   })
}