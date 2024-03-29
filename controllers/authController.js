const passport = require("passport");
const mongoose = require('mongoose');
const Tarea = mongoose.model('Tarea');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect : '/iniciar-sesion',
    failureFlash : true,
    badRequestMessage : 'Ambos campos son obligatorios'
})

//Revisar si el usuario esata autenticado o no 
exports.verificarUsuario = (req, res, next) => {

    //revisar el usuario 
    if(req.isAuthenticated()){
        return next();// estan autenticados
    }

    //redireccionar
    res.redirect('/iniciar-sesion');

}

exports.mostrarPanel = async (req, res) => {

    //consultar el usaurio atenticado
    const tareas = await Tarea.find({autor: req.user._id}).lean();
    //const tarea = await Tarea.findById(req.params.id).lean();
    const novedades = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 
    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y Administra tus tareas desde aquí',
        cerrarSesion: true,
        novedades,
        informes,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        tareas
    })


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
exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {
            return next(err);
            
        }; 
        req.flash('correcto', 'Sesión cerrada Correctamente');
        return res.redirect('/iniciar-sesion') 
              
    });  
}
/** Formulario para Reiniciar el password */

exports.formReestablecerPassword = (req, res) =>{
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu Password',
        tagline: 'Si ya tenias una cuenta pero olvidaste tu password, colocá tu email'
    })
}

//Generar token en la tabala del usuario

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email});

    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // el usuario existe, generar token

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //Guardar el usuario

    await usuario.save()
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    
 
    //  Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    //todo correcto
    req.flash('correcto', 'Revisa tu email para las indicaciones');

    return res.redirect('/iniciar-sesion');
}

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });

    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    //Todo bien , mostrar el formulario 

    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })

}

// almacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira:{
            $gt : Date.now()
        }
    });

    //no existe el usuario el codigo es invalio
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }
    
    //asignar nuevo password, limpiar valores previos 
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //agrear y eliminar valores del objeto
    await usuario.save();

    //redirigir
    req.flash('correcto', 'Password Modificado Correctamente');
    res.redirect('/iniciar-sesion');
}