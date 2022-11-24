const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const tareasController = require('../controllers/tareasController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarObjetivos);

    // Crear tareas
    router.get('/tareas/nueva',
        authController.verificarUsuario,
        tareasController.formularioNuevaTarea
    );
    router.post('/tareas/nueva',
        authController.verificarUsuario,
        tareasController.validarTarea,
        tareasController.agregarTarea
    );

    //Mostrar tarea (singular)
    router.get('/tareas/:url', tareasController.mostrarTarea);

    //Editar tarea

    router.get('/tareas/editar/:url',
        authController.verificarUsuario,
        tareasController.formEditarTarea
    );
    router.post('/tareas/editar/:url',
        authController.verificarUsuario,
        tareasController.validarTarea,   
        tareasController.editarTarea
    );

    //eliminar tareas
    router.delete('/tareas/eliminar/:id',
    tareasController.eliminarTarea
    );

    //crear cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    //Autenticar Usuario
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //cerrar sesion
    router.get('/cerrar-sesion', 
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    //resetear password (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    //Resetear Password (almcaenar en la BD)
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);

    //Panel de administracion
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    //editar perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    )
   
    //Recibir Mensajes de candidatos
    router.post('/tareas/:url',
    tareasController.subirCV,
    tareasController.contactar
    );

    //muetra los candidatos por tarea
    router.get('/candidatos/:id', 
        authController.verificarUsuario,
        tareasController.mostrarCandidatos
    )
    //Buscador de tareas

    router.post('/buscador', tareasController.buscarTareas);

    return router;

}
