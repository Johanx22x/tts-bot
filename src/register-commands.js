/**
 * Script para registrar comandos slash en Discord
 * Ejecutar: npm run register-commands
 */
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { joinCommand } from './commands/tts.js';

// Validar token
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ ERROR: DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
}

const commands = [joinCommand.data.toJSON()];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('🔄 Registrando comandos slash globalmente...');
    
    // Primero necesitamos obtener el ID del cliente
    const clientData = await rest.get(Routes.oauth2CurrentApplication());
    const clientId = clientData.id;
    
    console.log(`📝 Cliente ID: ${clientId}`);
    
    await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
    );
    
    console.log('✅ Comandos registrados exitosamente');
    console.log('⏳ Nota: Puede tardar hasta 1 hora en propagarse globalmente');
    
} catch (error) {
    console.error('❌ Error:', error);
}
