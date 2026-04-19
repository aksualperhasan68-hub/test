// 1. RENDER KANDIRMA TAKTİĞİ: Sahte Web Sunucusu
const http = require('http');
http.createServer((req, res) => {
    res.write("Bot aktif ve calisiyor!");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. RENDER IPv6 ÇÖZÜMÜ: IPv4 kullanmaya zorluyoruz
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); 

// 3. FFMPEG MOTORUNUN YERİNİ ZORLA GÖSTERİYORUZ
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

const fs = require('fs');
const path = require('path');
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

// Token'ı Render ayarlarından (Environment Variables) çekiyoruz
const TOKEN = process.env.TOKEN;

client.once('clientReady', () => {
    console.log(`✅ ${client.user.tag} Render'da tamamen hazır! Port, FFmpeg ve IPv4 aktif.`);
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
            
            // DEDEKTİF VE YEDEK PLAN KISMI
            const sesDosyasiYolu = path.join(__dirname, 'cevap_sesi_1.mp3');
            let resource;

            if (fs.existsSync(sesDosyasiYolu)) {
                // Eğer kendi dosyan Render sunucusuna başarıyla yüklenmişse
                console.log("✅ Dosya bulundu, çalınıyor.");
                resource = createAudioResource(sesDosyasiYolu);
                message.channel.send('🎵 Kendi ses dosyan çalınıyor!');
            } else {
                // Eğer Render kendi dosyanı bulamazsa kanaldan çıkmak yerine test müziği çalar
                console.log("🚨 cevap_sesi_1.mp3 BULUNAMADI! Yedek test müziği çalınıyor.");
                resource = createAudioResource('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
                message.channel.send('⚠️ Dosyan sunucuda bulunamadığı için YEDEK internet müziği çalınıyor. Lütfen `cevap_sesi_1.mp3` dosyanı Render/GitHub\'a yüklediğinden emin ol.');
            }

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                console.log('✅ Ses bitti, kanaldan çıkıldı.');
            });

            resource.playStream?.on('error', error => {
                console.error('❌ Akış/FFmpeg Hatası:', error.message);
            });

            player.on('error', error => {
                console.error('❌ Oynatıcı hatası:', error.message);
            });

        } catch (error) {
            console.error('Hata:', error);
            message.channel.send('❌ Kritik bir bağlantı hatası oluştu.');
        }
    }
});

if (!TOKEN) {
    console.error("❌ HATA: Token bulunamadı. Lütfen Render'da 'TOKEN' değişkenini ekleyin.");
    process.exit(1);
}

client.login(TOKEN);
