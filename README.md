# Notas:

Este es un pequeño servidor de express listo para ejecutarse y servir la carpeta public en la web.

Recuerden que deben de reconstruir los módulos de node con el comando




```
npm install
```

Luego, para correr en producción
```
npm start
```

si falla start o start2 --->

echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p



Para correr en desarrollo
```
npm run dev
```
