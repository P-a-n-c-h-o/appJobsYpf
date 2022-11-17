const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt'); // bcrypt para hashear los password

const usuariosSchema = new mongoose.Schema({      //new mongoose va almecenar siempre con una referencia para todo, para los modelos y par ala conexion, tiene algo que se lleama como singleton  
    email:{
        type: String,
        unique: true,   // no es un validador 
        lowercase: true,  // se almacean como minuscula
        trim:true,   // si hay espacios al principio o a final no afecta

    },
    nombre: {
        type: String,
        required: 'Agrega tu Nombre' //es un validador por eso podemos agregar texto, en  unique no podemos 

    },
    password:{
        type: String,
        required: true,
        trim: true

    },
    token: String,
    expira: Date,
    imagen: String


});

usuariosSchema.pre('save', async function(next){
    //si el passord ya esta hasheado no hacmoes nada (todo el objeto pasa por esta parte)
    if(!this.isModified('password')) { //si el passwod ya esta hasheado no lo vuelvas a hashear
        return next(); // deten la ejecucion 
    }
    // si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12);// con this accedemos a los campos, para acceder a caulquier otro utilizamos el mismo 
    this.password = hash;
    next();
});
//envia alerat cuando el usuario ya esta registrado 
usuariosSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoServerError' && error.code === 11000){
        next('Ese correo ya esta registrado');
    } else {
        next(error);
    }
});

//Autenticar usuario
usuariosSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password);//compara los password
        
    }
    
}
module.exports = mongoose.model('Usuarios', usuariosSchema );