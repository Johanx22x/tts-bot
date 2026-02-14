/**
 * Servicio para reproducir sonidos del soundboard cuando usuarios específicos se unen
 */
import { createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getQueue } from '../audio/queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de usuarios y sus sonidos
const USER_SOUNDS = {
    'adrians1510': 'adrians1510.mp3',  // Nombre de usuario de Discord -> nombre del archivo de sonido
    // Agregar más usuarios aquí: 'username': 'sonido.mp3'
};

/**
 * Obtiene la ruta del sonido para un usuario específico
 * @param {string} username - Nombre de usuario de Discord
 * @returns {string|null} - Ruta del archivo de sonido o null si no existe
 */
function getSoundPath(username) {
    const soundFile = USER_SOUNDS[username];
    if (!soundFile) {
        return null;
    }
    
    const soundPath = join(__dirname, '..', '..', 'sounds', soundFile);
    
    if (!existsSync(soundPath)) {
        console.warn(`[Soundboard] Archivo de sonido no encontrado: ${soundPath}`);
        return null;
    }
    
    return soundPath;
}

/**
 * Reproduce un sonido cuando un usuario específico se une
 * @param {string} username - Nombre de usuario
 * @param {string} guildId - ID del servidor
 * @returns {Promise<boolean>} - true si se reprodujo, false si no
 */
export async function playSoundForUser(username, guildId) {
    try {
        const soundPath = getSoundPath(username);
        
        if (!soundPath) {
            return false; // No hay sonido configurado para este usuario
        }
        
        const queue = getQueue(guildId);
        
        // Verificar que hay conexión de voz activa
        if (!queue.connection) {
            console.log(`[Soundboard] No hay conexión de voz activa en el servidor`);
            return false;
        }
        
        console.log(`[Soundboard] Reproduciendo sonido para ${username}`);
        
        // Crear recurso de audio
        const resource = createAudioResource(soundPath);
        
        // Reproducir inmediatamente (interrumpiendo TTS si está activo)
        queue.audioPlayer.play(resource);
        
        // Esperar a que termine de reproducir
        await new Promise((resolve) => {
            queue.audioPlayer.once(AudioPlayerStatus.Idle, resolve);
        });
        
        console.log(`[Soundboard] Sonido reproducido para ${username}`);
        
        // Reiniciar la cola de TTS si había algo en cola
        if (queue.queue.length > 0) {
            queue.isPlaying = false;
            await queue.processQueue();
        }
        
        return true;
        
    } catch (error) {
        console.error(`[Soundboard] Error reproduciendo sonido:`, error);
        return false;
    }
}

/**
 * Verifica si un usuario tiene un sonido configurado
 * @param {string} username - Nombre de usuario
 * @returns {boolean}
 */
export function hasSoundConfigured(username) {
    return username in USER_SOUNDS;
}

/**
 * Lista todos los usuarios con sonidos configurados
 * @returns {Array<{username: string, soundFile: string}>}
 */
export function listConfiguredUsers() {
    return Object.entries(USER_SOUNDS).map(([username, soundFile]) => ({
        username,
        soundFile
    }));
}

export default {
    playSoundForUser,
    hasSoundConfigured,
    listConfiguredUsers
};
