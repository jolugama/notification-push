# Ejemplo push notification para las PWA

Servidor express que sirve la carpeta public en la web. 

## instalar packages necesarios

```
npm install
```

## Ejecutar  servidor modo desarrollo

```
npm run dev
```

Si falla:
```
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

Ejecuta el archivo server.js.


