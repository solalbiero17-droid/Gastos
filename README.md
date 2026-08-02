# Mis Gastos

App de presupuesto personal (React Native + Expo Router) con autenticación real
(Google y mail/contraseña vía Firebase Auth) y datos por usuario en Firestore.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing, `app/`)
- [Firebase](https://firebase.google.com): Auth (Google + email/contraseña) y Firestore
- TypeScript, sin librerías de UI externas (estilos con `StyleSheet`, tokens en `src/constants/theme.ts`)

## Poner en marcha

1. **Instalar dependencias**

   ```sh
   npm install
   ```

2. **Crear un proyecto de Firebase**
   - [Firebase console](https://console.firebase.google.com) → crear proyecto.
   - Habilitar **Authentication** → Sign-in method → **Google** y **Email/contraseña**.
   - Crear una base de **Firestore** (modo producción) y desplegar las reglas de
     `firestore.rules` (cada usuario solo puede leer/escribir su propio árbol
     `users/{uid}/...`).
   - Project settings → General → "Your apps" → agregar una app Web y copiar el
     config (`apiKey`, `authDomain`, etc.) a un `.env` local basado en
     `.env.example`.

3. **Habilitar Google Sign-In**
   - Google Cloud Console → APIs & Services → Credentials → crear un OAuth
     client ID por plataforma que vayas a usar (Web, iOS, Android) y cargar
     esos IDs en `.env` (`EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`).
   - Sin esto, el botón de Google queda deshabilitado pero el login por mail
     sigue funcionando normalmente.

4. **Correr la app**

   ```sh
   npm run start   # Metro + menú para abrir en iOS / Android / Web
   npm run web      # directo en el navegador
   ```

## Estructura

```
app/                 pantallas (expo-router: cada archivo es una ruta)
  login.tsx           login (Google / mail)
  setup.tsx            alta inicial de saldos y categorías
  (tabs)/               Inicio · Actividad · Resumen · Metas
  add.tsx                alta de movimiento (sin tab bar)
  limits.tsx              edición de límites por categoría
src/
  firebase.ts          init de Firebase (Auth + Firestore)
  context/              AuthContext, DataContext (Firestore en tiempo real), ToastContext
  utils/                 formato es-AR, conversión oklch→hex, cálculos derivados
  components/            piezas de UI reutilizables
  constants/theme.ts      colores, radios, tipografía
```

## Modelo de datos (Firestore)

```
users/{uid}                        { setupComplete, warnThreshold }
users/{uid}/config/data            { accounts[], categories[], limits{} }
users/{uid}/transactions/{txId}    { type, currency, categoryId, accountId, amount, note, createdAt, discount? }
users/{uid}/goals/{goalId}         { name, target, saved, hue }
```

Nota de diseño: el prototipo HTML original resolvía sesión con contraseña o
"magic link" a criterio de quien implementara — se eligió mail + contraseña
(agregando un campo de contraseña al login) porque el enlace mágico de
Firebase depende de Dynamic Links, deprecado para proyectos nuevos.
