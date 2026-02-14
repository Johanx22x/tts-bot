/**
 * Servicio para detectar y normalizar URLs
 * Extrae solo el dominio base de cualquier URL
 */

/**
 * Regex para detectar URLs en texto
 * Detecta: http://, https://, www., y dominios sin protocolo
 */
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi;

/**
 * Extrae el dominio base de una URL
 * @param {string} url - URL a procesar
 * @returns {string} - Dominio base limpio
 * 
 * Ejemplos:
 * - https://www.google.com/search?q=test -> google.com
 * - www.youtube.com/watch?v=123 -> youtube.com
 * - discord.gg/test -> discord.gg
 * - https://sub.domain.com/path -> domain.com
 */
function extractBaseDomain(url) {
    try {
        // Eliminar protocolo (http://, https://)
        let cleaned = url.replace(/^https?:\/\//, '');
        
        // Eliminar www.
        cleaned = cleaned.replace(/^www\./, '');
        
        // Cortar todo después del primer /
        cleaned = cleaned.split('/')[0];
        
        // Remover parámetros de consulta (en caso de que no haya /)
        cleaned = cleaned.split('?')[0];
        
        // Remover fragmentos (#)
        cleaned = cleaned.split('#')[0];
        
        // Remover puerto si existe
        cleaned = cleaned.split(':')[0];
        
        // Obtener solo dominio base (eliminar subdominios excepto casos especiales)
        const parts = cleaned.split('.');
        
        // Casos especiales: dominios de 2 niveles conocidos (co.uk, com.ar, etc.)
        const twoLevelTLDs = ['co.uk', 'com.ar', 'com.br', 'co.jp', 'co.za'];
        
        if (parts.length >= 3) {
            const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
            
            // Si es un TLD de dos niveles, mantener 3 partes
            if (twoLevelTLDs.includes(lastTwo)) {
                return parts.slice(-3).join('.');
            }
            
            // Para casos como discord.gg, mantener solo 2 partes
            return parts.slice(-2).join('.');
        }
        
        return cleaned;
    } catch (error) {
        console.error('Error procesando URL:', url, error);
        return url; // En caso de error, devolver original
    }
}

/**
 * Limpia emojis personalizados de Discord
 * @param {string} text - Texto a procesar
 * @returns {string} - Texto con emojis procesados
 */
export function cleanEmojis(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    // Regex para emojis personalizados: <:nombre:id> o <a:nombre:id>
    const EMOJI_REGEX = /<a?:(\w+):\d+>/g;
    
    // Reemplazar emojis con formato "emoji [nombre]"
    return text.replace(EMOJI_REGEX, (match, name) => {
        return `emoji ${name}`;
    });
}

/**
 * Sanitiza el texto reemplazando URLs por sus dominios base
 * @param {string} text - Texto a procesar
 * @returns {string} - Texto con URLs reemplazadas
 */
export function sanitizeLinks(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    return text.replace(URL_REGEX, (match) => {
        const domain = extractBaseDomain(match);
        // Extraer solo el nombre del dominio (sin extensión) y agregar "enlace"
        const domainName = domain.split('.')[0];
        return `${domainName} enlace`;
    });
}

/**
 * Procesa el texto completo: limpia emojis y sanitiza enlaces
 * @param {string} text - Texto a procesar
 * @returns {string} - Texto procesado
 */
export function processText(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    // Primero limpiar emojis
    let processed = cleanEmojis(text);
    
    // Luego sanitizar enlaces
    processed = sanitizeLinks(processed);
    
    return processed;
}

/**
 * Verifica si un texto contiene URLs
 * @param {string} text - Texto a verificar
 * @returns {boolean}
 */
export function containsLinks(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    return URL_REGEX.test(text);
}

export default {
    sanitizeLinks,
    containsLinks,
    cleanEmojis,
    processText
};
