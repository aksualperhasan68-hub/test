// 1. RENDER KANDIRMA: Port açıyoruz
const http = require('http');
http.createServer((req, res) => {
    res.write("Bot Aktif!");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. IPv4 ZORLAMASI
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); 

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const TOKEN = process.env.TOKEN;

// GÜVENİLİR TEST MP3 LİNKİ (Siteden Bulundu)
const MP3_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

client.once('clientReady', () => {
    console.log(`✅ ${client.user.tag} hazır! İnternet MP3 modu aktif.`);
});

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    if (message.content === '!çal') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ Önce ses kanalına gir!');

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Play },
            });

            // Doğrudan URL üzerinden kaynak oluşturuyoruz
            const resource = createAudioResource(MP3_URL);

            player.play(resource);
            connection.subscribe(player);

            message.channel.send('🎵 İnternet üzerinden MP3 çalınıyor, lütfen sesi kontrol et!');

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                console.log('✅ Çalma bitti.');
            });

            player.on('error', error => {
                console.error('❌ Oynatıcı hatası:', error.message);
            });

        } catch (error) {
            console.error('Hata:', error);
        }
    }
});

client.login(TOKEN);
