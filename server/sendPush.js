
const push = require('./push');
var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);





// Envía una notificación PUSH a las personas
// que nosotros queramos
// ES ALGO que se controla del lado del server
const send= (titulo,cuerpo,sexo,imagen) => {
  const post = {
    titulo: titulo,
    cuerpo: cuerpo,
    sexo: sexo,
    imagen: imagen,
  };
  push.sendPush( post );
};

send(myArgs[0],myArgs[1],myArgs[2],myArgs[3]);

