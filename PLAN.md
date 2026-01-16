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

**Ultimo update:** 13 enero 2026

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
- Documentacion del proyecto (`docs/HOW_IT_WORKS.md`, `docs/DEPLOYMENT.md`)

### Pendiente:
- Deploy a Railway
- Testing en Slack de Koombea (canal privado)
- Pulir UX y manejo de errores
- Grabar demo para el concurso

---

## Feature: Internacionalización (i18n)

### Objetivo
Mostrar la interfaz en el idioma que el usuario tenga configurado en Slack (español, inglés, portugués, etc.)

### Requisitos Previos

1. **Agregar scope en Slack App:**
   - Ir a api.slack.com → Tu app → OAuth & Permissions
   - Agregar scope: `users.profile:read`
   - Reinstalar la app en el workspace

2. **Instalar dependencia:**
   ```bash
   npm install i18next
   ```

### Estructura de Archivos

```
src/
├── locales/
│   ├── en.json          # Inglés (default)
│   ├── es.json          # Español
│   └── pt-BR.json       # Portugués (opcional)
├── services/
│   └── i18n.js          # Servicio de traducciones
```

### Plan de Implementación

#### Fase 1: Setup (~1 día)

- [ ] Agregar scope `users.profile:read` en Slack App
- [ ] Reinstalar app en workspace
- [ ] Instalar `i18next`
- [ ] Crear `src/services/i18n.js` con configuración base
- [ ] Crear `src/locales/en.json` con todos los strings actuales
- [ ] Crear `src/locales/es.json` con traducciones

#### Fase 2: Integración (~1-2 días)

- [ ] Crear helper `getLocale(userId, client)` para obtener idioma del usuario
- [ ] Modificar `src/views/kudosModal.js` para recibir locale y traducir labels
- [ ] Modificar `src/actions/submitKudos.js` para traducir mensajes
- [ ] Modificar `src/commands/kudosStats.js` para traducir leaderboard
- [ ] Modificar `src/commands/kudosExport.js` para traducir mensajes
- [ ] Modificar `src/scheduler/leaderboardJob.js` (usar locale default del workspace)

#### Fase 3: Testing

- [ ] Probar con usuario en inglés
- [ ] Probar con usuario en español
- [ ] Verificar fallback a inglés si idioma no soportado

### Archivos a Crear

**`src/locales/en.json`**
```json
{
  "modal": {
    "title": "Give Kudos",
    "submit": "Send Kudos",
    "cancel": "Cancel",
    "recipientLabel": "Who deserves kudos?",
    "recipientPlaceholder": "Select people",
    "messageLabel": "Why are you giving kudos?",
    "messagePlaceholder": "Write something nice...",
    "categoryLabel": "Category",
    "categoryPlaceholder": "Select a category",
    "channelLabel": "Post to channel",
    "channelPlaceholder": "Select a channel",
    "anonymousLabel": "Send anonymously?"
  },
  "kudos": {
    "receivedTitle": "You received kudos! :tada:",
    "channelMessage": "received kudos! :tada:",
    "anonymous": "Anonymous",
    "from": "From",
    "reason": "Reason",
    "category": "Category"
  },
  "leaderboard": {
    "title": "Kudos Leaderboard - {{period}}",
    "empty": "No kudos found for {{period}}. Be the first to give kudos! :star2:",
    "periods": {
      "week": "This Week",
      "month": "This Month",
      "all": "All Time"
    }
  },
  "export": {
    "exporting": ":hourglass_flowing_sand: Exporting kudos to Google Sheets...",
    "success": ":white_check_mark: Export complete!",
    "count": "Exported *{{count}}* kudos to Google Sheets.",
    "openSheet": ":link: Open Google Sheet",
    "error": ":x: Error exporting kudos: {{error}}"
  }
}
```

**`src/locales/es.json`**
```json
{
  "modal": {
    "title": "Dar Kudos",
    "submit": "Enviar Kudos",
    "cancel": "Cancelar",
    "recipientLabel": "¿Quién merece kudos?",
    "recipientPlaceholder": "Selecciona personas",
    "messageLabel": "¿Por qué le das kudos?",
    "messagePlaceholder": "Escribe algo lindo...",
    "categoryLabel": "Categoría",
    "categoryPlaceholder": "Selecciona una categoría",
    "channelLabel": "Publicar en canal",
    "channelPlaceholder": "Selecciona un canal",
    "anonymousLabel": "¿Enviar anónimamente?"
  },
  "kudos": {
    "receivedTitle": "¡Recibiste kudos! :tada:",
    "channelMessage": "¡recibió kudos! :tada:",
    "anonymous": "Anónimo",
    "from": "De",
    "reason": "Razón",
    "category": "Categoría"
  },
  "leaderboard": {
    "title": "Leaderboard de Kudos - {{period}}",
    "empty": "No hay kudos para {{period}}. ¡Sé el primero en dar kudos! :star2:",
    "periods": {
      "week": "Esta Semana",
      "month": "Este Mes",
      "all": "Todo el Tiempo"
    }
  },
  "export": {
    "exporting": ":hourglass_flowing_sand: Exportando kudos a Google Sheets...",
    "success": ":white_check_mark: ¡Exportación completa!",
    "count": "Se exportaron *{{count}}* kudos a Google Sheets.",
    "openSheet": ":link: Abrir Google Sheet",
    "error": ":x: Error exportando kudos: {{error}}"
  }
}
```

**`src/services/i18n.js`**
```javascript
const i18next = require('i18next');
const en = require('../locales/en.json');
const es = require('../locales/es.json');

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    es: { translation: es }
  },
  interpolation: {
    escapeValue: false
  }
});

// Get user locale from Slack
async function getLocale(userId, client) {
  try {
    const result = await client.users.info({ user: userId });
    const locale = result.user?.locale || 'en';
    // Map Slack locales to our supported locales
    if (locale.startsWith('es')) return 'es';
    if (locale.startsWith('pt')) return 'pt-BR';
    return 'en';
  } catch (error) {
    console.error('Error getting user locale:', error);
    return 'en';
  }
}

// Translate helper
function t(key, locale = 'en', options = {}) {
  return i18next.t(key, { lng: locale, ...options });
}

module.exports = { getLocale, t, i18next };
```

### Notas Importantes

- El locale de Slack viene en formato como `en-US`, `es-ES`, `es-LA`, `pt-BR`
- Debemos mapear a nuestros idiomas soportados (ej: `es-*` → `es`)
- Si el idioma no está soportado, fallback a inglés
- Las categorías en DB siguen en inglés (no se traducen por ahora)
- Para el scheduler mensual, usar inglés por defecto o configurar locale del workspace
