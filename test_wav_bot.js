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

const TOKEN = 'MTM5NTg1NjgyNjczNzc1ODMzMA.GEiyhH.skOtnBvssR4I-x2Rsigdu8jxpPIUKq8m7dcQks';

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

        // Bağlantı durumlarını izle
        connection.on('stateChange', (oldState, newState) => {
            console.log(`📡 Durum: ${oldState.status} -> ${newState.status}`);
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        // Bağlanmayı bekle (Süreyi 30 saniye yaptık)
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

            // Bağlantı kurulur kurulmaz sesi çal
            const filePath = path.join(__dirname, 'cevap_sesi_1.wav');
            const resource = createAudioResource(filePath);
            player.play(resource);

            message.reply('🎵 Ses çalınıyor!');
        } catch (error) {
            console.error('❌ Bağlantı hatası:', error);
            connection.destroy();
            message.reply('Ses kanalına bağlanılamadı (UDP engeli).');
        }

        player.on(AudioPlayerStatus.Idle, () => connection.destroy());
        player.on('error', e => console.error('Player hatası:', e));

    } catch (error) {
        console.error('Kritik Hata:', error);
    }
});

client.login(TOKEN);