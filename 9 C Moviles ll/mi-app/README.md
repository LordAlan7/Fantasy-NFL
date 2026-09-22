# Fantasy NFL

Aplicacion movil/web construida con Ionic, Angular y Capacitor. Incluye autenticacion, gestion de usuarios y una galeria de fotos usando la camara del dispositivo.

## Funcionalidades

- Inicio de sesion con rutas protegidas.
- Gestion de usuarios: listar, crear, editar y eliminar.
- Captura y almacenamiento local de fotos con Capacitor Camera, Filesystem y Preferences.
- Navegacion mediante tabs.

## Requisitos

- Node.js y npm.
- Para ejecutar en dispositivos nativos: Android Studio o Xcode, segun la plataforma.
- Un API disponible en `http://localhost/api/users.php` para la gestion de usuarios.

## Instalacion

```bash
npm install
```

## Desarrollo

Inicia el servidor de desarrollo con:

```bash
npm start
```

La aplicacion quedara disponible en la URL que indique Angular CLI, normalmente `http://localhost:4200`.

## Otros comandos

```bash
npm run build   # Genera la compilacion de produccion
npm test        # Ejecuta las pruebas
npm run lint    # Ejecuta ESLint
```

## Credenciales de demostracion

- Email: `admin@test.com`
- Contraseña: `123456`

Estas credenciales aparecen en la pantalla de login y deben cambiarse antes de usar la aplicacion en un entorno real.

## Ejecucion movil

Despues de compilar la aplicacion web, sincroniza Capacitor con la plataforma elegida:

```bash
npx cap sync
npx cap open android
```

Para iOS, usa `npx cap open ios` en macOS con Xcode instalado.

## Estructura principal

```text
src/app/login/       Pantalla de autenticacion
src/app/tab1/        Gestion de usuarios mediante API
src/app/tab2/        Funcionalidad de fotos
src/app/tab3/        Tercera seccion de la aplicacion
src/app/services/    Servicios compartidos
```