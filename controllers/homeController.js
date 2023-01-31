const mongoose = require('mongoose');
const Tarea = mongoose.model('Tarea');

exports.mostrarObjetivos =  async (req, res, next) => {
    
    const tareas = await Tarea.find().sort( {prioridad:1, inicio:1}).lean(); //FIND().lean() se encacrga de traernos todos los datos que tengamos en la DB
 
    if(!tareas) return next();//si no hay tareas nos vamos al siguiente midelwer
    const novedades = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean();
    const informes = await Tarea.find({autor: req.user._id, __v: { $gt: 0 } }).lean(); 

    res.render('home', {
        tagline: 'Todas Tus Tareas Organizadas En Un Solo Lugar',
        barra: 'true',
        cerrarSesion: 'true',
        novedades,
        informes,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        boton: 'true',
        tareas
    })

}
/*
exports.mostrarObjetivos=  async (req, res, next) => {
    


    try {
        const tareas = await Tarea.find({autor: req.user._id}).lean(); //FIND().lean() se encacrga de traernos todos los datos que tengamos en la DB
     
        if(!tareas) {
            return res.render('home', {
                nombrePagina: 'appJobsYpf',
                tagline: 'Todas Tus Tareas Organizadas En Un Solo Lugar',
                barra: 'true',
                cerrarSesion: true,
                boton: 'true',
                tareas
            })
        }
    } catch (error) {

        const tareas = await Tarea.find().lean(); //FIND().lean() se encacrga de traernos todos los datos que tengamos en la DB


        return res.render('home', {
            nombrePagina: 'appJobsYpf',
            tagline: 'Todas Tus Tareas Organizadas En Un Solo Lugar',
            barra: 'true',
            cerrarSesion: true,
            boton: 'true',
            tareas
        })
    }


    return next();//si no hay vanactes nos vamos al siguiente midelwer
}
*/
