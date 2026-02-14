/**
 * Sistema de cola FIFO para reproducción de audio TTS
 */
import { 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} from '@discordjs/voice';
import { generateTTS, deleteAudioFile } from '../services/ttsService.js';
import { processText } from '../services/linkSanitizer.js';

/**
 * Gestiona una cola de reproducción de TTS para un servidor
 */
export class AudioQueue {
    constructor() {
        this.queue = [];
        this.isPlaying = false;
        this.audioPlayer = createAudioPlayer();
        this.connection = null;
        
        // Configurar eventos del reproductor
        this.setupPlayerEvents();
    }
    
    /**
     * Configura los eventos del reproductor de audio
     */
    setupPlayerEvents() {
        // Cuando termina de reproducir un audio
        this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            this.isPlaying = false;
            
            // Reproducir siguiente en la cola
            await this.processQueue();
        });
        
        // Manejo de errores
        this.audioPlayer.on('error', async (error) => {
            console.error('Error en el reproductor de audio:', error);
            this.isPlaying = false;
            
            // Intentar continuar con el siguiente
            await this.processQueue();
        });
    }
    
    /**
     * Establece la conexión de voz
     * @param {VoiceConnection} connection - Conexión de voz
     */
    setConnection(connection) {
        this.connection = connection;
        
        // Suscribir el reproductor a la conexión
        if (connection) {
            connection.subscribe(this.audioPlayer);
        }
    }
    
    /**
     * Agrega un mensaje a la cola
     * @param {string} text - Texto a convertir en TTS
     */
    async addToQueue(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return;
        }
        
        // Procesar texto: limpiar emojis y sanitizar enlaces
        const processedText = processText(text.trim());
        
        // Verificar que quede texto después del procesamiento
        if (!processedText || processedText.trim().length === 0) {
            console.log('[Cola] Mensaje vacío después de procesar, ignorando');
            return;
        }
        
        // Agregar a la cola
        this.queue.push(processedText);
        
        console.log(`[Cola] Agregado: "${processedText}" (Cola: ${this.queue.length})`);
        
        // Procesar cola si no está reproduciendo
        if (!this.isPlaying) {
            await this.processQueue();
        }
    }
    
    /**
     * Procesa la cola y reproduce el siguiente mensaje
     */
    async processQueue() {
        // Verificar si hay elementos en la cola
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }
        
        // Verificar que hay conexión
        if (!this.connection) {
            console.warn('[Cola] No hay conexión de voz activa');
            this.queue = [];
            return;
        }
        
        // Verificar que la conexión está lista
        if (this.connection.state.status === VoiceConnectionStatus.Destroyed ||
            this.connection.state.status === VoiceConnectionStatus.Disconnected) {
            console.warn('[Cola] Conexión de voz no disponible');
            this.queue = [];
            return;
        }
        
        this.isPlaying = true;
        
        // Obtener siguiente mensaje
        const text = this.queue.shift();
        
        console.log(`[Cola] Reproduciendo: "${text}" (Pendientes: ${this.queue.length})`);
        
        let audioFile = null;
        
        try {
            // Generar audio TTS
            audioFile = await generateTTS(text);
            
            // Crear recurso de audio
            const resource = createAudioResource(audioFile);
            
            // Reproducir audio
            this.audioPlayer.play(resource);
            
            // Esperar a que termine de reproducir o haya error
            await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5000);
            
            // Esperar a que termine y eliminar archivo
            this.audioPlayer.once(AudioPlayerStatus.Idle, async () => {
                if (audioFile) {
                    await deleteAudioFile(audioFile);
                }
            });
            
        } catch (error) {
            console.error('[Cola] Error procesando mensaje:', error);
            
            // Limpiar archivo si existe
            if (audioFile) {
                await deleteAudioFile(audioFile);
            }
            
            this.isPlaying = false;
            
            // Continuar con el siguiente
            await this.processQueue();
        }
    }
    
    /**
     * Limpia la cola y detiene la reproducción
     */
    async clear() {
        this.queue = [];
        this.isPlaying = false;
        this.audioPlayer.stop(true);
        
        console.log('[Cola] Cola limpiada');
    }
    
    /**
     * Obtiene el estado actual de la cola
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            isPlaying: this.isPlaying,
            playerStatus: this.audioPlayer.state.status
        };
    }
    
    /**
     * Desconecta y limpia recursos
     */
    async disconnect() {
        await this.clear();
        
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
        
        console.log('[Cola] Desconectado');
    }
}

// Mapa de colas por servidor (guildId -> AudioQueue)
const guildQueues = new Map();

/**
 * Obtiene o crea una cola para un servidor
 * @param {string} guildId - ID del servidor
 * @returns {AudioQueue}
 */
export function getQueue(guildId) {
    if (!guildQueues.has(guildId)) {
        guildQueues.set(guildId, new AudioQueue());
    }
    
    return guildQueues.get(guildId);
}

/**
 * Elimina la cola de un servidor
 * @param {string} guildId - ID del servidor
 */
export async function removeQueue(guildId) {
    const queue = guildQueues.get(guildId);
    
    if (queue) {
        await queue.disconnect();
        guildQueues.delete(guildId);
    }
}

export default {
    AudioQueue,
    getQueue,
    removeQueue
};
