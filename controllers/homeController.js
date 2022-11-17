const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos =  async (req, res, next) => {
    
    const vacantes = await Vacante.find().lean(); //FIND().lean() se encacrga de traernos todos los datos que tengamos en la DB
     
    if(!vacantes) return next();//si no hay vanactes nos vamos al siguiente midelwer

    res.render('home', {
        nombrePagina: 'appJobsYpf',
        tagline: 'Encuentra y Publica Trabajos para Desarrolladores Web',
        barra: 'true',
        boton: 'true',
        vacantes
    })
}