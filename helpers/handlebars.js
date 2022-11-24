module.exports = {
    seleccionarSkills: (seleccionados = [], opciones) =>{
        
        console.log(seleccionados);

        const skills = ['RT', 'UT', 'RX', 'PT', 'MT', 'OG', 'AE', 'VT', 'ET', 'REPLICA', 'DUREZA', 'RELEVAMIENTO'];

        let html = '';
        skills.forEach(skill => {
            html +=`
                <li ${seleccionados.includes(skill) ? 'class="activo" ' : ''}>${skill}</li>
            `;
        });

        return opciones.fn().html = html;

    },

    tipoContrato: (seleccionado, opciones) => {
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
