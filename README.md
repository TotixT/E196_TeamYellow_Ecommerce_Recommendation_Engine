# E-commerce Recommendation Engine 🚀

Este es el proyecto base para el **Team Yellow**. Una plataforma de E-commerce moderna con un Sistema de Recomendación Inteligente, construida bajo estándares profesionales de arquitectura.

## 🏛️ El Alma del Proyecto: `prisma.schema`
En este proyecto, la **Verdad Absoluta** reside en el archivo [schema.prisma](file:///c:/Users/ASUS/Desktop/Proyectos/E196_TeamYellow_Ecommerce_Recommendation_Engine/backend/prisma/schema.prisma). 
- **Es el contrato:** Define qué tablas existen y qué datos maneja el equipo.
- **Es universal:** No importa si usas Postgres Manual, Docker o Supabase; todos usamos el mismo "plano" para que el código sea compatible.
- **Regla de Oro:** Nunca edites tablas a mano en DBeaver. Edita el esquema y corre `npm run prisma:migrate`.

---

---

## 🛠️ Herramientas Necesarias (Descargas)
Antes de empezar, asegúrate de tener instaladas estas herramientas:
1. **Node.js (v20+):** [Descargar aquí](https://nodejs.org/)
2. **DBeaver (Para ver la DB):** [Descargar aquí](https://dbeaver.io/download/)
3. **Opción Local:** [PostgreSQL 18](https://www.postgresql.org/download/windows/)
4. **Opción Docker:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Elige tu camino para empezar (Setup)

### Opción A: Manual (Local en Windows) 🏠
*Ideal si no quieres usar Docker.*
1. **Crear DB:** Abre DBeaver, conéctate a tu Postgres local y crea una base de datos vacía llamada `ecommerce_recommendation_engine_db`.
2. **Configurar .env:** En el archivo `backend/.env`, quita el `#` a la línea de **Puerto 5432** y asegúrate de que la otra tenga el `#`.
3. **Sincronizar:** Abre una terminal en la raíz y corre:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. **Iniciar:** Ejecuta `npm run dev`.

### Opción B: Con Docker 🐳 ("Doble Asiento")
*Recomendado para el equipo. Todo aislado y profesional.*
1. **Encender DB:** Abre una terminal en la raíz y corre:
   ```bash
   npm run docker:db
   ```
2. **Configurar .env:** En el archivo `backend/.env`, quita el `#` a la línea de **Puerto 5435** y asegúrate de que la otra tenga el `#`.
3. **Sincronizar:** Corre en la terminal:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. **Iniciar:** Ejecuta `npm run dev`.

---

## 🏎️ Guía de Flujo: ¿Cuándo usar cada comando?

| Tu Objetivo | Comando Docker | Comando App | ¿Por qué? |
| :--- | :--- | :--- | :--- |
| **Programar el día a día** | `npm run docker:db` | `npm run dev` | Enciende solo la DB. Es más rápido para ver cambios en el código. |
| **Ver el sistema completo** | `npm run docker:up` | (Nada) | Enciende Front + Back + DB dentro de Docker. Ideal para tests finales. |
| **Hacer limpieza / Reset** | `npm run docker:clean` | - | Borra contenedores e imágenes para empezar de cero. |
| **Terminar la jornada** | `npm run docker:down` | - | Apaga todo y libera la memoria RAM de tu PC. |

---

## 🕹️ Comandos del Desarrollador (Raíz)

| Servicio | Puerto | Comando |
| :--- | :--- | :--- |
| **Frontend (Web)** | `3000` | `npm run dev` |
| **Backend (API)** | `5000` | `npm run dev` |
| **DB Local** | `5432` | (Servicio Windows) |
| **DB Docker** | `5435` | `npm run docker:up` |
| **Inspector** | - | `npm run check:all` |

---

## �️ Objetivo de la Arquitectura
Este setup está diseñado para que el equipo tenga una **base sólida y profesional** antes de empezar el desarrollo. Garantiza que:
- El sistema **corre y compila** sin errores.
- La **comunicación con la DB** está verificada.
- El código sigue estándares de **limpieza y seguridad** (ESLint).

## 🛡️ Solución de Problemas (Windows)
Si tienes errores de seguridad en PowerShell, abre una terminal como **Administrador** y ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
O simplemente usa la terminal de **CMD/Command Prompt**.
