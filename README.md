# The Wheel - APIs RESTful (Express/NodeJS)

Microservicio del submodulo **The Wheel** (modulo Inversiones) del sistema del grupo.
Laboratorio de Servicios Web - Instituto Tecnologico de Tepic.

Las APIs hacen el CRUD (GET, POST, PUT y DELETE) de las colecciones de MongoDB Atlas
(BD `the_wheel`) y de sus tablas equivalentes en Supabase. Cada API opera con la base
de datos que el usuario elige al iniciar sesion.

## Estructura

```
src/
  index.js                     arranque: conecta MongoDB y Supabase y levanta el servidor
  app.js                       configuracion de Express, Swagger y rutas
  config/
    config.js                  variables de entorno
    mongo.config.js            conexion NoSQL (MongoDB Atlas)
    supabase.config.js         conexion SQL (Supabase)
  middlewares/
    auth.middleware.js         valida el token y la base elegida
    errorHandler.js
  helpers/                     auditoria DETAIL_ROW, errores y subdocumentos
  api/v1/
    models/                    clases modelo (Mongoose) y su tabla de Supabase
    repositories/              acceso a datos MongoDB / Supabase
    services/                  servicios (logica de negocio) por coleccion y subdocumento
    controllers/               controladores por coleccion y subdocumento
    routes/                    ruteos (indice de rutas) por coleccion y subdocumento
    catalog.js                 catalogo de APIs (genera Swagger y el listado)
  swagger/swagger.js
database/supabase_the_wheel_apis.sql   tablas de Supabase
scripts/copiar_mongo_a_supabase.js     copia los datos de prueba de Atlas a Supabase
scripts/listar_apis.js                 imprime el listado de APIs
test/                                  pruebas automaticas
```

## Ejecucion

1. `npm install`
2. Copiar `.env.example` como `.env` y llenar MongoDB Atlas, Supabase y `JWT_SECRET`.
3. En Supabase > SQL Editor ejecutar `database/supabase_the_wheel_apis.sql`.
4. (Opcional) `npm run copiar:supabase` para tener los mismos datos en las dos bases.
5. `npm run dev`
6. Abrir http://localhost:3020/api-docs, ejecutar `POST /auth/login` con
   `{ "email": "...", "password": "...", "dbServer": "MongoDB" }` (o `"Supabase"`),
   copiar el token y presionar **Authorize**.

## Submodulos y rutas base (`/api/v1`)

| Submodulo | Ruta | Coleccion / tabla | Subdocumentos |
|---|---|---|---|
| Sesion | `/auth` | users / zt_usuarios | - |
| Ciclos | `/active-wheels` | active_wheels / zt_active_wheels | contracts, contracts.orders, stock_orders, phase_history, capital, position, metrics |
| Analisis | `/market-analysis` | market_analysis / zt_market_analysis | instrument, technical, financial |
| Indices | `/market-indices` | market_indices / zt_market_indices | indices |
| Noticias | `/news-sentiment` | news_sentiment / zt_news_sentiment | sentiment, event |
| Configuracion | `/wheel-config` | wheel_config / zt_wheel_config | option_rules, filters, risk, brokers |
| Validaciones | `/trade-validations` | trade_validations / zt_trade_validations | checks |

Por cada coleccion: GET (todos y uno), POST (uno y `/batch` varios), PUT (uno y `/batch` varios)
y DELETE (uno y `/batch` varios; `?type=logical` o `physical`).
Por cada subdocumento arreglo las mismas 8 operaciones; por cada subdocumento objeto GET, POST, PUT y DELETE.
`npm run listar:apis` imprime las 146 APIs.

## Pruebas

`npm test` ejecuta las pruebas con un cliente de Supabase simulado.
