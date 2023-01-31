const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const tareasController = require('../controllers/tareasController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', authController.verificarUsuario,homeController.mostrarObjetivos);

    // Crear tareas
    router.get('/tareas/nueva',
        authController.verificarUsuario,
        tareasController.formularioNuevaTarea
    );
    router.post('/tareas/nueva',
        authController.verificarUsuario,
        tareasController.subirImagen1,
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
        tareasController.subirImagen1,
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

    //Panel de administracion
    //novedades
    router.get('/novedades', 
        authController.verificarUsuario, 
        tareasController.mostrarPanelNovedades
        
    );
    router.post('/tareas/novedades/:url',
        
    tareasController.subirNov,
    tareasController.contactarNov,
    tareasController.mostrarTarea
    );

    //muetra las noveda por tarea
    router.get('/novedad-tarea/:id', 
        authController.verificarUsuario,
        tareasController.mostrarNovedad
    )

    //informes
    
    router.get('/informes', 
        authController.verificarUsuario, 
        tareasController.mostrarPanelInformes
        
    );
    
    //Recibir Mensajes de informes
    router.post('/tareas/informes/:url',
        
        tareasController.subirCV,
        tareasController.contactarInfo,
        tareasController.mostrarTarea
        

    );

    router.get('/informe/:id', 
    authController.verificarUsuario,
    tareasController.mostrarInformes
)


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
   





    //Buscador de tareas

    router.post('/buscador', 
        authController.verificarUsuario, 
        tareasController.buscarTareas,
        
    );
    
    
    return router;

}
