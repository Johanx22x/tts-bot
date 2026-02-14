/**
 * Comandos /tts para el bot
 */
import { 
    SlashCommandBuilder, 
    PermissionFlagsBits,
    ChannelType 
} from 'discord.js';
import { 
    joinVoiceChannel, 
    VoiceConnectionStatus,
    entersState
} from '@discordjs/voice';
import { getQueue, removeQueue } from '../audio/queue.js';

// Mapa para rastrear qué canal de texto está asociado a cada servidor
const guildTextChannels = new Map();

/**
 * Comando: /tts join
 * El bot se une al canal de voz del usuario
 */
export const joinCommand = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Comandos de TTS')
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('El bot se une a tu canal de voz y lee mensajes de este canal')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('El bot sale del canal de voz')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Muestra el estado actual del TTS')
        ),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'join') {
            await handleJoin(interaction);
        } else if (subcommand === 'leave') {
            await handleLeave(interaction);
        } else if (subcommand === 'status') {
            await handleStatus(interaction);
        }
    }
};

/**
 * Maneja el comando /tts join
 */
async function handleJoin(interaction) {
    await interaction.deferReply();
    
    const guildId = interaction.guildId;
    const member = interaction.member;
    
    // Validación: Usuario debe estar en un canal de voz
    if (!member.voice.channel) {
        await interaction.editReply({
            content: '❌ Debes estar en un canal de voz para usar este comando.'
        });
        return;
    }
    
    const voiceChannel = member.voice.channel;
    
    // Validación: Bot necesita permisos
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has(PermissionFlagsBits.Connect) || 
        !permissions.has(PermissionFlagsBits.Speak)) {
        await interaction.editReply({
            content: '❌ No tengo permisos para conectarme o hablar en ese canal de voz.'
        });
        return;
    }
    
    // Validación: Bot no debe estar ya conectado
    const queue = getQueue(guildId);
    if (queue.connection) {
        await interaction.editReply({
            content: '⚠️ Ya estoy conectado a un canal de voz. Usa `/tts leave` primero.'
        });
        return;
    }
    
    try {
        console.log(`[TTS Join] Intentando conectar a ${voiceChannel.name}...`);
        
        // Conectar al canal de voz
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });
        
        console.log('[TTS Join] Conexión creada, esperando estado Ready...');
        
        // Manejar errores de conexión
        connection.on('error', (error) => {
            console.error('[TTS Join] Error en conexión:', error);
        });
        
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log('[TTS Join] Desconectado, intentando reconectar...');
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch {
                console.log('[TTS Join] Reconexión fallida, limpiando...');
                await removeQueue(guildId);
                guildTextChannels.delete(guildId);
            }
        });
        
        // Esperar a que la conexión esté lista (con timeout más largo)
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30000);
            console.log('[TTS Join] ✅ Conexión establecida correctamente');
        } catch (error) {
            console.error('[TTS Join] Timeout esperando Ready, pero continuando...', error);
            // Continuar de todos modos, a veces funciona incluso sin alcanzar Ready inmediatamente
        }
        
        // Asociar la conexión a la cola
        queue.setConnection(connection);
        
        // Registrar el canal de texto
        guildTextChannels.set(guildId, interaction.channelId);
        
        await interaction.editReply({
            content: `🔊 **TTS activado**\n✅ Conectado a: ${voiceChannel.name}\n📝 Leyendo mensajes de: <#${interaction.channelId}>\n\n💡 Escribe un mensaje en este canal para probarlo`
        });
        
        console.log(`[TTS] ✅ Unido a ${voiceChannel.name} en ${interaction.guild.name}`);
        
    } catch (error) {
        console.error('[TTS Join] Error detallado:', error);
        
        let errorMsg = '❌ Error al conectar al canal de voz.\n\n';
        
        if (error.message?.includes('VOICE_CONNECTION_TIMEOUT')) {
            errorMsg += '⏱️ Timeout de conexión. Verifica tu conexión a internet.';
        } else if (error.message?.includes('VOICE_JOIN_CHANNEL')) {
            errorMsg += '🔒 No tengo permisos para unirme a ese canal.';
        } else {
            errorMsg += `📝 Detalles: ${error.message || 'Error desconocido'}`;
        }
        
        await interaction.editReply({ content: errorMsg });
        
        // Limpiar cualquier estado parcial
        await removeQueue(guildId);
        guildTextChannels.delete(guildId);
    }
}

/**
 * Maneja el comando /tts leave
 */
async function handleLeave(interaction) {
    await interaction.deferReply();
    
    const guildId = interaction.guildId;
    const queue = getQueue(guildId);
    
    if (!queue.connection) {
        await interaction.editReply({
            content: '❌ No estoy conectado a ningún canal de voz.'
        });
        return;
    }
    
    try {
        // Desconectar
        await removeQueue(guildId);
        guildTextChannels.delete(guildId);
        
        await interaction.editReply({
            content: '👋 Desconectado del canal de voz.'
        });
        
        console.log(`[TTS] Desconectado de ${interaction.guild.name}`);
        
    } catch (error) {
        console.error('[TTS Leave] Error:', error);
        await interaction.editReply({
            content: '❌ Error al desconectar. Puede que ya me haya desconectado.'
        });
    }
}

/**
 * Maneja el comando /tts status
 */
async function handleStatus(interaction) {
    await interaction.deferReply();
    
    const guildId = interaction.guildId;
    const queue = getQueue(guildId);
    const status = queue.getStatus();
    
    if (!queue.connection) {
        await interaction.editReply({
            content: '📊 **Estado del TTS**\n\n❌ No estoy conectado a ningún canal de voz.\n\nUsa `/tts join` para activar el TTS.'
        });
        return;
    }
    
    const textChannelId = guildTextChannels.get(guildId);
    const voiceChannel = queue.connection.joinConfig.channelId;
    const guild = interaction.guild;
    const voiceChannelName = guild.channels.cache.get(voiceChannel)?.name || 'Desconocido';
    
    const playingStatus = status.isPlaying ? '▶️ Reproduciendo' : '⏸️ En espera';
    
    await interaction.editReply({
        content: `📊 **Estado del TTS**\n\n` +
                 `🔊 Canal de voz: ${voiceChannelName}\n` +
                 `📝 Canal de texto: <#${textChannelId}>\n` +
                 `${playingStatus}\n` +
                 `📋 Mensajes en cola: ${status.queueLength}`
    });
}

/**
 * Verifica si un mensaje debe ser leído por TTS
 * @param {Message} message - Mensaje de Discord
 * @returns {boolean}
 */
export function shouldReadMessage(message) {
    const guildId = message.guildId;
    const queue = getQueue(guildId);
    
    // Verificar que hay conexión
    if (!queue.connection) {
        return false;
    }
    
    // Verificar que el mensaje es del canal correcto
    const textChannelId = guildTextChannels.get(guildId);
    if (message.channelId !== textChannelId) {
        return false;
    }
    
    // Ignorar bots
    if (message.author.bot) {
        return false;
    }
    
    // Ignorar mensajes vacíos
    if (!message.content || message.content.trim().length === 0) {
        return false;
    }
    
    // Ignorar comandos (que empiezan con /)
    if (message.content.startsWith('/')) {
        return false;
    }
    
    return true;
}

/**
 * Reemplaza las menciones de usuarios con sus nombres
 * @param {Message} message - Mensaje de Discord
 * @returns {string} - Texto con menciones reemplazadas
 */
function replaceMentions(message) {
    let text = message.content;
    
    // Reemplazar menciones de usuarios <@123456> o <@!123456> con nombres del servidor
    message.mentions.users.forEach(user => {
        const mention = `<@!${user.id}>`;
        const mentionAlt = `<@${user.id}>`;
        
        // Excepción: para el usuario adrians1510, usar el ID en lugar del nombre
        if (user.username === 'adrians1510') {
            text = text.replace(new RegExp(mention, 'g'), user.id);
            text = text.replace(new RegExp(mentionAlt, 'g'), user.id);
        } else {
            // Intentar obtener el miembro del servidor para usar su nickname
            const member = message.guild?.members.cache.get(user.id);
            const displayName = member ? member.displayName : user.username;
            
            text = text.replace(new RegExp(mention, 'g'), `@${displayName}`);
            text = text.replace(new RegExp(mentionAlt, 'g'), `@${displayName}`);
        }
    });
    
    // Reemplazar menciones de roles
    message.mentions.roles.forEach(role => {
        const mention = `<@&${role.id}>`;
        text = text.replace(new RegExp(mention, 'g'), role.name);
    });
    
    // Reemplazar menciones de canales
    message.mentions.channels.forEach(channel => {
        const mention = `<#${channel.id}>`;
        text = text.replace(new RegExp(mention, 'g'), channel.name);
    });
    
    return text;
}

/**
 * Procesa un mensaje y lo agrega a la cola de TTS
 * @param {Message} message - Mensaje de Discord
 */
export async function processMessage(message) {
    if (!shouldReadMessage(message)) {
        return;
    }
    
    const guildId = message.guildId;
    const queue = getQueue(guildId);
    
    // Procesar menciones antes de agregar a la cola
    const textWithMentions = replaceMentions(message);
    
    // Agregar a la cola (el texto será sanitizado dentro)
    await queue.addToQueue(textWithMentions);
}

export default {
    joinCommand,
    shouldReadMessage,
    processMessage
};
