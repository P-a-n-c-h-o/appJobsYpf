module.exports = {
    seleccionarSkills: (seleccionados = [], opciones) =>{
        
 
        const skills = ['RT', 'UT', 'RX', 'PT', 'MT', 'OG', 'AE', 'VT', 'ET', 'REPLICA', 'DUREZA', 'RELEVAMIENTO', 'ANDAMIOS', 'ASLACION', 'ANDAMOVIL', 'GRUA', 'CORTE DE CALLE','ESPACIO CONFINADO'];

        let html = '';
        skills.forEach(skill => {
            html +=`
                <li ${seleccionados.includes(skill) ? 'class="activo" ' : ''}>${skill}</li>
            `;
        });

        return opciones.fn().html = html;

    },

    seleccionarSkills1: (seleccionados1 = [], opciones) =>{
        

        const skills1 = ['ANDAMIOS', 'AISLACION', 'ANDAMOVIL'];

        let html = '';
        skills1.forEach(skill1 => {
            html +=`
                <li ${seleccionados1.includes(skill1) ? 'class="activo" ' : ''}>${skill1}</li>
            `;
        });

        return opciones.fn().html = html;

    },

    tipoPrioridad: (seleccionado, opciones) => {
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },

    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);

        let html = '';
        if(categoria.length){
            errores[categoria].forEach(error => {
                html +=`<div class="${categoria} alerta">
                    ${error}
                </div>`;
            });
        }
        return alertas.fn().html = html;

    }
}
