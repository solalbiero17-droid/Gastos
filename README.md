# Mis Gastos

App de presupuesto personal (React Native + Expo Router), local al dispositivo:
no requiere backend ni configuración para correr.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing, `app/`)
- Datos persistidos en el dispositivo con `@react-native-async-storage/async-storage`
- TypeScript, sin librerías de UI externas (estilos con `StyleSheet`, tokens en `src/constants/theme.ts`)

## Poner en marcha

```sh
npm install
npm run start   # Metro + menú para abrir en iOS / Android / Web
npm run web      # directo en el navegador
```

No hace falta ninguna cuenta ni variable de entorno: la pantalla de login
(Google / mail) es una simulación de sesión local, como en el prototipo
original — no autentica contra ningún backend. Todos los datos (cuentas,
categorías, movimientos, metas) quedan guardados en el dispositivo.

## Estructura

```
app/                 pantallas (expo-router: cada archivo es una ruta)
  login.tsx           login simulado (Google / mail)
  setup.tsx            alta inicial de saldos y categorías
  (tabs)/               Inicio · Actividad · Resumen · Metas
  add.tsx                alta de movimiento (sin tab bar)
  limits.tsx              edición de límites por categoría
src/
  storage.ts            helpers de lectura/escritura sobre AsyncStorage
  context/               SessionContext (sesión local), DataContext (datos), ToastContext
  utils/                 formato es-AR, conversión oklch→hex, cálculos derivados
  components/            piezas de UI reutilizables
  constants/theme.ts      colores, radios, tipografía
```

## Modelo de datos (AsyncStorage)

```
misgastos.session         boolean — si la pantalla de login ya se pasó
misgastos.profile         { setupComplete, warnThreshold }
misgastos.config          { accounts[], categories[], limits{} }
misgastos.transactions    Transaction[]
misgastos.goals           Goal[]
```

"Cerrar sesión" solo vuelve a la pantalla de login — no borra datos. Al
volver a entrar (Google o mail) se retoma todo tal cual quedó.
