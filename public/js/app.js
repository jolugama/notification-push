var url = window.location.href;
var swLocation = '/twittor/sw.js';  //localización en producción. poner la direccion de github
// en modo desarrollo
if ((url.includes('localhost')) || (url.includes('127.0.0.1'))  ) {
    swLocation = '/sw.js';
}

var swReg;

if (navigator.serviceWorker) {


   


    window.addEventListener('load',() => {
        navigator.serviceWorker.register(swLocation).then( (reg) =>{
            swReg = reg; // serviceWorkerRegistration
            swReg.pushManager.getSubscription().then(verificaSuscripcion);
        });
    });
}





// Referencias de jQuery

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

var btnActivadas = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function () {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function () {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {

    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);

});


// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    if (!modal.hasClass('oculto')) {
        modal.animate({
            marginTop: '+=1000px',
            opacity: 0
        }, 200, function () {
            modal.addClass('oculto');
            txtMensaje.val('');
        });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje,
        user: usuario
    };


    fetch('api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => console.log('app.js', res))
        .catch(err => console.log('app.js error:', err));



    crearMensajeHTML(mensaje, usuario);

});



// Obtener mensajes del servidor
function getMensajes() {
    fetch('api')
        .then(res => res.json())
        .then(posts => {
            console.log('getMensajes',posts);
            posts.forEach(post =>
                crearMensajeHTML(post.mensaje, post.user));
        });


}

getMensajes();



// Detectar cambios de conexión
function isOnline() {
    if (navigator.onLine) {
        // tenemos conexión
        $.mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'OK!'
        });
    } else {
        // No tenemos conexión
        $.mdtoast('Offline', {
            interaction: true,
            actionText: 'OK',
            type: 'warning'
        });
    }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

isOnline();


// Notificaciones
function verificaSuscripcion(activadas) {
    if (activadas) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}



function enviarNotificacion(titulo, cuerpo) {
    const notificationOpts = {
        body: cuerpo,
        icon: 'img/icons/icon-72x72.png'
    };
    const n = new Notification(titulo, notificationOpts);
    n.onclick = () => {
        console.log('Click');
    };

}

/**
 * envia notificación push desde el lado del cliente
 * @returns 
 */
function notifyMe(titulo,cuerpo) {
    if (!window.Notification) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }
    if (Notification.permission === 'granted') {
        // new Notification('Hola Mundo! - granted');
        enviarNotificacion(titulo,cuerpo);
    } else if (Notification.permission !== 'denied' || Notification.permission === 'default') {
        Notification.requestPermission(function (permission) {
            console.log(permission);
            if (permission === 'granted') {
                // new Notification('Hola Mundo! - pregunta');
                enviarNotificacion(titulo,cuerpo);
            }
        });
    }
}

// notifyMe("holi","que tal?");


// Get Key
function getPublicKey() {
    // fetch('api/key')
    //     .then( res => res.text())
    //     .then( console.log );

    return fetch('api/key')
        .then(res => res.arrayBuffer())
        // retornar array, como un Uint8array
        .then(key => new Uint8Array(key));
}


btnDesactivadas.on('click', ()=> {
    if (!swReg) return console.log('No hay registro de SW');
    getPublicKey().then(function (key) {
        swReg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: key
            })
            .then(res => res.toJSON())
            .then(suscripcion => {
                console.log(suscripcion);
                fetch('api/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(suscripcion)
                    })
                    .then(verificaSuscripcion)
                    .catch(cancelarSuscripcion);
            });
    });
});



function cancelarSuscripcion() {
    swReg.pushManager.getSubscription().then(subs => {
        subs.unsubscribe().then(() => verificaSuscripcion(false));
    });
}

btnActivadas.on('click', function () {
    cancelarSuscripcion();
});