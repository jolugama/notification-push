const url = window.location.href;
let messageDisplayed = false;
let swLocation = '/twittor/sw.js'; //localización en producción. poner la direccion de github
// en modo desarrollo
if ((url.includes('localhost')) || (url.includes('127.0.0.1'))) {
    swLocation = '/sw.js';
}

var swReg;
let notificacionesActivadas = false;

if (navigator.serviceWorker) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(swLocation).then((reg) => {
            swReg = reg; // serviceWorkerRegistration
            swReg.pushManager.getSubscription().then(verificaSuscripcion);
        });
    });
}

// ===== Codigo de la aplicación




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
        notificacionesActivadas = true;
        console.log('notificaciones activadas');
    } else {
        notificacionesActivadas = false;
        console.log('notificaciones desactivadas');
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
function notifyMe(titulo, cuerpo) {
    if (!window.Notification) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }
    if (Notification.permission === 'granted') {
        // new Notification('Hola Mundo! - granted');
        enviarNotificacion(titulo, cuerpo);
    } else if (Notification.permission !== 'denied' || Notification.permission === 'default') {
        Notification.requestPermission(function (permission) {
            console.log(permission);
            if (permission === 'granted') {
                // new Notification('Hola Mundo! - pregunta');
                enviarNotificacion(titulo, cuerpo);
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



// cancela la subscripción. 
function cancelarSuscripcion() {
    swReg.pushManager.getSubscription().then(subs => {
        subs.unsubscribe().then(() => verificaSuscripcion(false));
    });
}




$(window).scroll(function (event) {
    var scrollPercent = Math.round(100 * $(window).scrollTop() / ($(document).height() - $(window).height()));
    // MOSTRAR MENSAJE SI:
    // scroll es mayor a 80%, el usuario expresamente no lo ha denegado previamente, 
    // pregunto al sw, si las notificaciones no están aún activadas
    if (!messageDisplayed && scrollPercent > 80 && Notification.permission !== 'denied' && notificacionesActivadas === false) {
        messageDisplayed = true;
        console.log('se muestra mensaje para que acepte notificaciones');
        showMessageNotification();
    } else if (!messageDisplayed && scrollPercent > 80 && Notification.permission === 'denied' ) {
        messageDisplayed = true;
        Swal.fire({
            title: 'Notificaciones denegadas',
            html: `Es una pena que tengas las notificaciones bloqueadas, 
            si las aceptases te avisaríamos de las mejores <b>ofertas</b> `
        })
    }
});


let showMessageNotification = () => {
    Swal.fire({
        title: 'Estáte actualizado!',
        html: `Si quieres que te informemos de nuevos <b>productos</b>,
            acepte las notificaciones y le informaremos. `,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Vale!',
        showCancelButton: true,
        cancelButtonText: '<i class="fa fa-thumbs-down"></i> En otro momento.'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
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
                            .then(Swal.fire('Notificaciones activadas, gracias.', '', 'success'))
                            .catch(cancelarSuscripcion);
                    });
            });
        }
    })
}
