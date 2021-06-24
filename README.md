# Ejemplo push notification para las PWA

Servidor express que sirve la carpeta public en la web y tiene rutas necesarias para envío de push. 

## instalar packages necesarios

```
npm install
```

## Documentación

[https://developer.mozilla.org/es/docs/Web/API/PushManager](https://developer.mozilla.org/es/docs/Web/API/PushManager)

## Ejecutar  servidor modo desarrollo

```
npm run serve
```

Si falla:
```
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

Ejecuta el archivo server.js.


## Enviar push notificacion
se puede hacer desde postman:
localhost:3000/api/push, POST. Con body x-www-form-urlencoded: titulo, cuerpo, sexo, imagen


desde terminal:
```console
node server/sendPush.js 'Nuevo post de PWA' 'Todo lo que debes saber sobre las PWA' trans  'https://joseluisgm.com/assets/images/jose_luis_garcia_martinez.png'
``` 

