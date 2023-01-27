const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

const tareasSchema =  new mongoose.Schema({
    planta: {
        type: String, 
        required: 'El nombre de la planta es obligatorio',
        trim : true
    }, 

    empresa: {
        type: String,
        trim: true
    },

    prioridad: {
        type: String,
        trim: true,
        required: 'La prioridad es obligatoria'
    },

    inicio: {
        type: String,
        default: 0,
        trim: true,
    },

    fin: {
        type: String,
        trim: true,
    },

    descripcion: {
        type: String,
        trim: true,
        
    },



    url: {
        type: String,
        lowercase:true
    },

    skills: [String],
    
    informes: [{
        nombre: String,
        email: String,
        cv : String,
    }],

    novedad:[{
        nombre: String,
        email: String,
        nove : String,
        
        descripNov: {
            type: String,
            trim: true,  
        },


    }],
    


    autor : {
       type: mongoose.Schema.ObjectId, 
       ref: 'Usuarios', 
       required: 'El autor es obligatorio'
    },

    cloudinary_id:{
        type: String,
    },
    
    imagen1:String,
    imagen2: String,
    path: String,
    public_id: String,
    cv : String,
    
    
});
tareasSchema.pre('save' , function(next) {

    // crear la url
    const url = slug(this.planta);
    this.url = `${url}-${shortid.generate()}`;

    next();
})

//crear indice
tareasSchema.index({'empresa': 'text', 'planta': 'text', });

module.exports = mongoose.model('Tarea', tareasSchema);