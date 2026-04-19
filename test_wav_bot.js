// 1. RENDER KANDIRMA: Port açarak botun kapanmasını engeller
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot Aktif!");
});
server.listen(process.env.PORT || 3000);

// 2. IPv4 ZORLAMASI: Discord ses sunucularına bağlanma sorununu çözer
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); 

// 3. FFMPEG YOLU: Sesin hemen kesilmesini önler
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

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
const MP3_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

// Çift mesajı ve çakışmayı önlemek için kontrol
let isProcessing = false;

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} Render'da hazır!`);
});

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    if (message.content === '!çal') {
        // Eğer bot zaten bir işlem yapıyorsa bekle
        if (isProcessing) return;
        
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('❌ Önce ses kanalına gir!');

        isProcessing = true;

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Play },
            });

            const resource = createAudioResource(MP3_URL);

            player.play(resource);
            connection.subscribe(player);

            await message.channel.send('🎵 Ses çalınıyor! (İnternet üzerinden)');

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                isProcessing = false;
                console.log('✅ Çalma bitti.');
            });

            player.on('error', error => {
                console.error('❌ Oynatıcı hatası:', error.message);
                isProcessing = false;
            });

        } catch (error) {
            console.error('Bağlantı hatası:', error);
            isProcessing = false;
        }
    }
});

client.login(TOKEN);
