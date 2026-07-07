# 🏋️ FitPulse — Yapay Zekâ Destekli Kişisel Fitness & Zihinsel Sağlık Asistanı

> **Bitirme Projesi** · Geliştiren: **Muhammet Emir Aydoğan**
> React Native (Expo) ile geliştirilmiş, Google Gemini & ElevenLabs yapay zekâ servisleri ve Firebase bulut altyapısı ile çalışan; mobil platformlar (iOS / Android) için tam kapsamlı bir sağlık ve fitness uygulaması.

---

## 📑 İçindekiler

1. [Proje Hakkında](#-proje-hakkında)
2. [Hangi Soruna Çözüm Üretiyor?](#-hangi-soruna-çözüm-üretiyor)
3. [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
4. [Teknoloji Yığını](#-teknoloji-yığını)
5. [Uygulama Mimarisi](#-uygulama-mimarisi)
6. [Yapay Zekâ Akışı (AI Pipeline)](#-yapay-zekâ-akışı-ai-pipeline)
7. [Veri Modeli (Firestore)](#-veri-modeli-firestore)
8. [Ekranlar](#-ekranlar)
9. [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
10. [Ortam Değişkenleri (.env)](#-ortam-değişkenleri-env)
11. [Proje Klasör Yapısı](#-proje-klasör-yapısı)
12. [Çoklu Dil Desteği](#-çoklu-dil-desteği)
13. [Güvenlik Notları](#-güvenlik-notları)
14. [Bilinen Sınırlamalar](#-bilinen-sınırlamalar)
15. [Lisans & İletişim](#-lisans--i̇letişim)

---

## 🎯 Proje Hakkında

**FitPulse**, kullanıcının o anki **ruh hâli, enerji seviyesi, uyku kalitesi, kas yorgunluğu, ekipman durumu ve beslenme tercihleri** gibi günlük değişkenleri dikkate alarak, her gün için **kişiye özel** antrenman ve beslenme planı üreten akıllı bir mobil fitness asistanıdır.

Klasik fitness uygulamalarının aksine FitPulse, sabit ve genel-geçer planlar sunmaz. Bunun yerine, üretici yapay zekâ (Google Gemini) kullanarak her kullanıcı için **dinamik, bağlama duyarlı** planlar oluşturur. Buna ek olarak; vücut yağ oranı ve kalori hesaplayıcıları, nabız takibi, AI destekli sesli meditasyon, ruh hâli günlüğü, kamera ile malzeme tanıyan "Akıllı Mutfak" ve kas-bazlı antrenman analiz ısı haritası gibi bütünleşik araçlar sunar.

Uygulama, **fiziksel sağlık** ile **zihinsel sağlığı** tek bir çatı altında birleştirerek bütünsel (holistik) bir refah deneyimi hedefler.

> Proje, bir bitirme/lisans projesi kapsamında, modern mobil uygulama geliştirme, bulut tabanlı kimlik doğrulama/veri saklama ve üretici yapay zekâ entegrasyonu konularının uçtan uca uygulanmasını göstermek amacıyla geliştirilmiştir.

---

## 💡 Hangi Soruna Çözüm Üretiyor?

| Problem | FitPulse'un Çözümü |
|---|---|
| **"Bugün ne antrenmanı yapmalıyım?"** kararsızlığı | Ruh hâli, enerji, uyku ve yorgunluğa göre **o güne özel** AI planı |
| Genel planların kişisel duruma uymaması | Geri bildirim döngüsü ile plan zorluğu kullanıcıya göre **kendini ayarlar** |
| Beslenmeyi takip etmenin zorluğu | Vücut yağı + kalori/makro hesaplayıcıları planın içine **otomatik entegre** olur |
| "Elimdeki malzemelerle ne yapabilirim?" | **Akıllı Mutfak** — buzdolabı fotoğrafından AI ile sağlıklı tarif önerisi |
| Egzersizi doğru yapamama | Her hareket için tek dokunuşla **YouTube video** araması |
| Antrenman + stres yönetimi ayrı uygulamalarda | **Sesli meditasyon** ve **ruh hâli takibi** aynı uygulamada |
| Gelişimi görememe / motivasyon kaybı | **XP / Seviye**, **günlük seri (streak)**, kilo grafiği ve **kas ısı haritası** |
| Cihaz değişince verinin kaybolması | **Firebase** ile bulut senkronizasyonu — her cihazda aynı veri |

---

## ✨ Öne Çıkan Özellikler

### 🔐 Kimlik Doğrulama & Hesap Yönetimi
- **Firebase Authentication** ile gerçek e-posta/şifre tabanlı kayıt ve giriş
- Oturum kalıcılığı (AsyncStorage persistence) — uygulama kapansa bile oturum korunur
- Profil düzenleme, **e-posta değiştirme** ve yeniden kimlik doğrulamalı **şifre değiştirme**
- Base64 tabanlı hafif **profil fotoğrafı** (Firestore içinde saklanır)

### 🤖 AI Antrenman & Beslenme Planı Sihirbazı (11 Adım)
- Adım adım sihirbaz: **ruh hâli, hedef(ler), kas grubu, süre, seviye, ortam, ekipman, iyileşme durumu, uyku, diyet ve mutfak tercihi**
- Çoklu seçim destekli, animasyonlu, anatomik SVG ikonlu modern arayüz
- **Koşullu bağlam enjeksiyonu:** Yorgun/stresli/uykusuz/kas ağrılı kullanıcıya AI otomatik olarak daha hafif/toparlayıcı plan üretir
- **Şema zorlamalı (schema-enforced) JSON** çıktısı — AI'nın serbest metin/halüsinasyon üretmesi engellenir
- Üretilen planda öğünler ve egzersizler tek tek tamamlanabilir (ilerleme çubuğu)

### 🔁 Akıllı Geri Bildirim Döngüsü
- Plan tamamlandıktan sonra "çok kolaydı / zordu" gibi **derecelendirme + sebep + serbest metin** geri bildirimi
- Bu geri bildirim bir sonraki planın **zorluk ve hacmini** otomatik kalibre eder (adaptif zorluk)
- Son nabız verisi de plana yansıtılır (kalp atışı artışına göre yoğunluk ayarı)

### 🍳 Akıllı Mutfak (Multimodal Görüntü Analizi)
- Kamera veya galeriden çekilen **malzeme fotoğrafı** Gemini Vision'a gönderilir
- AI malzemeleri tanır ve **yalnızca o malzemelerle** 3 sağlıklı, protein odaklı tarif üretir
- Her tarif için kalori, protein ve malzeme bazında besin bilgisi
- Sonuçlar Firestore'a kaydedilir

### 🧘 Zihinsel Ritimler (AI Sesli Meditasyon)
- 8 farklı tema (Stres, Odak, Uyku, Kaygı, Enerji, Özgüven, Şükran, İç Huzur)
- Gemini ile **kişiye özel meditasyon metni** üretimi (isim + geçmiş seans sayısına göre)
- **ElevenLabs Text-to-Speech** ile 8 doğal insan sesi (4 kadın + 4 erkek), ses önizlemesi
- Ayarlanabilir **oynatma hızı** (0.75x–2x) ve **arka plan ambiyans sesleri** (yağmur, kuş, ateş)
- Süre takibi, favoriye ekleme, seans istatistikleri ve günlük seri
- **Demo dayanıklılığı:** AI metin üretemezse hazır yedek metne otomatik geçer, akış bozulmaz

### 📊 Sağlık Hesaplayıcıları
- **Vücut Yağ Oranı** — ABD Donanması (U.S. Navy) çevre ölçüm formülü, gerçekçi aralık doğrulamalı
- **Kalori & Makro** — Mifflin-St Jeor BMR formülü, aktivite katsayısı ve hedefe (al/koru/ver) göre
- İkisi de tek dokunuşla doğrudan **plan sihirbazına** veri olarak aktarılabilir

### ❤️ Nabız Monitörü
- Günlük ölçüm + antrenman öncesi/sonrası nabız kaydı
- BPM kategorisi (düşük/normal/yüksek) görsel geri bildirimi
- Nabız verisi hem geçmişe hem AI plan üretimine beslenir

### 😊 Ruh Hâli Takibi (Mood Tracker)
- 5 dereceli ruh hâli + opsiyonel not ile günlük kayıt
- Haftalık dağılım grafiği ve geçmiş listesi

### 📈 Analitik & Kas Isı Haritası
- Antrenman geçmişini analiz ederek **hangi kasların ne kadar çalıştırıldığını** SVG ısı haritasında gösterir
- Gün / Hafta / Ay / Yıl zaman aralığı filtresi, "en çok çalışan kas" istatistiği

### 👤 Profil & Oyunlaştırma (Gamification)
- **XP & Seviye** sistemi (her tamamlanan planda +50 XP, kademeli seviye eğrisi)
- **Günlük seri (streak)** takibi ve otomatik sıfırlama mantığı
- Kilo takibi ve animasyonlu **bezier eğrili kilo grafiği**
- Son antrenmanlar ve nabız geçmişi

### 🌍 Diğer
- **6 dil** desteği (TR, EN, DE, ES, FR, ZH) — bulut senkronizasyonlu dil tercihi
- Tamamen **karanlık tema** ve özel animasyonlar (parçacıklar, shimmer, yıldız kenarlık, nabız efektleri)
- **Çevrimdışı yedek (offline fallback):** Aktif plan AsyncStorage'a da yazılır

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| **Çatı / SDK** | React Native `0.81` · Expo SDK `54` (New Architecture etkin) |
| **Dil** | TypeScript `5.9` |
| **Navigasyon** | `react-native-tab-view` + `react-native-pager-view` (kaydırmalı sekmeler) |
| **Durum Yönetimi** | React Context API (`AppContext`, `LocalizationContext`) |
| **Kimlik & Veri** | Firebase Authentication · Cloud Firestore |
| **Yerel Depolama** | `@react-native-async-storage/async-storage` |
| **Üretici AI** | Google Gemini (`@google/genai`) — `gemini-2.5-flash` (yedek: `gemini-2.0-flash`) |
| **Seslendirme (TTS)** | ElevenLabs API (`eleven_turbo_v2_5`) |
| **Kamera / Görsel** | `expo-image-picker` |
| **Ses Oynatma** | `expo-audio` |
| **Grafikler / SVG** | `react-native-svg` |
| **Video** | `react-native-webview` (YouTube gömülü arama) |
| **UI** | `expo-linear-gradient`, `expo-blur`, `@expo/vector-icons` |

---

## 🏗 Uygulama Mimarisi

Uygulama tek bir kök bileşenden (`App.tsx`) yönetilen, **sağlayıcı (provider) tabanlı** bir mimariye sahiptir:

```
SafeAreaProvider
└── LocalizationProvider        → dil & çeviri (t fonksiyonu)
    └── AppProvider             → global state + Firebase senkronizasyonu
        └── MainApp
            ├── AuthScreen      (oturum yoksa)
            └── TabView         (oturum varsa — 13 ekran, kaydırmalı)
                ├── AppHeader            (üst başlık + seri göstergesi)
                ├── renderScene()        (aktif ekran)
                └── BottomNavigation     (yatay kaydırmalı alt menü)
```

- **Navigasyon:** Klasik stack yerine `react-native-tab-view` kullanılır. 13 ekran sekme olarak tanımlıdır; alt menü veya kaydırma ile geçiş yapılır. Hesaplayıcı/sihirbaz ekranları her girişte `key` artırılarak **remount** edilir (state sıfırlama).
- **`AppContext`** — Kullanıcı, aktif plan, geçmiş, seri, XP, kilo/yağ/kalori/nabız geçmişi gibi tüm uygulama durumunu tutar. `onAuthStateChanged` ile oturum açıldığında veriyi Firestore'dan yükler; her değişiklikte Firestore'a yazar ve AsyncStorage'a yedekler.
- **`LocalizationContext`** — Aktif dili yönetir; çevirileri `require()` ile yükler, `{değişken}` interpolasyonu destekler, tercihi AsyncStorage + Firestore'da saklar.
- **Servis katmanı** (`services/`) — Tüm dış AI çağrıları (Gemini, ElevenLabs) UI'dan soyutlanmıştır.

---

## 🧠 Yapay Zekâ Akışı (AI Pipeline)

### Gemini ile Plan Üretimi (`services/geminiService.ts`)
1. **3 katmanlı prompt:** (1) Persona/rol tanımı → (2) kullanıcının cevaplarından üretilen koşullu talimatlar → (3) katı JSON şema zorlaması.
2. **`responseSchema` ile şema zorlaması** — model yalnızca tanımlı yapıda JSON döndürebilir; egzersiz adları uluslararası İngilizce standartta istenir (video araması için).
3. **Hata toleransı:** En fazla 3 deneme. `503/429/UNAVAILABLE/demand` gibi geçici hatalarda artan beklemeyle (3s, 6s…) ve `gemini-2.5-flash` → `gemini-2.0-flash` **yedek modele** otomatik geçiş.
4. **Çok dillilik:** Tüm prompt parçaları aktif dilin çeviri dosyasından (`t(...)`) gelir; plan kullanıcının dilinde üretilir.

### Diğer AI Uçları
- **`getRecipeDetails`** — bir öğün için detaylı tarif + besin değeri
- **`generateMeditationScript`** — kişiselleştirilmiş meditasyon metni (yedek metinle dayanıklı)
- **`generateRecipesFromImage`** — multimodal: base64 görsel + metin → malzeme tanıma & tarif

### ElevenLabs TTS (`services/elevenLabsService.ts`)
- React Native'de güvenilirlik için `fetch+blob` yerine **XMLHttpRequest + arraybuffer** kullanılır.
- Gelen ses, saf-JS Base64 dönüştürücü ile `expo-file-system/legacy` üzerinden önbelleğe `.mp3` olarak yazılır.
- Eski meditasyon/önizleme dosyaları her üretimde temizlenir; istek 60 sn zaman aşımına sahiptir.

---

## 🗄 Veri Modeli (Firestore)

```
users/{uid}                         → profil, xp, level, streak, settings.language
  ├── weightHistory/{id}            → kilo kayıtları
  ├── workoutHistory/{id}           → tamamlanan antrenman geçmişi
  ├── bodyFatHistory/{id}           → vücut yağ ölçümleri
  └── calorieHistory/{id}           → kalori/makro hesapları
activePlans/{uid}                   → o anki aktif plan + tamamlama durumu
heartRateLogs/{uid}/logs/{id}       → nabız kayıtları (daily/pre/post)
moodEntries/{uid}/entries/{id}      → ruh hâli günlüğü
meditation/{uid}/logs|favorites     → meditasyon seansları ve favoriler
smartKitchen/{uid}/history/{id}     → akıllı mutfak analiz geçmişi
```

> Tüm koleksiyonlar `firestore.rules` ile korunur: bir kullanıcı **yalnızca kendi `uid`'ine ait** belgeleri okuyup yazabilir.

---

## 📱 Ekranlar

| Ekran | Dosya | Açıklama |
|---|---|---|
| Giriş / Kayıt | `AuthScreen.tsx` | Firebase Auth, animasyonlu parçacıklı arayüz |
| Ana Sayfa | `HomeScreen.tsx` | Karşılama, "nabız" CTA butonu, hızlı erişim kartları |
| Plan Sihirbazı | `WizardScreen.tsx` | 11 adımlı AI plan oluşturucu |
| Aktif Plan | `CurrentPlanScreen.tsx` | Öğün/egzersiz takibi, ilerleme, tamamlama |
| Akıllı Mutfak | `SmartKitchenScreen.tsx` | Kamera ile malzeme tanıma & tarif |
| Kalori Hesaplayıcı | `CalorieCalculatorScreen.tsx` | Mifflin-St Jeor |
| Vücut Yağ Sihirbazı | `BodyFatWizardScreen.tsx` | U.S. Navy yöntemi |
| Zihinsel Ritimler | `MentalRhythmsScreen.tsx` | AI sesli meditasyon |
| Analitik | `AnalyticsScreen.tsx` | Kas ısı haritası & istatistik |
| Ruh Hâli | `MoodTrackerScreen.tsx` | Günlük mood + haftalık grafik |
| Nabız Monitörü | `HeartRateMonitorScreen.tsx` | BPM kaydı & kategori |
| Yolculuk (Galaksi) | `GalaxyScreen.tsx` | Geçmiş görselleştirme |
| Profil | `ProfileScreen.tsx` | XP/seviye, kilo grafiği, geçmiş |
| Ayarlar | `SettingsScreen.tsx` | Profil, dil, şifre, çıkış |

**Modallar/Bileşenler:** `RecipeModal`, `VideoPlayerModal`, `SuccessScreen`, `FeedbackModal`, `AppHeader`, `BottomNavigation`, `AnimatedBentoCard`, `StarBorder` ve çeşitli SVG bileşenleri (`MuscleHeatmapSvg`, `BodySilhouettes`, `CalorieSvgs` vb.).

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js 18+**
- **Expo CLI** (`npx expo` ile kullanılabilir, global kurulum şart değil)
- Test için: **Expo Go** uygulaması (fiziksel cihaz) veya **Android Studio / Xcode** (emülatör)
- Aktif bir **Firebase** projesi, **Google Gemini** API anahtarı ve **ElevenLabs** API anahtarı

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. `.env` dosyasını oluştur
Proje kök dizinine `.env` dosyası ekleyin (bkz. [Ortam Değişkenleri](#-ortam-değişkenleri-env)). Anahtarlar **kaynak koda gömülmez**, `.env` üzerinden okunur ve `.gitignore` ile korunur.

> ⚠️ **Not:** Eski README'de anlatılan, anahtarı doğrudan `geminiService.ts` içine yazma yöntemi (`LOCAL_DEV_API_KEY`) **artık geçerli değildir.** Anahtarlar yalnızca `.env` dosyasından (`EXPO_PUBLIC_*`) okunur.

### 3. (Önerilir) Bağımlılık uyumunu doğrula
```bash
npx expo install --check     # Expo SDK ile sürüm uyumunu hizalar
npx expo install expo-asset  # expo-audio'nun gerektirdiği eksik bağımlılık
```

### 4. Uygulamayı başlat
```bash
npx expo start          # QR ile Expo Go
npx expo start --android
npx expo start --ios
```

---

## 🔑 Ortam Değişkenleri (.env)

Tüm anahtarlar `EXPO_PUBLIC_` ön ekiyle tanımlanır (Expo bunları istemci paketine dahil eder):

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Yapay Zekâ Servisleri
EXPO_PUBLIC_GEMINI_API_KEY=...        # https://aistudio.google.com/app/apikey
EXPO_PUBLIC_ELEVENLABS_API_KEY=...    # https://elevenlabs.io
```

| Değişken | Kullanıldığı Yer |
|---|---|
| `EXPO_PUBLIC_FIREBASE_*` | `src/config/firebaseConfig.ts` |
| `EXPO_PUBLIC_GEMINI_API_KEY` | `src/services/geminiService.ts` |
| `EXPO_PUBLIC_ELEVENLABS_API_KEY` | `src/services/elevenLabsService.ts` |

---

## 📂 Proje Klasör Yapısı

```
FitPulse/
├── App.tsx                      # Kök bileşen, sağlayıcılar, TabView navigasyon
├── app.json                     # Expo yapılandırması (izinler, ikonlar, eklentiler)
├── firebase.json / .firebaserc  # Firebase proje yapılandırması
├── firestore.rules              # Firestore güvenlik kuralları
├── .env                         # Gizli anahtarlar (gitignore'da)
├── src/
│   ├── config/
│   │   └── firebaseConfig.ts    # Firebase başlatma (Auth + Firestore + Storage)
│   ├── context/
│   │   ├── AppContext.tsx       # Global state + Firestore senkronizasyonu
│   │   └── LocalizationContext.tsx  # Dil & çeviri yönetimi
│   ├── services/
│   │   ├── geminiService.ts     # Gemini: plan, tarif, meditasyon, görsel analiz
│   │   └── elevenLabsService.ts # ElevenLabs TTS + ses seçenekleri
│   ├── screens/                 # 14 ekran (yukarıdaki tabloya bakın)
│   ├── components/              # Yeniden kullanılabilir UI bileşenleri & SVG'ler
│   ├── utils/
│   │   ├── fitnessCalculations.ts   # Yağ oranı & kalori/makro formülleri
│   │   ├── muscleMapping.ts         # Egzersiz → kas grubu ısı haritası mantığı
│   │   ├── meditationStorage.ts     # Meditasyon logları & favoriler (Firestore)
│   │   └── theme.ts                 # Renkler, fontlar, boşluklar, ortak stiller
│   ├── locales/                 # tr, en, de, es, fr, zh (her biri 612 anahtar)
│   └── types/
│       └── index.ts             # Tüm TypeScript tip tanımları
└── assets/                      # İkonlar, logo, splash görselleri
```

---

## 🌐 Çoklu Dil Desteği

6 dil tam olarak desteklenir ve her dil dosyası **612 çeviri anahtarı** içerir (eksiksiz ve tutarlı):

🇹🇷 Türkçe · 🇬🇧 İngilizce · 🇩🇪 Almanca · 🇪🇸 İspanyolca · 🇫🇷 Fransızca · 🇨🇳 Çince

Dil tercihi hem yerel olarak (AsyncStorage) hem de buluta (Firestore `users/{uid}/settings.language`) kaydedilir; böylece cihazlar arası senkronizedir. AI tarafından üretilen tüm içerik (planlar, tarifler, meditasyonlar) de seçili dilde gelir.

---

## 🔒 Güvenlik Notları

- `.env` dosyası `.gitignore` içindedir; anahtarlar sürüm kontrolüne **gönderilmez**.
- Firestore erişimi `firestore.rules` ile kullanıcı bazında izole edilmiştir (`request.auth.uid == userId`).
- ⚠️ **Önemli:** `EXPO_PUBLIC_*` değişkenleri Expo tarafından **istemci paketine gömülür**; yayınlanan herhangi bir derlemede teknik olarak erişilebilir hale gelirler. Bu nedenle:
  - Firebase API anahtarını **uygulama kısıtlamaları** ve App Check ile sınırlandırın.
  - **ElevenLabs anahtarı ücretli bir gizdir.** Üretim senaryosunda doğrudan istemciye gömmek yerine bir **arka uç (proxy) üzerinden** çağırmak güvenlik açısından önerilir.
  - Projeyi herkese açık paylaşmadan önce mevcut anahtarları **yenileyin/iptal edin**.

---

## ⚠️ Bilinen Sınırlamalar

- **Bağımlılık uyumu:** `react-native-pager-view` ve birkaç Expo paketi, Expo SDK 54'ün beklediği sürümlerin biraz dışındadır. Standalone/dev-client derlemeleri öncesi `npx expo install --check` ve `npx expo install expo-asset` çalıştırılması önerilir.
- **TTS internet bağımlılığı:** Sesli meditasyon, ElevenLabs'a canlı istek gerektirir; bağlantı yoksa metin gösterilir ancak ses üretilemez.
- **Video oynatma:** Egzersiz videoları, gömülü WebView üzerinden YouTube **arama sonucu** olarak açılır (doğrudan gömülü oynatıcı değil).
- **Meditasyon favorisi:** Favoriden çıkarma şu an yalnızca arayüzü günceller; kalıcı silme (`removeFavorite`) ileride bağlanabilir.

---

## 📄 Lisans & İletişim

Bu proje bir **bitirme/lisans projesi** kapsamında **Muhammet Emir Aydoğan** tarafından geliştirilmiştir. Tüm hakları geliştiriciye aittir. Eğitim ve değerlendirme amaçlıdır.

> _"Fit your pulse — bedenini ve zihnini her gün yeniden dinle."_
