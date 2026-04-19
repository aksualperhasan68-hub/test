// 1. RENDER KANDIRMA TAKTİĞİ: Sahte Web Sunucusu açıyoruz
const http = require('http');
http.createServer((req, res) => {
    res.write("Bot aktif ve calisiyor!");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. RENDER IPv6 ÇÖZÜMÜ: IPv4 kullanmaya zorluyoruz
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

// Token'ı Render ayarlarından çekiyoruz
const TOKEN = process.env.TOKEN;

client.once('clientReady', () => {
    console.log(`✅ ${client.user.tag} Render'da tamamen hazır! Port açık, IPv4 aktif.`);
});

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    if (message.content === '!çal') {
        const voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel) {
            return message.reply('❌ Önce bir ses kanalına gir!');
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                },
            });
            
            // DOSYA BULUNAMAMA HATASINI ÖNLEMEK İÇİN İNTERNETTEN ÇALIYORUZ
            const resource = createAudioResource('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

            player.play(resource);
            connection.subscribe(player);

            message.channel.send('🎵 Render üzerinden internet müziği çalınıyor!');

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                console.log('✅ Ses bitti, kanaldan çıkıldı.');
            });

            player.on('error', error => {
                console.error('❌ Oynatıcı hatası:', error.message);
            });

        } catch (error) {
            console.error('Hata:', error);
        }
    }
});

if (!TOKEN) {
    console.error("❌ HATA: Bot token'ı bulunamadı. Render ayarlarından (Environment Variables) ekleyin.");
    process.exit(1);
}

client.login(TOKEN);
