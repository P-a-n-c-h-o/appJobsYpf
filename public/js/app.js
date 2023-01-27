import axios from 'axios';
import Swal from 'sweetalert2';



document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');
    //const skills1 = document.querySelector('.lista-conocimientos1');
    //limpiar las alertas
    let alertas = document.querySelector('.alertas')

    if(alertas){
        limpiarAlertas();
    }

    
    if(skills) {
        skills.addEventListener('click', agregarSkills);

        // una vez que estamos en editar, llamar la funcion
        skillsSeleccionados();
    }


    const tareasListado = document.querySelector('.panel-administracion');

    if(tareasListado){
        tareasListado.addEventListener('click', accionesListado);
    }

})

/*notificacion 

document.addEventListener('DOMContentLoaded', () => {
    const novedad = document.querySelector('.campo');
    //limpiar las alertas
    let alertas = document.querySelector('.alertas')

    if(alertas){
        limpiarAlertas();
    }

    
    if(novedad) {
        novedad.addEventListener('click', agregarNovedad);

        // una vez que estamos en editar, llamar la funcion
        //skillsSeleccionados();
    }

    //const novedadesListado = document.querySelector('.');

//    if(novedadesListado){
  //      novedadesListado.addEventListener('click', novedadesListado);
    //}

})

//const novedad = new Set();
const agregarNovedad = e => {
   console.log(e.target)
} */

const skills = new Set();
const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            // quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    } 
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}


const file = document.querySelector("input[type=file]").file
element.editor.insertFile(file);

const attachment = new Trix.Attachment({ content: '<span class="mention">@trix</span>' })
element.editor.insertAttachment(attachment);




const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));


    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })
    
    //inyectarlo en e hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;

}


const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas'); // este es un selector // si no esta esta variable seria indefinida
    const interval = setInterval(() => {
        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
}

//Eliminar tareas
const accionesListado = e => {
    e.preventDefault();

    if(e.target.dataset.eliminar){
        //eliminar por axios

        Swal.fire({
            title: '¿Confirmar Eliminación?',
            text: "Una vez eliminada no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
                //enviar la peticion con axios
                const url = `${location.origin}/tareas/eliminar/${e.target.dataset.eliminar}`;

                //axios para eliminar registro
                axios.delete(url, {params: {url} })
                    .then(function(respuesta){
                        if(respuesta.status === 200) {
                            Swal.fire(
                                'Eliminado!!',
                                respuesta.data,
                                'success'
                              );

                              //TODO: Eliminar el DOM
                              e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            type:'error',
                            title:'Hubo un error',
                            text:'No se pudo eliminar'
                        })
                    })
            }
          })
    } else if (e.target.tagName === 'A'){

        window.location.href = e.target.href;
    }
}

