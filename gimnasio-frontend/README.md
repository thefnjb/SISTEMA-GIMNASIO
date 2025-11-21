# SISTEMA-GIMNASIO — Frontend

Descripción
- Este directorio contiene el frontend de la aplicación "SISTEMA-GIMNASIO", una interfaz web (React) para gestionar miembros, entrenadores, membresías, pagos y reportes de un gimnasio.
- Está construido con React (Create React App / Vite compatible), Tailwind CSS y componentes de `@nextui-org/react`.

Contacto
- Si necesitas el archivo de configuración de entorno (`.env`) o las credenciales para correr la aplicación en tu entorno local, por favor contacta al mantenedor: CoronadoZapatafavioalexander@gmail.com

Requisitos
- Node.js (>= 16 recomendado)
- npm o yarn
- Acceso al backend del proyecto (API) y a su `.env` para la configuración de variables (host, puertos, claves, etc.).

Instalación (Windows - PowerShell)
1. Clonar el repositorio (si no lo has hecho):

```
git clone <repo-url>
cd SISTEMA-GIMNASIO/gimnasio-frontend
```

2. Instalar dependencias:

```
npm install
# o con yarn
# yarn install
```

3. Configurar variables de entorno
- El frontend puede necesitar variables para conectar con el backend (por ejemplo `REACT_APP_API_URL`).
- El `.env` NO está incluido en el repositorio por seguridad. Si lo necesitas, escríbeme a CoronadoZapatafavioalexander@gmail.com y te lo proporcionaré.

Ejecutar en desarrollo

```
npm start
# o con yarn
# yarn start
```

Esto generalmente iniciará el servidor de desarrollo en `http://localhost:3000` (o el puerto configurado).

Construir para producción

```
npm run build
# o con yarn
# yarn build
```

Notas sobre integración con el backend
- Este frontend espera una API REST en el backend (rutas como `/members`, `/plans`, `/trainers`, etc.). Asegúrate de que el backend esté corriendo y que `REACT_APP_API_URL` (u otra variable equivalente) apunte a la URL correcta.
- Si encuentras errores de CORS, revisa la configuración del backend para permitir peticiones desde el origen del frontend.

Pruebas
- Si el proyecto tiene tests configurados, puedes ejecutarlos con:

```
npm test
# o con yarn
# yarn test
```

Contribuir
- Si vas a modificar o desplegar este frontend, sigue estas prácticas:
	- Mantén las dependencias actualizadas.
	- No subas archivos `.env` ni credenciales al repositorio.
	- Documenta cambios importantes en `README.md` del root cuando sean relevantes para todo el proyecto.

¿Necesitas el `.env`?
- Escríbeme a: CoronadoZapatafavioalexander@gmail.com indicando el entorno (desarrollo/producción) y te proporcionaré las variables y pasos necesarios.

---
Archivo generado automáticamente por el asistente.

