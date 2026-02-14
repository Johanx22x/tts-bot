/**
 * Bot de Discord - Voice TTS Reader
 * Lee mensajes de texto en canales de voz usando TTS
 */
import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { joinCommand, processMessage } from './commands/tts.js';
import { initializeSodium } from './utils/sodium.js';
import { playSoundForUser } from './services/soundboardService.js';

// Validar token
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ ERROR: DISCORD_TOKEN no está definido en el archivo .env');
    process.exit(1);
}

// Inicializar libsodium antes de crear el cliente
console.log('🔐 Inicializando libsodium...');
await initializeSodium();

// Crear cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

/**
 * Evento: Bot está listo
 */
client.once('ready', async () => {
    console.log('✅ Bot conectado exitosamente');
    console.log(`📝 Usuario: ${client.user.tag}`);
    console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Registrar comandos slash
    await registerCommands();
    
    // Establecer estado
    client.user.setPresence({
        activities: [{ name: 'mensajes con TTS 🔊', type: 2 }], // Type 2 = LISTENING
        status: 'online'
    });
});

/**
 * Evento: Nuevo mensaje en un canal
 */
client.on('messageCreate', async (message) => {
    try {
        await processMessage(message);
    } catch (error) {
        console.error('[Bot] Error procesando mensaje:', error);
    }
});

/**
 * Evento: Interacción de comando slash
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    try {
        if (interaction.commandName === 'tts') {
            await joinCommand.execute(interaction);
        }
    } catch (error) {
        console.error('[Bot] Error ejecutando comando:', error);
        
        const errorMessage = {
            content: '❌ Hubo un error al ejecutar el comando.',
            ephemeral: true
        };
        
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

/**
 * Evento: Cambio de estado de voz (usuario se une/sale de canal)
 */
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        // Detectar cuando un usuario se une a un canal de voz
        const joinedChannel = !oldState.channelId && newState.channelId;
        
        if (joinedChannel) {
            const user = newState.member.user;
            const guildId = newState.guild.id;
            
            console.log(`[VoiceState] ${user.username} se unió a un canal de voz`);
            
            // Reproducir sonido si está configurado
            await playSoundForUser(user.username, guildId);
        }
    } catch (error) {
        console.error('[Bot] Error en voiceStateUpdate:', error);
    }
});

/**
 * Registra los comandos slash en Discord
 */
async function registerCommands() {
    try {
        console.log('🔄 Registrando comandos slash...');
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        const commands = [joinCommand.data.toJSON()];
        
        // Registrar globalmente (puede tardar hasta 1 hora en propagarse)
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        
        console.log('✅ Comandos registrados exitosamente');
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
}

/**
 * Manejo de errores no capturados
 */
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    process.exit(1);
});

/**
 * Manejo de cierre del bot
 */
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando bot...');
    client.destroy();
    process.exit(0);
});

// Iniciar bot
console.log('🚀 Iniciando bot...');
client.login(process.env.DISCORD_TOKEN);
