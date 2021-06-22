 let swReg;
 let app = (() => {
     const url = window.location.href;
     let messageDisplayed = false;
     let swLocation = '/pushnotification/sw.js'; //localización en producción. poner la direccion de github
     // en modo desarrollo
     if ((url.includes('localhost')) || (url.includes('127.0.0.1'))) {
         swLocation = '/sw.js';
     }


     let notificacionesActivadas = false;


     // espera a cargar web, lanza verificación de estado subscripción
     if (navigator.serviceWorker) {
         window.addEventListener('load', () => {
             navigator.serviceWorker.register(swLocation).then((reg) => {
                 swReg = reg; // serviceWorkerRegistration
                 // nos subscribimos a push manager
                 swReg.pushManager.getSubscription().then(_verificaSuscripcion);
             });
             window.scroll(0, 0);
         });
     }


     // Detectar cambios de conexión
     let isOnline = () => {
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


     let showMessageNotification = () => {
         Swal.fire({
             title: 'Estáte actualizado!',
             html: `Si quieres que te informemos de nuevos <b>productos</b>,
            acepte las notificaciones y le informaremos. `,
             confirmButtonText: '<i class="fa fa-thumbs-up"></i> Vale!',
             showCancelButton: true,
             cancelButtonText: '<i class="fa fa-thumbs-down"></i> En otro momento.'
         }).then((result) => {
             /**
              * Si se acepta:
              * se subscribe al push manager, nos devuelve un objeto:
             {
                "endpoint": "https://fcm.googleapis.com/fcm/send/fdjPctCisYs:APA91bG7k7rqCkk7_R62shlOK7sxaNLG_zw_yejXWfxozJuYlfUcGzNZRDJtP7RhbZ-ioKnaRrdl8KaRmtnXGVdzkEQ_ofWALFCKA5pP4M1Kc98yj5jCNXFdtVtYc1giwm3YB7zo19p0",
                "expirationTime": null,
                "keys": {
                    "p256dh": "BP73k7BSE2QYTtgJQJiBhEgmrD0CjzXLCuLKkFDw97jDyc7B24h9ADxCQd-sq82jipyBL3OUeoanTdkalqKPhjs",
                    "auth": "aFEzGbsT0YRa1fuDrcnyxA"
                }
            }
              *  Dependiendo del navegador, la url del endpoint será diferente
              * Se llama a un servicio nuestro subscribe,
              *  que hace guardar la key y el endpoint en una bbdd
              */
             if (result.isConfirmed) {
                 if (!swReg) {
                     return console.log('No hay registro de SW');
                 }
                 _getPublicKey().then( (key)=> {
                     swReg.pushManager.subscribe({
                             userVisibleOnly: true,
                             applicationServerKey: key
                         })
                         .then(res => res.toJSON())
                         .then(suscripcion => {
                             console.log('suscripcion',suscripcion);
                             // me subscribo 
                             fetch('api/subscribe', {
                                     method: 'POST',
                                     headers: {
                                         'Content-Type': 'application/json'
                                     },
                                     body: JSON.stringify(suscripcion)
                                 })
                                 .then(_verificaSuscripcion)
                                 .then(Swal.fire('Notificaciones activadas, gracias.', '', 'success'))
                                 .catch(_cancelarSuscripcion);
                         });
                 });
             }
         })
     }

     let getMessageDisplayed = () => {
         return messageDisplayed;
     }

     let setMessageDisplayed = (_messageDisplayed) => {
         console.log(this.messageDisplayed);
         messageDisplayed = _messageDisplayed;
         console.log(this.messageDisplayed);
     }

     let getNotificacionesActivadas = () => {
         return notificacionesActivadas;
     }


     // PRIVADAS

     // retorna la clave pública del notification push
     let _getPublicKey = () => {
         return fetch('api/key')
             .then(res => res.arrayBuffer())
             // retornar array, como un Uint8array
             .then(key => new Uint8Array(key));
     }

     // cancela la subscripción. 
     let _cancelarSuscripcion = () => {
         // nos subscribimos a push manager
         swReg.pushManager.getSubscription().then(subs => {
             subs.unsubscribe().then(() => _verificaSuscripcion(false));
         });
     }

     // Notificaciones
     let _verificaSuscripcion = (activadas) => {
         if (activadas) {
             notificacionesActivadas = true;
             console.log('notificaciones activadas');
         } else {
             notificacionesActivadas = false;
             console.log('notificaciones desactivadas');
         }
     }
     // FIN PRIVADAS

     return {
         isOnline: isOnline,
         showMessageNotification: showMessageNotification,
         getMessageDisplayed: getMessageDisplayed,
         getNotificacionesActivadas: getNotificacionesActivadas,
         setMessageDisplayed: setMessageDisplayed
     }


 })();


 window.addEventListener('online', app.isOnline);
 window.addEventListener('offline', app.isOnline);
 app.isOnline();



 // *****************
 // eventos
 // *****************

 setTimeout(() => {
     // si pasa por una posición de scroll, compruebo y muestro mensaje aceptación notificación push
     return $(window).scroll((event) => {
         let scrollPercent = Math.round(100 * $(window).scrollTop() / ($(document).height() - $(window).height()));
         // MOSTRAR MENSAJE SI:
         // scroll es mayor a 80%, el usuario expresamente no lo ha denegado previamente, 
         // pregunto al sw, si las notificaciones no están aún activadas
         if (!app.getMessageDisplayed() && scrollPercent > 80 && Notification.permission !== 'denied' && app.getNotificacionesActivadas() === false) {
             app.setMessageDisplayed(true);
             console.log('se muestra mensaje para que acepte notificaciones');
             app.showMessageNotification();
         } else if (!app.getMessageDisplayed() && scrollPercent > 80 && Notification.permission === 'denied') {
             app.setMessageDisplayed(true);
             Swal.fire({
                 title: 'Notificaciones denegadas',
                 html: `Es una pena que tengas las notificaciones bloqueadas, 
            si las aceptases te avisaríamos de las mejores <b>ofertas</b> `
             })
         }
     });
 }, 3000);







 // SIN IMPORTANCIA, sin usar



 /**
  * envia una notificación desde el usuario, sin el lado del servidor.
  * @returns 
  */
 let notifyMe = (titulo, cuerpo) => {
     if (!window.Notification) {
         console.log('Este navegador no soporta notificaciones');
         return;
     }
     if (Notification.permission === 'granted') {
         // new Notification('Hola Mundo! - granted');
         _enviarNotificacion(titulo, cuerpo);
     } else if (Notification.permission !== 'denied' || Notification.permission === 'default') {
         Notification.requestPermission( (permission)=> {
             console.log(permission);
             if (permission === 'granted') {
                 // new Notification('Hola Mundo! - pregunta');
                 _enviarNotificacion(titulo, cuerpo);
             }
         });
     }
 }


 let _enviarNotificacion = (titulo, cuerpo) => {
     const notificationOpts = {
         body: cuerpo,
         icon: 'img/icons/icon-72x72.png'
     };
     const n = new Notification(titulo, notificationOpts);
     n.onclick = () => {
         console.log('Click');
     };
 }


 // notifyMe("holi","que tal?");