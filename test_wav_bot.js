// RENDER İÇİN KRİTİK AYAR: Node.js'i IPv4 kullanmaya zorluyoruz!
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

// Token'ı artık kodun içine değil, Render'ın ayarlarına yazacağız
const TOKEN = process.env.TOKEN;

client.once('clientReady', () => {
    console.log(`✅ ${client.user.tag} Render'da hazır! IPv4 Ses Modu Aktif 🚀`);
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

            // Bağlantı gecikse bile müziği durdurmasını engelliyoruz
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                },
            });
            
            // Kendi ses dosyanı okutuyoruz
            const sesDosyasiYolu = path.join(__dirname, 'cevap_sesi_1.mp3');
            const resource = createAudioResource(sesDosyasiYolu);

            player.play(resource);
            connection.subscribe(player);

            message.channel.send('🎵 Render üzerinden ses çalınıyor! (IPv4 ile)');

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
                console.log('✅ Ses bitti, kanaldan çıkıldı.');
            });

            player.on('error', error => {
                console.error('❌ Oynatıcı hatası:', error.message);
            });

        } catch (error) {
            console.error('Hata:', error);
            message.channel.send('❌ Kritik bir hata oluştu.');
        }
    }
});

if (!TOKEN) {
    console.error("❌ HATA: Bot token'ı bulunamadı. Lütfen Render ayarlarından 'TOKEN' ekleyin.");
    process.exit(1);
}

client.login(TOKEN);
