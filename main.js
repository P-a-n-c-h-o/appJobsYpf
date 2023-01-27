let allcContainerNove = document.querySelector('.campo');


/*button.addEventListener(click, function(){
    alert("diste click")
})*/

loadEventListenrs();
function loadEventListenrs(){
    allcContainerNove.addEventListener('click', addNovedades);
}

function addNovedades(e){
    console.log(e.target);
}