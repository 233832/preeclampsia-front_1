# Configuracion de autenticacion

## 1) Variables de entorno

Crear un archivo .env.local con:

NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_AUTH_WITH_CREDENTIALS=false

Nota: Use `false` cuando backend responde CORS con `Access-Control-Allow-Origin: *`.
Use `true` solo si backend permite credenciales con un origin explicito (no wildcard).

## 2) Instalar dependencias

pnpm install

## 3) Ejecutar frontend

pnpm run dev

## 4) Flujo esperado

1. Abrir /register para crear cuenta
2. El registro ejecuta auto-login
3. Ir a / para usar la app protegida
4. Abrir /ejemplo-protegido para probar endpoints autenticados

## 5) Comportamiento de seguridad

- Token access_token guardado solo en memoria
- Cookie HttpOnly enviada con withCredentials
- Si backend devuelve 401, la sesion se limpia y redirige a /login
