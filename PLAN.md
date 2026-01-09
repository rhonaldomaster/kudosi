# Plan: Koombea Kudos Slack App

## Resumen

App de Slack para dar reconocimientos (kudos) entre empleados de Koombea, con modal interactivo, kudos anónimos, leaderboard configurable y exportación a Google Sheets.

---

## Stack Técnico

| Componente   | Tecnología                          |
| ------------ | ----------------------------------- |
| Backend      | Node.js + Bolt for Slack            |
| Database     | PostgreSQL (local) → Railway (prod) |
| Hosting Dev  | ngrok + local / Vercel              |
| Hosting Prod | Railway                             |
| Export       | Google Sheets API                   |
| UI           | Slack Block Kit                     |

---

## Funcionalidades

### Core (MVP)

1. **Slash command `/kudos`** → Abre modal interactivo
2. **Modal con:**
   - Selector múltiple de personas
   - Campo de razón/mensaje
   - Selector de categoría (configurable)
   - Selector de canal destino
   - Toggle "Enviar anónimamente"
3. **Publicación del kudos** en canal seleccionado
4. **Notificación DM** al receptor
5. **Kudos anónimos** (100% anónimos, sin registro de quién envió)

### Extras

6. **Leaderboard configurable** (semanal/mensual/custom)
7. **Comando `/kudos-stats`** para ver estadísticas
8. **Exportación a Google Sheets**
9. **Panel de admin** para configurar categorías

---

## Modelo de Datos (PostgreSQL)

```sql
-- Categorias configurables
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kudos enviados
CREATE TABLE kudos (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(50),          -- NULL si es anonimo
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  channel_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Receptores (muchos por kudos)
CREATE TABLE kudos_recipients (
  id SERIAL PRIMARY KEY,
  kudos_id INTEGER REFERENCES kudos(id),
  recipient_id VARCHAR(50) NOT NULL,
  notified BOOLEAN DEFAULT false
);

-- Configuracion del workspace
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Estructura del Proyecto

```
kudos/
├── src/
│   ├── app.js                 # Entry point, Bolt app setup
│   ├── commands/
│   │   ├── kudos.js           # /kudos command handler
│   │   └── kudos-stats.js     # /kudos-stats command handler
│   ├── views/
│   │   └── kudosModal.js      # Modal Block Kit builder
│   ├── actions/
│   │   └── submitKudos.js     # Modal submission handler
│   ├── events/
│   │   └── appHome.js         # App Home tab (opcional)
│   ├── services/
│   │   ├── kudosService.js    # Business logic
│   │   ├── leaderboard.js     # Leaderboard generation
│   │   └── sheetsExport.js    # Google Sheets integration
│   ├── db/
│   │   ├── connection.js      # PostgreSQL connection
│   │   ├── migrations/        # SQL migrations
│   │   └── queries.js         # DB queries
│   ├── scheduler/
│   │   └── leaderboardJob.js  # Cron for scheduled posts
│   └── utils/
│       └── blocks.js          # Block Kit helpers
├── .env.example
├── package.json
└── README.md
```

---

## Plan de Implementacion (21 dias)

### Semana 1: Foundation (Dias 1-7)

- [x] Dia 1-2: Setup proyecto Node.js + Bolt + PostgreSQL local
- [x] Dia 2-3: Crear Slack App en api.slack.com, configurar OAuth y permisos
- [x] Dia 3-4: Implementar `/kudos` command + modal basico
- [x] Dia 5-6: Implementar submission del modal + guardar en DB
- [x] Dia 7: Publicar kudos en canal + DM de notificacion

### Semana 2: Features (Dias 8-14)

- [x] Dia 8-9: Kudos anonimos (logica de no guardar sender)
- [x] Dia 10-11: Sistema de categorias configurables + CRUD basico
- [x] Dia 12-13: Leaderboard configurable + comando `/kudos-stats`
- [x] Dia 14: Scheduler para leaderboard automatico (node-cron)

### Semana 3: Polish + Demo (Dias 15-21)

- [x] Dia 15-16: Integracion Google Sheets API
- [ ] Dia 17-18: Deploy a Railway + testing en Slack de Koombea
- [ ] Dia 19-20: Pulir UX, mensajes bonitos, manejo de errores
- [ ] Dia 21: Grabar demo + preparar presentacion

---

## Configuracion Slack App

### Permisos (OAuth Scopes) necesarios:

```
chat:write          # Enviar mensajes
chat:write.public   # Enviar a canales publicos
commands            # Slash commands
im:write            # Enviar DMs
users:read          # Leer info de usuarios
channels:read       # Leer lista de canales
groups:read         # Leer canales privados
```

### Event Subscriptions:

```
app_home_opened     # (opcional) para App Home tab
```

### Interactivity:

- Request URL para modals y acciones

---

## Verificacion / Testing

1. **Unit tests:** Servicios de kudos y leaderboard
2. **Integration test:** Flujo completo en canal privado de Koombea
3. **Demo checklist:**
   - [x] Dar kudos a 1 persona
   - [x] Dar kudos a multiples personas
   - [x] Dar kudos anonimo
   - [x] Ver kudos publicado en canal
   - [x] Recibir DM de notificacion
   - [x] Ver leaderboard con `/kudos-stats`
   - [x] Exportar a Google Sheets
   - [x] Mostrar categorias configurables

---

## Archivos Criticos a Crear

1. `src/app.js` - Setup de Bolt y listeners
2. `src/commands/kudos.js` - Handler del slash command
3. `src/views/kudosModal.js` - Construccion del modal
4. `src/actions/submitKudos.js` - Procesar envio de kudos
5. `src/services/kudosService.js` - Logica de negocio
6. `src/services/leaderboard.js` - Generacion de rankings
7. `src/db/connection.js` - Conexion a PostgreSQL
8. `src/db/migrations/001_initial.sql` - Schema inicial

---

## Riesgos y Mitigaciones

| Riesgo                     | Mitigacion                                            |
| -------------------------- | ----------------------------------------------------- |
| Slack App approval tardado | Usar canal privado para testing, no necesita approval |
| Google Sheets API compleja | Dejar para el final, es nice-to-have                  |
| Cold starts en serverless  | Railway no tiene este problema                        |
| Tiempo ajustado            | Priorizar MVP, dejar polish para el final             |

---

## Reglas de Trabajo

- Confirmar cada paso antes de ejecutarlo

---

## Progreso Actual

**Ultimo update:** 9 enero 2026

### Completado:
- Setup inicial del proyecto (Node.js + Bolt + PostgreSQL)
- Slack App configurada con todos los permisos
- `/kudos` command con modal interactivo
- Submit del modal + guardar en DB
- Publicacion en canal + DM a receptores
- Kudos anonimos (100% anonimos)
- Categorias desde la base de datos
- `/kudos-stats` con leaderboard (week/month/all)
- Scheduler mensual para leaderboard automatico
- `/kudos-export` a Google Sheets

### Pendiente:
- Deploy a Railway
- Testing en Slack de Koombea (canal privado)
- Pulir UX y manejo de errores
- Grabar demo para el concurso
