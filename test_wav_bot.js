// 1. FFMPEG MOTORUNUN YERİNİ ZORLA GÖSTERİYORUZ (Hemen çıkma sorununun kesin çözümü!)
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

// 2. RENDER KANDIRMA TAKTİĞİ: Sahte Web Sunucusu
const http = require('http');
http.createServer((req, res) => {
    res.write("Bot aktif!");
    res.end();
}).listen(process.env.PORT || 3000);

// 3. RENDER IPv6 ÇÖZÜMÜ
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
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const TOKEN = process.env.TOKEN;

client.once('clientReady', () => {
    console.log(`✅ ${client.user.tag} Render'da hazır! FFmpeg yolu tanıtıldı.`);
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
            
            // Eğer cevap_sesi_1.mp3 dosyanı Render'a/GitHub'a yüklediğinden EMİNSEN:
            // Aşağıdaki 2 satırı kullan. (Yüklemediysen bot bulamadığı için yine anında çıkar!)
            // İnternetten çalmak için resource kısmını bir önceki koddaki linkle değiştirebilirsin.
            const sesDosyasiYolu = path.join(__dirname, 'cevap_sesi_1.mp3');
            const resource = createAudioResource(sesDosyasiYolu);

            player.play(resource);
            connection.subscribe(player);

            message.channel.send('🎵 Ses çalınıyor!');

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                console.log('✅ Ses bitti, kanaldan çıkıldı.');
            });

            // GİZLİ FFmpeg HATALARINI YAKALAMAK İÇİN:
            resource.playStream.on('error', error => {
                console.error('❌ Akış/FFmpeg Hatası:', error.message);
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
    console.error("❌ HATA: Token bulunamadı.");
    process.exit(1);
}

client.login(TOKEN);
