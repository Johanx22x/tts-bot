# 🔊 Discord Voice TTS Reader Bot

Bot de Discord que lee mensajes de texto en canales de voz usando Text-to-Speech (TTS) en español.

## ✨ Características

- 🎤 **Lee mensajes en voz**: El bot convierte mensajes de texto a voz y los reproduce en canales de voz
- 🔗 **Simplificación de URLs**: Detecta enlaces y solo menciona el dominio base (ej: `https://www.google.com/search` → `google.com`)
- 👤 **Sin mencionar usuarios**: Lee únicamente el contenido del mensaje, sin decir quién lo envió
- 📋 **Sistema de cola**: Maneja múltiples mensajes sin superponerlos
- 🇪🇸 **Idioma español**: Voz en español de España por defecto
- 🎮 **Comandos simples**: Control fácil con comandos slash

## 🛠️ Stack Tecnológico

- **Node.js** >= 18
- **discord.js** v14
- **@discordjs/voice** - Manejo de audio en Discord
- **google-tts-api** - Generación de audio TTS
- **dotenv** - Gestión de variables de entorno

## 📋 Requisitos Previos

1. **Node.js 18 o superior**: [Descargar aquí](https://nodejs.org/)
2. **FFmpeg**: Necesario para procesar audio
   - Windows: [Descargar FFmpeg](https://ffmpeg.org/download.html)
   - O instalar con: `npm install ffmpeg-static`
3. **Bot de Discord**: Crear una aplicación en [Discord Developer Portal](https://discord.com/developers/applications)

## 🚀 Instalación

### 1. Clonar/Descargar el proyecto

```bash
git clone <tu-repositorio>
cd ttsDiscordBot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DISCORD_TOKEN=tu_token_del_bot
```

Para obtener tu token:
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación (o crea una nueva)
3. Ve a la sección **Bot**
4. Copia el token (si no lo ves, haz clic en "Reset Token")

### 4. Configurar permisos del bot

Tu bot necesita los siguientes permisos:
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Connect (voz)
- ✅ Speak (voz)
- ✅ Use Slash Commands

**URL de invitación** (reemplaza `CLIENT_ID` con el ID de tu aplicación):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=3145728&scope=bot%20applications.commands
```

### 5. Habilitar Intents

En el Discord Developer Portal:
1. Ve a tu aplicación → **Bot**
2. Habilita los siguientes **Privileged Gateway Intents**:
   - ✅ Message Content Intent
   - ✅ Server Members Intent (opcional)

## ▶️ Uso

### Iniciar el bot

```bash
npm start
```

O en modo desarrollo (con auto-reinicio):
```bash
npm run dev
```

### Comandos del bot

#### `/tts join`
- El bot se une a tu canal de voz actual
- Comienza a escuchar mensajes del canal de texto donde ejecutaste el comando
- **Requisitos**: Debes estar en un canal de voz

**Ejemplo:**
```
Tú: /tts join
Bot: 🔊 TTS activado
     ✅ Conectado a: General
     📝 Leyendo mensajes de: #chat
```

#### `/tts leave`
- El bot sale del canal de voz
- Detiene la lectura de mensajes

#### `/tts status`
- Muestra el estado actual del TTS
- Indica canal de voz, canal de texto y mensajes en cola

**Ejemplo:**
```
Tú: /tts status
Bot: 📊 Estado del TTS
     🔊 Canal de voz: General
     📝 Canal de texto: #chat
     ▶️ Reproduciendo
     📋 Mensajes en cola: 2
```

## 📝 Comportamiento del Bot

### Lo que el bot LEE:
✅ Mensajes normales de texto  
✅ Enlaces (simplificados al dominio base)  
✅ Emojis (pronuncia su nombre)  

### Lo que el bot IGNORA:
❌ Mensajes de otros bots  
❌ Mensajes vacíos  
❌ Comandos (que empiezan con `/`)  
❌ Nombre del usuario que envió el mensaje  

### Procesamiento de URLs

El bot detecta y simplifica URLs automáticamente:

| URL Original | Lo que el bot dice |
|--------------|-------------------|
| `https://www.google.com/search?q=test` | `google.com` |
| `www.youtube.com/watch?v=123` | `youtube.com` |
| `discord.gg/test` | `discord.gg` |
| `https://sub.domain.com/path` | `domain.com` |

**Mensaje original:**
```
revisa https://www.google.com/maps ahora
```

**El bot dice:**
```
"revisa google punto com ahora"
```

## 🔧 Configuración Avanzada

### Cambiar idioma del TTS

Edita [src/services/ttsService.js](src/services/ttsService.js):

```javascript
const DEFAULT_LANGUAGE = 'es-ES'; // Español de España
// Otras opciones:
// 'es-MX' - Español de México
// 'es-AR' - Español de Argentina
// 'en-US' - Inglés
```

### Cambiar límite de caracteres

Edita [src/services/ttsService.js](src/services/ttsService.js):

```javascript
const MAX_TEXT_LENGTH = 200; // Caracteres máximos por mensaje
```

## 📁 Estructura del Proyecto

```
ttsDiscordBot/
├── src/
│   ├── bot.js                 # Archivo principal del bot
│   ├── commands/
│   │   └── tts.js            # Comandos /tts
│   ├── services/
│   │   ├── ttsService.js     # Generación de audio TTS
│   │   └── linkSanitizer.js  # Procesamiento de URLs
│   └── audio/
│       └── queue.js          # Sistema de cola de reproducción
├── .env                       # Variables de entorno (NO SUBIR A GIT)
├── .env.example              # Ejemplo de configuración
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Solución de Problemas

### El bot no se conecta
- ✅ Verifica que el token en `.env` sea correcto
- ✅ Asegúrate de que los Intents estén habilitados en Discord Developer Portal

### El bot no responde a comandos
- ✅ Espera hasta 1 hora para que los comandos se propaguen globalmente
- ✅ Verifica que el bot tenga permisos de "Use Slash Commands"

### Error de audio / no se reproduce
- ✅ Instala FFmpeg: `npm install ffmpeg-static`
- ✅ Verifica permisos de "Connect" y "Speak" en el canal de voz

### "Cannot find module"
```bash
npm install
```

### El bot lee URLs completas
- ✅ Verifica que [src/services/linkSanitizer.js](src/services/linkSanitizer.js) esté correctamente importado en [src/audio/queue.js](src/audio/queue.js)

## 🔒 Seguridad y Privacidad

- ✅ No se almacenan mensajes
- ✅ No se guardan audios
- ✅ Procesamiento en memoria
- ✅ No se loggea contenido de usuarios

## 📜 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:
- 🐛 Abre un issue en GitHub
- 📧 Contacta al desarrollador

---

**¡Disfruta tu bot de TTS! 🎉**
