# Soundboard - Carpeta de Sonidos

Esta carpeta contiene los archivos de audio que se reproducen cuando usuarios específicos se unen a un canal de voz.

## Cómo agregar sonidos

1. **Coloca tu archivo de audio** (.mp3, .ogg, .wav) en esta carpeta
2. **Configura el usuario** en el archivo `src/services/soundboardService.js`:
   ```javascript
   const USER_SOUNDS = {
       'adrians1510': 'adrians1510.mp3',  // username de Discord -> nombre del archivo
       'otro_usuario': 'sonido.mp3',       // Agregar más usuarios aquí
   };
   ```

## Formatos soportados

- MP3 (recomendado)
- OGG
- WAV
- Cualquier formato soportado por FFmpeg

## Ejemplo

Si quieres que suene "vine_boom.mp3" cuando el usuario "pepito123" se una:

1. Copia `vine_boom.mp3` a esta carpeta
2. Edita `src/services/soundboardService.js`:
   ```javascript
   const USER_SOUNDS = {
       'adrians1510': 'adrians1510.mp3',
       'pepito123': 'vine_boom.mp3',  // ← Agregar esta línea
   };
   ```
3. Reinicia el bot

## Notas

- El nombre de usuario debe ser exacto (case-sensitive)
- El bot debe estar ya conectado al canal de voz antes de que el usuario se una
- Los sonidos interrumpen temporalmente el TTS
