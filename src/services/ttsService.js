/**
 * Servicio de Text-to-Speech usando Google TTS API
 */
import googleTTS from 'google-tts-api';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { unlink } from 'fs/promises';
import https from 'https';
import http from 'http';

// Configuración por defecto
const DEFAULT_LANGUAGE = 'it-IT';
const DEFAULT_SPEED = 1.0; // Velocidad normal
const MAX_TEXT_LENGTH = 200; // Límite de caracteres

/**
 * Genera audio TTS y lo guarda en un archivo temporal
 * @param {string} text - Texto a convertir en audio
 * @param {string} language - Idioma (por defecto es-ES)
 * @param {number} speed - Velocidad de lectura (0.25 - 2.0)
 * @returns {Promise<string>} - Ruta del archivo de audio generado
 */
export async function generateTTS(text, language = DEFAULT_LANGUAGE, speed = DEFAULT_SPEED) {
    if (!text || typeof text !== 'string') {
        throw new Error('El texto no puede estar vacío');
    }
    
    // Limitar longitud del texto
    const limitedText = text.slice(0, MAX_TEXT_LENGTH);
    
    try {
        // Obtener URL del audio desde Google TTS
        const audioUrl = googleTTS.getAudioUrl(limitedText, {
            lang: language,
            slow: speed < 1,
            host: 'https://translate.google.com'
        });
        
        // Generar nombre de archivo temporal único
        const filename = `./temp_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
        
        // Descargar el audio
        await downloadAudio(audioUrl, filename);
        
        return filename;
    } catch (error) {
        console.error('Error generando TTS:', error);
        throw new Error('No se pudo generar el audio TTS');
    }
}

/**
 * Descarga el audio desde la URL y lo guarda en un archivo
 * @param {string} url - URL del audio
 * @param {string} filename - Nombre del archivo de destino
 */
async function downloadAudio(url, filename) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Error descargando audio: ${response.statusCode}`));
                return;
            }
            
            const writeStream = createWriteStream(filename);
            
            response.pipe(writeStream);
            
            writeStream.on('finish', () => {
                writeStream.close();
                resolve();
            });
            
            writeStream.on('error', (error) => {
                unlink(filename).catch(() => {});
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Elimina un archivo de audio temporal
 * @param {string} filename - Ruta del archivo a eliminar
 */
export async function deleteAudioFile(filename) {
    try {
        await unlink(filename);
    } catch (error) {
        // Ignorar errores si el archivo no existe
        if (error.code !== 'ENOENT') {
            console.error('Error eliminando archivo de audio:', error);
        }
    }
}

/**
 * Valida si el texto es apto para TTS
 * @param {string} text - Texto a validar
 * @returns {boolean}
 */
export function isValidTTSText(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    // Verificar que no esté vacío después de quitar espacios
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return false;
    }
    
    // Verificar que no sea solo símbolos o números
    const hasLetters = /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(trimmed);
    
    return hasLetters;
}

export default {
    generateTTS,
    deleteAudioFile,
    isValidTTSText,
    DEFAULT_LANGUAGE,
    MAX_TEXT_LENGTH
};
