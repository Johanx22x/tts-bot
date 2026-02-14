/**
 * Inicializar libsodium para encriptación de voz
 */
import sodium from 'libsodium-wrappers';

export async function initializeSodium() {
    try {
        await sodium.ready;
        console.log('✅ Libsodium inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando libsodium:', error);
        return false;
    }
}

export default { initializeSodium };
