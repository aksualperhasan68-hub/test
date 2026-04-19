// Render'ın botu uyutmaması için mini web sunucusu
const http = require('http');
http.createServer((req, res) => res.end('Bot aktif!')).listen(process.env.PORT || 3000);

require('node:dns').setDefaultResultOrder('ipv4first');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    entersState, 
    VoiceConnectionStatus 
} = require('@discordjs/voice');
const path = require('path');

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildVoiceStates 
    ]
});

// TOKEN KISMI
// Render'da Environment Variables kısmına "TOKEN" yazıp değerini girmen daha güvenlidir.
// Ama istersen tırnak içine buraya da yapıştırabilirsin:
const TOKEN = process.env.TOKEN || 'BURAYA_TOKENINI_YAZ';

client.once(Events.ClientReady, () => {
    console.log(`🤖 Bot giriş yaptı: ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || message.content !== '!play') return;

    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) return message.reply('Önce bir ses kanalına gir!');

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            
            // Dosya yolunu Render ortamına uygun şekilde alıyoruz
            const filePath = path.join(__dirname, 'cevap_sesi_1.wav');
            const resource = createAudioResource(filePath);
            player.play(resource);
            
            message.reply('🎵 Ses çalınıyor!');
        } catch (error) {
            console.error('❌ Bağlantı hatası:', error);
            connection.destroy();
            message.reply('Ses kanalına bağlanılamadı.');
        }

        player.on(AudioPlayerStatus.Idle, () => connection.destroy());
        player.on('error', e => console.error('Player hatası:', e));

    } catch (error) {
        console.error('Kritik Hata:', error);
    }
});

client.login(TOKEN);
