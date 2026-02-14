/**
 * Script para diagnosticar problemas de encriptación de voz
 */

console.log('🔍 Diagnóstico de Dependencias de Voz\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar libsodium-wrappers
try {
    const sodium = await import('libsodium-wrappers');
    await sodium.ready;
    console.log('✅ libsodium-wrappers: OK');
} catch (error) {
    console.log('❌ libsodium-wrappers: ERROR -', error.message);
}

// Verificar tweetnacl
try {
    await import('tweetnacl');
    console.log('✅ tweetnacl: OK');
} catch (error) {
    console.log('❌ tweetnacl: ERROR -', error.message);
}

// Verificar sodium-native
try {
    await import('sodium-native');
    console.log('✅ sodium-native: OK');
} catch (error) {
    console.log('⚠️  sodium-native: NO DISPONIBLE (opcional)');
}

// Verificar opusscript
try {
    await import('opusscript');
    console.log('✅ opusscript: OK');
} catch (error) {
    console.log('❌ opusscript: ERROR -', error.message);
}

// Verificar ffmpeg-static
try {
    const ffmpeg = await import('ffmpeg-static');
    console.log('✅ ffmpeg-static: OK -', ffmpeg.default);
} catch (error) {
    console.log('❌ ffmpeg-static: ERROR -', error.message);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar versión de @discordjs/voice
try {
    const voice = await import('@discordjs/voice');
    console.log('📦 @discordjs/voice importado correctamente');
    console.log('   Modos soportados:', Object.keys(voice).filter(k => k.includes('encryption') || k.includes('Encryption')));
} catch (error) {
    console.log('❌ @discordjs/voice: ERROR -', error.message);
}

console.log('\n✅ Diagnóstico completado\n');
