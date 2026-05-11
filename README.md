# Discord Welcome Bot

> Merhaba ben darkdays, bugün sizlere Discord sunucularında kayıt seslerinde kullanabileceğiniz müzikli welcome botunu bırakıyorum.



> Botculuğu bıraktım ama piyasadaki sözde “developer” tayfanın yaptığı rezil welcome sistemlerini görünce bunu paylaşasım geldi. Adam Discord.js kurup iki event yazınca kendini yazılımcı sanıyor ama yaptığı welcome sistemi bomboş. > > Ses yok, müzik yok. Kanalda NPC gibi duran welcome botları.


> Şu piyasada “botcuyum” diye gezenlerin çoğunun sistemi aynı:
> Üye girer hiçbir şey olmaz.
> Yetkili girer yine ses yok.
> Ama gel gör ki anlatırken NASA projesi gibi anlatırlar.

> Bazıları üyeyi ses kanalına sokup hiçbir tepki vermeyen sistemi premium diye pazarlıyor. Sonra gelip config editleyince developer olduklarını düşünüyorlar. Hazır altyapıya emoji değiştirip “v14 özel sistem” yazınca coder olunmuyor > maalesef.

> Bu botta ise olay gerçekten çalışıyor:
> Yetkili girince yetkili müziği çalar, kayıtsız girince hoş geldin müziği çalar, yetkili çıkınca sistemi otomatik eski haline döndürür. Ses bağlantısı koparsa kendi toparlar. Çoklu token desteği de mevcut.

> Kısacası piyasadaki çoğu ezik, göstermelik, boş welcome sistemi gibi sadece online durmaz; gerçekten iş yapar. Kullanın, geliştirin, paylaşın sorun değil ama yarın bir yerde görüp “altyapı bana ait” diye developer hallerine
> girmeyin yeter. 

---

## Özellikler

- Kayıtsız üye ses kanalına girdiğinde hoşgeldin müziği çalar (döngüsel)
- Yetkili ses kanalına girdiğinde yetkili müziği çalar
- Yetkili kanaldan çıkınca hoşgeldin müziğine geri döner
- Bağlantı koptuğunda otomatik yeniden bağlanır
- Birden fazla bot token'ı ile çoklu kanal desteği

---

## Gereksinimler

### Node.js
**v22** veya üzeri gereklidir.

[node-v22.17.0-x64.msi](https://nodejs.org/dist/v22.17.0/node-v22.17.0-x64.msi) — Windows x64

### FFmpeg
Ses işleme için zorunludur. İndirip sistem PATH'ine eklemeniz gerekiyor.

[ffmpeg-release-essentials.7z](https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z)

<details>
<summary>FFmpeg PATH ayarı nasıl yapılır?</summary>

1. İndirilen arşivi açın, içindeki `bin` klasörünün tam yolunu kopyalayın
   - Örn: `C:\ffmpeg\bin`
2. Başlat menüsünde **"Ortam Değişkenleri"** arayın
3. **PATH** değişkenini düzenleyin ve yeni değer olarak `C:\ffmpeg\bin` ekleyin
4. Terminali kapatıp yeniden açın, `ffmpeg -version` yazarak test edin

</details>

---

## Kurulum

```bash
# Repoyu klonla
git clone https://github.com/kullaniciadi/discord-welcome-bot.git
cd discord-welcome-bot

# Bağımlılıkları kur
npm install
```

---

## Yapılandırma

`src/config/settings.ts` dosyasını açıp aşağıdaki alanları doldurun:

```ts
export const settings = {
    Welcome: {
        token: ['BOT_TOKEN_1'],           // Bot token'larınız (birden fazla olabilir)
        voice: ['SES_KANALI_ID'],         // Her bot için ses kanalı ID'si
        guildID: 'SUNUCU_ID',            // Sunucu ID'niz
        staff: ['YETKİLİ_ROL_ID'],       // Yetkili rol ID'leri
        unregister: ['KAYITSIZ_ROL_ID'], // Kayıtsız üye rol ID'leri
        ...
    },
};
```

> **ID nasıl alınır?** Discord'da Geliştirici Modu'nu açın (**Ayarlar → Gelişmiş → Geliştirici Modu**), ardından sunucu/kanal/rol üzerine sağ tıklayıp **"ID'yi Kopyala"** deyin.

---

## Müzik Dosyaları

`src/music/` klasörüne şu iki dosyayı koyun:

| Dosya | Açıklama |
|---|---|
| `hosgeldin.mp3` | Kayıtsız üye girişinde çalınır (döngüsel) |
| `yetkili.mp3` | Yetkili girişinde çalınır (bir kez) |

---

## Çalıştırma

```bash
# Geliştirme modunda (nodemon ile otomatik yeniden başlatma)
npm run dev

# Normal başlatma
npm start

# PM2 ile
pm2 start ecosystem.config.js
```

---

## Proje Yapısı

```
discord-welcome-bot/
├── src/
│   ├── app/
│   │   └── index.ts          # Ana bot dosyası
│   ├── base/
│   │   ├── client.ts         # Discord client sınıfı
│   │   └── logger.ts         # Renkli terminal loglama
│   ├── config/
│   │   └── settings.ts       # Bot yapılandırması
│   └── music/
│       ├── hosgeldin.mp3     # Hoşgeldin müziği
│       └── yetkili.mp3       # Yetkili müziği
├── ecosystem.config.js       # PM2 yapılandırması
├── package.json
└── tsconfig.json
```

---

### Burdan selamlar Noname, Wessel, Capo, Soull, Jarvenox dostlarıma 🫡

---

## Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakabilirsiniz.

Kısacası: kullanabilirsin, düzenleyebilirsin, dağıtabilirsin — tek ricam başkalarına aitmiş gibi sunma.
