/**
 * Script para registrar comandos SOLO en un servidor específico (instantáneo)
 * Ejecutar: node src/register-commands-guild.js
 */
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { joinCommand } from './commands/tts.js';
import readline from 'readline';

// Validar token
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ ERROR: DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
}

// Crear interfaz para input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 Registro de Comandos Slash (Por Servidor)\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

rl.question('📝 Ingresa el ID de tu servidor (Guild ID): ', async (guildId) => {
    rl.close();
    
    if (!guildId || guildId.trim() === '') {
        console.error('❌ Debes proporcionar un Guild ID');
        process.exit(1);
    }
    
    const commands = [joinCommand.data.toJSON()];
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('\n🔄 Registrando comandos en el servidor...');
        
        // Obtener el ID del cliente
        const clientData = await rest.get(Routes.oauth2CurrentApplication());
        const clientId = clientData.id;
        
        console.log(`📝 Bot ID: ${clientId}`);
        console.log(`🏠 Servidor ID: ${guildId}`);
        
        // Registrar comandos en el servidor específico
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId.trim()),
            { body: commands }
        );
        
        console.log('\n✅ ¡Comandos registrados exitosamente!');
        console.log('⚡ Los comandos deberían aparecer INMEDIATAMENTE en tu servidor');
        console.log('\n💡 Prueba escribir "/" en Discord y deberías ver el comando /tts\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error);
        console.log('\n💡 Verifica que:');
        console.log('   - El Guild ID sea correcto');
        console.log('   - El bot esté en ese servidor');
        console.log('   - El token sea válido\n');
    }
});
