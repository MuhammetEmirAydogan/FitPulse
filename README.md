<div align="center">

<img src="assets/logo.png" alt="FitPulse" width="112" height="112" />

# FitPulse

**🏋️ Yapay Zekâ Destekli Kişisel Fitness &amp; Zihinsel Sağlık Asistanı**
<br/>
**🧠 AI-Powered Personal Fitness &amp; Mental Wellness Assistant**

<sub>Ruh hâline, enerjine, uykuna ve hedeflerine göre <b>her gün AI ile kişisel</b> antrenman &amp; beslenme planı<br/>
Your <b>personalized daily AI</b> workout &amp; nutrition plan — adapted to your mood, energy, sleep &amp; goals</sub>

<!-- Poster (2. aşamada buraya konabilir) / Poster can go here in the visuals phase:
     <img src="docs/screenshots/poster.png" width="100%"/> -->

<p>
  <img src="https://img.shields.io/badge/React_Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Expo_SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>
  <img src="https://img.shields.io/badge/ElevenLabs-TTS-111111?style=for-the-badge&logo=elevenlabs&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/Platform-iOS_|_Android-8A2BE2?style=flat-square&logo=apple&logoColor=white"/>
  <img src="https://img.shields.io/badge/i18n-6_Languages-40E0D0?style=flat-square&logo=googletranslate&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-All_Rights_Reserved-FC4B6C?style=flat-square"/>
</p>

<!-- ⬇️ Hero ekran-görüntü şeridi / Hero screenshot strip -->
<table border="0" cellspacing="0" cellpadding="0">
<tr>
<td><img src="docs/screenshots/home.png" width="146"/></td>
<td><img src="docs/screenshots/wizard-03-muscle.png" width="146"/></td>
<td><img src="docs/screenshots/plan-meals.png" width="146"/></td>
<td><img src="docs/screenshots/smart-kitchen-03-result.png" width="146"/></td>
<td><img src="docs/screenshots/analytics-heatmap.png" width="146"/></td>
</tr>
</table>

<b><a href="#-türkçe">🇹🇷 Türkçe</a> &nbsp;·&nbsp; <a href="#-english">🇬🇧 English</a> &nbsp;·&nbsp; <a href="#-ekran-görüntüleri">📸 Tüm Ekranlar / All Screens</a></b>

</div>

---

<a name="-türkçe"></a>

# 🇹🇷 Türkçe

> **Bitirme Projesi** · Geliştiren: **Muhammet Emir Aydoğan**
> React Native (Expo) ile geliştirilmiş; Google Gemini & ElevenLabs yapay zekâ servisleri ve Firebase bulut altyapısı ile çalışan, iOS / Android için tam kapsamlı bir sağlık ve fitness uygulaması.

## 📑 İçindekiler

1. [Proje Hakkında](#-proje-hakkında)
2. [Hangi Soruna Çözüm Üretiyor?](#-hangi-soruna-çözüm-üretiyor)
3. [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
4. [Ekran Görüntüleri](#-ekran-görüntüleri)
5. [Teknoloji Yığını](#-teknoloji-yığını)
6. [Uygulama Mimarisi](#-uygulama-mimarisi)
7. [Yapay Zekâ Akışı](#-yapay-zekâ-akışı-ai-pipeline)
8. [Veri Modeli (Firestore)](#-veri-modeli-firestore)
9. [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
10. [Kullanım Rehberi](#-kullanım-rehberi)
11. [Proje Klasör Yapısı](#-proje-klasör-yapısı)
12. [Çoklu Dil Desteği](#-çoklu-dil-desteği)
13. [Güvenlik Notları](#-güvenlik-notları)
14. [Lisans](#-lisans)
15. [İletişim](#-i̇letişim)

---

## 🎯 Proje Hakkında

**FitPulse**, kullanıcının o anki **ruh hâli, enerji seviyesi, uyku kalitesi, kas yorgunluğu, ekipman durumu ve beslenme tercihleri** gibi günlük değişkenleri dikkate alarak, her gün için **kişiye özel** antrenman ve beslenme planı üreten akıllı bir mobil fitness asistanıdır.

Klasik fitness uygulamalarının aksine FitPulse, sabit ve genel-geçer planlar sunmaz. Bunun yerine, üretici yapay zekâ (**Google Gemini**) kullanarak her kullanıcı için **dinamik, bağlama duyarlı** planlar oluşturur. Buna ek olarak; vücut yağ oranı ve kalori hesaplayıcıları, nabız takibi, **AI destekli sesli meditasyon**, ruh hâli günlüğü, kamera ile malzeme tanıyan **"Akıllı Mutfak"** ve kas-bazlı antrenman **ısı haritası** gibi bütünleşik araçlar sunar.

Uygulama, **fiziksel sağlık** ile **zihinsel sağlığı** tek bir çatı altında birleştirerek bütünsel (holistik) bir refah deneyimi hedefler.

> Proje; modern mobil uygulama geliştirme, bulut tabanlı kimlik doğrulama/veri saklama ve üretici yapay zekâ entegrasyonu konularının uçtan uca uygulanmasını göstermek amacıyla bir bitirme/lisans projesi kapsamında geliştirilmiştir.

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

## ✨ Öne Çıkan Özellikler

### 🔐 Kimlik Doğrulama & Hesap Yönetimi
- **Firebase Authentication** ile e-posta/şifre tabanlı kayıt ve giriş
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
- Her tarif için kalori, protein ve malzeme bazında besin bilgisi; sonuçlar Firestore'a kaydedilir

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

### 😊 Ruh Hâli Takibi
- 5 dereceli ruh hâli + opsiyonel not ile günlük kayıt; haftalık dağılım grafiği ve geçmiş listesi

### 📈 Analitik & Kas Isı Haritası
- Antrenman geçmişini analiz ederek **hangi kasların ne kadar çalıştırıldığını** SVG ısı haritasında gösterir
- Gün / Hafta / Ay / Yıl zaman aralığı filtresi, "en çok çalışan kas" istatistiği

### 👤 Profil & Oyunlaştırma
- **XP & Seviye** sistemi (her tamamlanan planda +50 XP, kademeli seviye eğrisi)
- **Günlük seri (streak)** takibi ve otomatik sıfırlama mantığı
- Animasyonlu **bezier eğrili kilo grafiği**, son antrenmanlar ve nabız geçmişi

### 🌍 Diğer
- **6 dil** desteği (TR, EN, DE, ES, FR, ZH) — bulut senkronizasyonlu dil tercihi
- Tamamen **karanlık tema** ve özel animasyonlar (parçacıklar, shimmer, yıldız kenarlık, nabız efektleri)
- **Çevrimdışı yedek:** Aktif plan AsyncStorage'a da yazılır

## 📸 Ekran Görüntüleri

Girişten AI plan üretimine, kamerayla malzeme tanımadan kas ısı haritasına — **uygulamanın tüm akışı, 46 ekran görüntüsüyle**.

> 📖 **Her ekranın ne işe yaradığına ve nasıl işlediğine dair adım adım detaylı anlatımı → [FitPulse Görsel Rehber](docs/screenshots/) sayfasında bulabilirsiniz.**

<div align="center">

<h3>🔐 Giriş &amp; Ana Sayfa</h3>
<p><sub>Firebase kimlik doğrulama ile e-posta/şifre kayıt-giriş · Ana sayfada tek dokunuşla plan oluşturma ve hızlı erişim kartları</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/auth-01-login.png" width="195"/><br/><sub>Giriş</sub></td>
    <td align="center"><img src="docs/screenshots/auth-02-register.png" width="195"/><br/><sub>Kayıt</sub></td>
    <td align="center"><img src="docs/screenshots/home.png" width="195"/><br/><sub>Ana Sayfa</sub></td>
  </tr>
</table>

<h3>🤖 AI Plan Sihirbazı — 11 Adım</h3>
<p><sub>Ruh hâli, enerji, uyku ve kas yorgunluğu dahil 11 değişken toplanır; Google Gemini bu bağlama göre <b>o güne özel</b> antrenman &amp; beslenme planı üretir. (Anatomik SVG ikonlu, çoklu seçim destekli arayüz)</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/wizard-01-mood.png" width="150"/><br/><sub>1 · Ruh Hâli</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-02-goal.png" width="150"/><br/><sub>2 · Hedef</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-03-muscle.png" width="150"/><br/><sub>3 · Kas Grubu</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-04-duration.png" width="150"/><br/><sub>4 · Süre</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/wizard-05-level.png" width="150"/><br/><sub>5 · Seviye</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-06-environment.png" width="150"/><br/><sub>6 · Ortam</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-07-equipment.png" width="150"/><br/><sub>7 · Ekipman</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-08-recovery.png" width="150"/><br/><sub>8 · İyileşme</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/wizard-09-sleep.png" width="150"/><br/><sub>9 · Uyku</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-10-diet.png" width="150"/><br/><sub>10 · Diyet</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-11-cuisine.png" width="150"/><br/><sub>11 · Mutfak</sub></td>
  </tr>
</table>

<h3>📋 Kişisel Günlük Plan &amp; Adaptif Geri Bildirim</h3>
<p><sub>Üretilen plan öğün ve egzersizlerle listelenir; her hareket için video, her öğün için AI tarif. Plan bitince verilen geri bildirim (kolay/zor + sebep) <b>bir sonraki planın zorluğunu otomatik ayarlar</b>.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/plan-meals.png" width="175"/><br/><sub>Yemek Planı</sub></td>
    <td align="center"><img src="docs/screenshots/plan-workout.png" width="175"/><br/><sub>Antrenman Planı</sub></td>
    <td align="center"><img src="docs/screenshots/recipe-modal.png" width="175"/><br/><sub>Tarif Detayı</sub></td>
    <td align="center"><img src="docs/screenshots/feedback-modal.png" width="175"/><br/><sub>Geri Bildirim</sub></td>
    <td align="center"><img src="docs/screenshots/plan-empty-history.png" width="175"/><br/><sub>Plan Geçmişi</sub></td>
  </tr>
</table>

<h3>🍳 Akıllı Mutfak — Fotoğraftan Tarife (Multimodal AI)</h3>
<p><sub>Malzemelerin fotoğrafı Gemini Vision'a gönderilir; AI malzemeleri tanır ve <b>yalnızca o malzemelerle</b> 3 sağlıklı tarif üretir (malzeme başına kalori dahil). Yiyecek içermeyen görselleri de akıllıca reddeder.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/smart-kitchen-01-empty.png" width="175"/><br/><sub>1 · Fotoğraf / Galeri</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-02-warning.png" width="175"/><br/><sub>2 · Akıllı Koruma</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-03-result.png" width="175"/><br/><sub>3 · Malzeme Tanıma</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/smart-kitchen-04-recipes.png" width="175"/><br/><sub>4 · Tarif Önerileri</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-05-recipe-detail.png" width="175"/><br/><sub>5 · Tarif Detayı</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-06-recipe-steps.png" width="175"/><br/><sub>6 · Yapılış</sub></td>
  </tr>
</table>

<h3>📊 Vücut Yağ Oranı Hesaplayıcı</h3>
<p><sub>ABD Donanması (U.S. Navy) çevre ölçüm yöntemi — cinsiyet, boy, boyun ve bel ölçüleriyle tahmini yağ oranı ve kategori. Sonuç tek dokunuşla plan sihirbazına aktarılabilir.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/bodyfat-01-gender.png" width="150"/><br/><sub>1 · Cinsiyet</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-02-height.png" width="150"/><br/><sub>2 · Boy</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-03-neck.png" width="150"/><br/><sub>3 · Boyun</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-04-waist.png" width="150"/><br/><sub>4 · Bel</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-05-result.png" width="150"/><br/><sub>5 · Sonuç</sub></td>
  </tr>
</table>

<h3>🔥 Kalori &amp; Makro Hesaplayıcı</h3>
<p><sub>Mifflin-St Jeor BMR formülü + aktivite katsayısı ve hedefe (al/koru/ver) göre günlük kalori ve makro (protein/karb/yağ) hedefi. Bu hedef de doğrudan plan üretimine beslenebilir.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/calorie-01-gender.png" width="150"/><br/><sub>1 · Cinsiyet</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-02-age.png" width="150"/><br/><sub>2 · Yaş</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-03-height.png" width="150"/><br/><sub>3 · Boy</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-04-weight.png" width="150"/><br/><sub>4 · Kilo</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/calorie-05-activity.png" width="150"/><br/><sub>5 · Aktivite</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-06-goal.png" width="150"/><br/><sub>6 · Hedef</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-07-result.png" width="150"/><br/><sub>7 · Sonuç</sub></td>
  </tr>
</table>

<h3>🧘 Zihinsel Ritimler — AI Sesli Meditasyon</h3>
<p><sub>8 tema, kişiye özel Gemini meditasyon metni ve <b>ElevenLabs ile 8 doğal insan sesi</b> (önizlemeli), ayarlanabilir hız (0.75x–2x) ve arka plan ambiyansı.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/meditation-01-voices.png" width="195"/><br/><sub>Ses Seçimi (ElevenLabs)</sub></td>
    <td align="center"><img src="docs/screenshots/meditation-02-themes.png" width="195"/><br/><sub>Tema, Hız &amp; Ambiyans</sub></td>
  </tr>
</table>

<h3>📈 Analitik &amp; Takip · ⚙️ Profil &amp; Ayarlar</h3>
<p><sub>SVG kas ısı haritası, nabız takibi, ruh hâli günlüğü ve yıldız-yolculuk geçmişi · XP/Seviye ve kilo grafikli profil · 6 dilli ayarlar</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/analytics-heatmap.png" width="150"/><br/><sub>Kas Isı Haritası</sub></td>
    <td align="center"><img src="docs/screenshots/mood-01-entry.png" width="150"/><br/><sub>Mod Takibi</sub></td>
    <td align="center"><img src="docs/screenshots/mood-02-weekly.png" width="150"/><br/><sub>Haftalık Mod</sub></td>
    <td align="center"><img src="docs/screenshots/heart-rate.png" width="150"/><br/><sub>Nabız Monitörü</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/journey-history.png" width="150"/><br/><sub>Yolculuk / Geçmiş</sub></td>
    <td align="center"><img src="docs/screenshots/profile.png" width="150"/><br/><sub>Profil &amp; XP</sub></td>
    <td align="center"><img src="docs/screenshots/settings-languages.png" width="150"/><br/><sub>Ayarlar &amp; 6 Dil</sub></td>
  </tr>
</table>

</div>

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

- **Navigasyon:** Klasik stack yerine `react-native-tab-view` kullanılır. Hesaplayıcı/sihirbaz ekranları her girişte `key` artırılarak **remount** edilir (state sıfırlama).
- **`AppContext`** — Kullanıcı, aktif plan, geçmiş, seri, XP, kilo/yağ/kalori/nabız geçmişi gibi tüm uygulama durumunu tutar. `onAuthStateChanged` ile oturum açıldığında veriyi Firestore'dan yükler; her değişiklikte Firestore'a yazar ve AsyncStorage'a yedekler.
- **`LocalizationContext`** — Aktif dili yönetir; çevirileri `require()` ile yükler, `{değişken}` interpolasyonu destekler, tercihi AsyncStorage + Firestore'da saklar.
- **Servis katmanı** (`services/`) — Tüm dış AI çağrıları (Gemini, ElevenLabs) UI'dan soyutlanmıştır.

## 🧠 Yapay Zekâ Akışı (AI Pipeline)

**Gemini ile Plan Üretimi** (`src/services/geminiService.ts`)
1. **3 katmanlı prompt:** (1) Persona/rol tanımı → (2) kullanıcı cevaplarından üretilen koşullu talimatlar → (3) katı JSON şema zorlaması.
2. **`responseSchema` ile şema zorlaması** — model yalnızca tanımlı yapıda JSON döndürebilir; egzersiz adları uluslararası İngilizce standartta istenir (video araması için).
3. **Hata toleransı:** En fazla 3 deneme. `503/429/UNAVAILABLE/demand` gibi geçici hatalarda artan beklemeyle ve `gemini-2.5-flash` → `gemini-2.0-flash` **yedek modele** otomatik geçiş.
4. **Çok dillilik:** Tüm prompt parçaları aktif dilin çeviri dosyasından gelir; plan kullanıcının dilinde üretilir.

**Diğer AI Uçları:** `getRecipeDetails` (tarif + besin değeri), `generateMeditationScript` (yedek metinle dayanıklı), `generateRecipesFromImage` (multimodal görsel → malzeme tanıma & tarif).

**ElevenLabs TTS** (`src/services/elevenLabsService.ts`) — RN'de güvenilirlik için `fetch+blob` yerine **XMLHttpRequest + arraybuffer**; saf-JS Base64 dönüştürücü ile `expo-file-system` üzerinden cache'e `.mp3` yazımı; eski dosyalar her üretimde temizlenir; 60 sn zaman aşımı.

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

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js 18+**
- **Expo CLI** (`npx expo` ile kullanılabilir; global kurulum şart değil)
- Test için: **Expo Go** (fiziksel cihaz) veya **Android Studio / Xcode** (emülatör)
- Aktif bir **Firebase** projesi, **Google Gemini** API anahtarı ve **ElevenLabs** API anahtarı

### 1. Depoyu klonla
```bash
git clone https://github.com/<kullanici-adi>/FitPulse.git
cd FitPulse
```

### 2. Bağımlılıkları yükle
```bash
npm install
```

### 3. `.env` dosyasını oluştur
Proje kök dizinine bir `.env` dosyası ekle. Tüm anahtarlar `EXPO_PUBLIC_` ön ekiyle tanımlanır:

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

> Anahtarlar **kaynak koda gömülmez**; yalnızca `.env` üzerinden okunur ve `.env` `.gitignore` ile korunur.

### 4. (Önerilir) Bağımlılık uyumunu doğrula
```bash
npx expo install --check     # Expo SDK ile sürüm uyumunu hizalar
npx expo install expo-asset  # expo-audio'nun gerektirdiği bağımlılık
```

### 5. Uygulamayı başlat
```bash
npx expo start           # QR ile Expo Go
npx expo start --android # Android emülatör
npx expo start --ios     # iOS simülatör
```

## 📖 Kullanım Rehberi

1. **Kayıt ol / Giriş yap** — E-posta ve şifre ile hesap oluştur; oturum cihazda kalıcıdır.
2. **Ana Sayfa** — Büyük "nabız" butonu ana eyleme yönlendirir (plan yoksa oluştur, varsa devam et). Yağ oranı ve kalori hesaplayıcılarına hızlı erişim kartları burada.
3. **Plan Oluştur (Sihirbaz)** — 11 adımda tercihlerini seç; AI o güne özel antrenman + beslenme planı üretir.
4. **Aktif Plan** — Öğün ve egzersizleri tek tek işaretle (ilerleme çubuğu). Egzersiz için "Videoyu Oynat", öğün için "Tarifi Gör". Bitince **Tamamlandı** → başarı ekranı → **geri bildirim** (sonraki planı kalibre eder).
5. **Akıllı Mutfak** — Malzemelerinin fotoğrafını çek; AI tarif önerir.
6. **Hesaplayıcılar** — Vücut yağı (U.S. Navy) ve kalori/makro (Mifflin-St Jeor); sonucu doğrudan plana taşıyabilirsin.
7. **Zihinsel Ritimler** — Tema + ses + hız + ambiyans seç, AI sesli meditasyonu dinle.
8. **Nabız / Ruh Hâli / Analitik / Profil** — Verilerini kaydet, kas ısı haritası ve XP/seviye/kilo grafiğinde ilerlemeni gör.
9. **Ayarlar** — Profil, dil (6 dil), şifre değiştirme, çıkış.

## 📂 Proje Klasör Yapısı

```
FitPulse/
├── App.tsx                      # Kök bileşen, sağlayıcılar, TabView navigasyon
├── app.json                     # Expo yapılandırması (izinler, ikonlar, eklentiler)
├── firebase.json / .firebaserc  # Firebase proje yapılandırması
├── firestore.rules              # Firestore güvenlik kuralları
├── LICENSE                      # Tüm hakları saklı (proprietary) lisans
├── src/
│   ├── config/firebaseConfig.ts # Firebase başlatma (Auth + Firestore + Storage)
│   ├── context/                 # AppContext (global state) + LocalizationContext
│   ├── services/                # geminiService, elevenLabsService
│   ├── screens/                 # 14 ekran
│   ├── components/              # Yeniden kullanılabilir UI & SVG bileşenleri
│   ├── utils/                   # fitnessCalculations, muscleMapping, meditationStorage, theme
│   ├── locales/                 # tr, en, de, es, fr, zh
│   └── types/index.ts           # TypeScript tip tanımları
└── assets/                      # İkonlar, logo, splash görselleri
```

## 🌐 Çoklu Dil Desteği

6 dil tam olarak desteklenir: 🇹🇷 Türkçe · 🇬🇧 İngilizce · 🇩🇪 Almanca · 🇪🇸 İspanyolca · 🇫🇷 Fransızca · 🇨🇳 Çince

Dil tercihi hem yerel olarak (AsyncStorage) hem de buluta (Firestore `users/{uid}/settings.language`) kaydedilir; böylece cihazlar arası senkronizedir. AI tarafından üretilen tüm içerik (planlar, tarifler, meditasyonlar) da seçili dilde gelir.

## 🔒 Güvenlik Notları

- `.env` dosyası `.gitignore` içindedir; anahtarlar sürüm kontrolüne **gönderilmez**.
- Firestore erişimi `firestore.rules` ile kullanıcı bazında izole edilmiştir (`request.auth.uid == userId`).
- ⚠️ `EXPO_PUBLIC_*` değişkenleri Expo tarafından **istemci paketine gömülür**; yayınlanan bir derlemede erişilebilir hâle gelirler. Bu nedenle:
  - Firebase API anahtarını **uygulama kısıtlamaları** ve App Check ile sınırlandırın.
  - **ElevenLabs anahtarı ücretli bir gizdir** — üretimde doğrudan istemci yerine bir **arka uç (proxy) üzerinden** çağırmak önerilir.

## 📄 Lisans

**Tüm Hakları Saklıdır (Proprietary).** © 2026 Muhammet Emir Aydoğan.

Bu depo yalnızca **görüntüleme, eğitim amaçlı referans ve portföy değerlendirmesi** için kamuya açıktır. Yazar'ın önceden yazılı izni olmaksızın kodun kullanılması, kopyalanması, değiştirilmesi, dağıtılması veya türetilmesi **yasaktır**. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

## 📬 İletişim

**Muhammet Emir Aydoğan** — 📧 m.emr.aydogan@gmail.com

> _"Fit your pulse — bedenini ve zihnini her gün yeniden dinle."_

<div align="center"><a href="#fitpulse">⬆️ Başa dön</a></div>

---

<a name="-english"></a>

# 🇬🇧 English

> **Graduation Project** · Developed by: **Muhammet Emir Aydoğan**
> A full-featured health & fitness app for iOS / Android, built with React Native (Expo), powered by Google Gemini & ElevenLabs AI services and a Firebase cloud backend.

## 📑 Table of Contents

1. [About](#-about)
2. [What Problem Does It Solve?](#-what-problem-does-it-solve)
3. [Key Features](#-key-features)
4. [Screenshots](#-screenshots)
5. [Tech Stack](#-tech-stack)
6. [Architecture](#-architecture)
7. [AI Pipeline](#-ai-pipeline)
8. [Data Model (Firestore)](#-data-model-firestore)
9. [Setup & Run](#-setup--run)
10. [Usage Guide](#-usage-guide)
11. [Project Structure](#-project-structure)
12. [Internationalization](#-internationalization)
13. [Security Notes](#-security-notes)
14. [License](#-license)
15. [Contact](#-contact)

---

## 🎯 About

**FitPulse** is a smart mobile fitness assistant that generates a **personalized** daily workout and nutrition plan by taking into account the user's real-time daily variables — **mood, energy level, sleep quality, muscle soreness, available equipment, and dietary preferences**.

Unlike traditional fitness apps that serve fixed, one-size-fits-all plans, FitPulse uses generative AI (**Google Gemini**) to produce **dynamic, context-aware** plans for each user. On top of that, it bundles integrated tools such as body-fat & calorie calculators, heart-rate tracking, **AI-powered guided voice meditation**, a mood journal, a camera-based ingredient-recognizing **"Smart Kitchen"**, and a muscle-based training **heatmap**.

By uniting **physical health** and **mental wellness** under one roof, the app aims for a holistic well-being experience.

> The project was developed as a graduation/undergraduate project to demonstrate end-to-end implementation of modern mobile development, cloud-based authentication/data storage, and generative AI integration.

## 💡 What Problem Does It Solve?

| Problem | FitPulse's Solution |
|---|---|
| **"What workout should I do today?"** indecision | An AI plan **tailored to that day** based on mood, energy, sleep and fatigue |
| Generic plans not fitting personal state | A feedback loop makes plan difficulty **self-adjust** to the user |
| Difficulty tracking nutrition | Body-fat + calorie/macro calculators are **auto-integrated** into the plan |
| "What can I cook with what I have?" | **Smart Kitchen** — healthy recipe suggestions from a fridge photo via AI |
| Not knowing correct exercise form | One-tap **YouTube video** search for every movement |
| Workout + stress management in separate apps | **Voice meditation** and **mood tracking** in the same app |
| Losing sight of progress / motivation | **XP / Level**, **daily streak**, weight chart and a **muscle heatmap** |
| Losing data when switching devices | Cloud sync with **Firebase** — same data on every device |

## ✨ Key Features

### 🔐 Authentication & Account Management
- Email/password sign-up & sign-in via **Firebase Authentication**
- Session persistence (AsyncStorage) — you stay logged in across app restarts
- Profile editing, **email change**, and **password change** with re-authentication
- Lightweight Base64 **profile photo** (stored inside Firestore)

### 🤖 AI Workout & Nutrition Plan Wizard (11 steps)
- Step-by-step wizard: **mood, goal(s), muscle group, duration, level, environment, equipment, recovery status, sleep, diet and cuisine preference**
- Modern UI with multi-select support, animations, and anatomical SVG icons
- **Conditional context injection:** for tired/stressed/sleep-deprived/sore users, the AI automatically produces a lighter/recovery-focused plan
- **Schema-enforced JSON** output — prevents the AI from producing free text/hallucinations
- Meals and exercises in the generated plan can be checked off one by one (progress bar)

### 🔁 Smart Feedback Loop
- After completing a plan, provide **rating + reasons + free text** feedback ("too easy / too hard")
- This feedback automatically calibrates the **difficulty and volume** of the next plan (adaptive difficulty)
- The latest heart-rate data is also fed into the plan (intensity adjustment based on heart-rate rise)

### 🍳 Smart Kitchen (Multimodal Image Analysis)
- An **ingredient photo** from the camera or gallery is sent to Gemini Vision
- The AI recognizes the ingredients and generates 3 healthy, protein-focused recipes **using only those ingredients**
- Calorie, protein and per-ingredient nutrition info for each recipe; results saved to Firestore

### 🧘 Mental Rhythms (AI Voice Meditation)
- 8 themes (Stress, Focus, Sleep, Anxiety, Energy, Confidence, Gratitude, Inner Peace)
- **Personalized meditation script** generation with Gemini (based on name + past session count)
- 8 natural human voices (4 female + 4 male) via **ElevenLabs Text-to-Speech**, with voice preview
- Adjustable **playback speed** (0.75x–2x) and **ambient background sounds** (rain, birds, fire)
- Duration tracking, favorites, session stats and a daily streak
- **Demo resilience:** if the AI cannot generate a script, it automatically falls back to a ready-made text so the flow never breaks

### 📊 Health Calculators
- **Body Fat Percentage** — U.S. Navy circumference formula, with realistic range validation
- **Calories & Macros** — Mifflin-St Jeor BMR formula, activity factor and goal (lose/maintain/gain)
- Both can be pushed straight into the **plan wizard** as input with one tap

### ❤️ Heart Rate Monitor
- Daily measurement + pre/post-workout heart-rate logging
- BPM category (low/normal/high) visual feedback
- Heart-rate data feeds both history and AI plan generation

### 😊 Mood Tracker
- Daily entry with a 5-level mood + optional note; weekly distribution chart and history list

### 📈 Analytics & Muscle Heatmap
- Analyzes workout history to show **which muscles were trained and how much** on an SVG heatmap
- Day / Week / Month / Year time-range filter, "most active muscle" statistic

### 👤 Profile & Gamification
- **XP & Level** system (+50 XP per completed plan, progressive level curve)
- **Daily streak** tracking with automatic reset logic
- Animated **bezier weight chart**, recent workouts and heart-rate history

### 🌍 Other
- **6 languages** (TR, EN, DE, ES, FR, ZH) — cloud-synced language preference
- Fully **dark theme** with custom animations (particles, shimmer, star border, pulse effects)
- **Offline fallback:** the active plan is also written to AsyncStorage

## 📸 Screenshots

From sign-in to AI plan generation, camera-based ingredient recognition to the muscle heatmap — **the full app flow, in 46 screenshots**.

> 📖 **For a step-by-step, detailed explanation of what each screen does and how it works → see the [FitPulse Visual Guide](docs/screenshots/).**

<div align="center">

<h3>🔐 Auth &amp; Home</h3>
<p><sub>Email/password auth via Firebase · One-tap plan creation and quick-access cards on Home</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/auth-01-login.png" width="195"/><br/><sub>Sign in</sub></td>
    <td align="center"><img src="docs/screenshots/auth-02-register.png" width="195"/><br/><sub>Sign up</sub></td>
    <td align="center"><img src="docs/screenshots/home.png" width="195"/><br/><sub>Home</sub></td>
  </tr>
</table>

<h3>🤖 AI Plan Wizard — 11 Steps</h3>
<p><sub>Collects 11 variables incl. mood, energy, sleep &amp; soreness; Google Gemini returns a workout &amp; nutrition plan <b>tailored to that day</b>. (Multi-select UI with anatomical SVG icons)</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/wizard-01-mood.png" width="150"/><br/><sub>1 · Mood</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-02-goal.png" width="150"/><br/><sub>2 · Goal</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-03-muscle.png" width="150"/><br/><sub>3 · Muscle Group</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-04-duration.png" width="150"/><br/><sub>4 · Duration</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/wizard-05-level.png" width="150"/><br/><sub>5 · Level</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-06-environment.png" width="150"/><br/><sub>6 · Environment</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-07-equipment.png" width="150"/><br/><sub>7 · Equipment</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-08-recovery.png" width="150"/><br/><sub>8 · Recovery</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/wizard-09-sleep.png" width="150"/><br/><sub>9 · Sleep</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-10-diet.png" width="150"/><br/><sub>10 · Diet</sub></td>
    <td align="center"><img src="docs/screenshots/wizard-11-cuisine.png" width="150"/><br/><sub>11 · Cuisine</sub></td>
  </tr>
</table>

<h3>📋 Personalized Daily Plan &amp; Adaptive Feedback</h3>
<p><sub>Meals &amp; exercises listed and checkable; a video for each exercise, an AI recipe for each meal. Post-plan feedback (easy/hard + reason) <b>auto-tunes the next plan's difficulty</b>.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/plan-meals.png" width="175"/><br/><sub>Meal Plan</sub></td>
    <td align="center"><img src="docs/screenshots/plan-workout.png" width="175"/><br/><sub>Workout Plan</sub></td>
    <td align="center"><img src="docs/screenshots/recipe-modal.png" width="175"/><br/><sub>Recipe Detail</sub></td>
    <td align="center"><img src="docs/screenshots/feedback-modal.png" width="175"/><br/><sub>Feedback</sub></td>
    <td align="center"><img src="docs/screenshots/plan-empty-history.png" width="175"/><br/><sub>Plan History</sub></td>
  </tr>
</table>

<h3>🍳 Smart Kitchen — Photo to Recipe (Multimodal AI)</h3>
<p><sub>An ingredient photo goes to Gemini Vision; the AI recognizes items and creates 3 healthy recipes <b>using only those ingredients</b> (per-ingredient calories included). It also smartly rejects non-food images.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/smart-kitchen-01-empty.png" width="175"/><br/><sub>1 · Photo / Gallery</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-02-warning.png" width="175"/><br/><sub>2 · Smart Guard</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-03-result.png" width="175"/><br/><sub>3 · Ingredient Recognition</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/smart-kitchen-04-recipes.png" width="175"/><br/><sub>4 · Recipe Suggestions</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-05-recipe-detail.png" width="175"/><br/><sub>5 · Recipe Detail</sub></td>
    <td align="center"><img src="docs/screenshots/smart-kitchen-06-recipe-steps.png" width="175"/><br/><sub>6 · Steps</sub></td>
  </tr>
</table>

<h3>📊 Body Fat Calculator</h3>
<p><sub>U.S. Navy circumference method — gender, height, neck &amp; waist yield body-fat % and category. The result can be pushed straight into the plan wizard.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/bodyfat-01-gender.png" width="150"/><br/><sub>1 · Gender</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-02-height.png" width="150"/><br/><sub>2 · Height</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-03-neck.png" width="150"/><br/><sub>3 · Neck</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-04-waist.png" width="150"/><br/><sub>4 · Waist</sub></td>
    <td align="center"><img src="docs/screenshots/bodyfat-05-result.png" width="150"/><br/><sub>5 · Result</sub></td>
  </tr>
</table>

<h3>🔥 Calorie &amp; Macro Calculator</h3>
<p><sub>Mifflin-St Jeor BMR × activity factor, adjusted by goal (lose/maintain/gain) → daily calorie &amp; macro (protein/carb/fat) targets that also feed plan generation.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/calorie-01-gender.png" width="150"/><br/><sub>1 · Gender</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-02-age.png" width="150"/><br/><sub>2 · Age</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-03-height.png" width="150"/><br/><sub>3 · Height</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-04-weight.png" width="150"/><br/><sub>4 · Weight</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/calorie-05-activity.png" width="150"/><br/><sub>5 · Activity</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-06-goal.png" width="150"/><br/><sub>6 · Goal</sub></td>
    <td align="center"><img src="docs/screenshots/calorie-07-result.png" width="150"/><br/><sub>7 · Result</sub></td>
  </tr>
</table>

<h3>🧘 Mental Rhythms — AI Voice Meditation</h3>
<p><sub>8 themes, a personalized Gemini script, and <b>8 natural human voices via ElevenLabs</b> (with preview), adjustable speed (0.75x–2x) and ambient background.</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/meditation-01-voices.png" width="195"/><br/><sub>Voice Selection (ElevenLabs)</sub></td>
    <td align="center"><img src="docs/screenshots/meditation-02-themes.png" width="195"/><br/><sub>Theme, Speed &amp; Ambience</sub></td>
  </tr>
</table>

<h3>📈 Analytics &amp; Tracking · ⚙️ Profile &amp; Settings</h3>
<p><sub>SVG muscle heatmap, heart-rate logging, mood journal and a star-timeline journey · Profile with XP/Level &amp; weight chart · 6-language settings</sub></p>
<table>
  <tr>
    <td align="center"><img src="docs/screenshots/analytics-heatmap.png" width="150"/><br/><sub>Muscle Heatmap</sub></td>
    <td align="center"><img src="docs/screenshots/mood-01-entry.png" width="150"/><br/><sub>Mood Tracking</sub></td>
    <td align="center"><img src="docs/screenshots/mood-02-weekly.png" width="150"/><br/><sub>Weekly Mood</sub></td>
    <td align="center"><img src="docs/screenshots/heart-rate.png" width="150"/><br/><sub>Heart Rate</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/journey-history.png" width="150"/><br/><sub>Journey</sub></td>
    <td align="center"><img src="docs/screenshots/profile.png" width="150"/><br/><sub>Profile &amp; XP</sub></td>
    <td align="center"><img src="docs/screenshots/settings-languages.png" width="150"/><br/><sub>Settings &amp; 6 Languages</sub></td>
  </tr>
</table>

</div>

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework / SDK** | React Native `0.81` · Expo SDK `54` (New Architecture enabled) |
| **Language** | TypeScript `5.9` |
| **Navigation** | `react-native-tab-view` + `react-native-pager-view` (swipeable tabs) |
| **State Management** | React Context API (`AppContext`, `LocalizationContext`) |
| **Auth & Data** | Firebase Authentication · Cloud Firestore |
| **Local Storage** | `@react-native-async-storage/async-storage` |
| **Generative AI** | Google Gemini (`@google/genai`) — `gemini-2.5-flash` (fallback: `gemini-2.0-flash`) |
| **Text-to-Speech** | ElevenLabs API (`eleven_turbo_v2_5`) |
| **Camera / Image** | `expo-image-picker` |
| **Audio Playback** | `expo-audio` |
| **Charts / SVG** | `react-native-svg` |
| **Video** | `react-native-webview` (embedded YouTube search) |
| **UI** | `expo-linear-gradient`, `expo-blur`, `@expo/vector-icons` |

## 🏗 Architecture

The app follows a **provider-based** architecture managed from a single root component (`App.tsx`):

```
SafeAreaProvider
└── LocalizationProvider        → language & translation (t function)
    └── AppProvider             → global state + Firebase sync
        └── MainApp
            ├── AuthScreen      (when logged out)
            └── TabView         (when logged in — 13 screens, swipeable)
                ├── AppHeader            (top bar + streak indicator)
                ├── renderScene()        (active screen)
                └── BottomNavigation     (horizontally scrollable bottom menu)
```

- **Navigation:** Uses `react-native-tab-view` instead of a classic stack. Calculator/wizard screens are **remounted** on each entry by incrementing a `key` (state reset).
- **`AppContext`** — Holds all app state (user, active plan, history, streak, XP, weight/body-fat/calorie/heart-rate history). Loads data from Firestore on login via `onAuthStateChanged`; writes to Firestore on every change and backs up to AsyncStorage.
- **`LocalizationContext`** — Manages the active language; loads translations via `require()`, supports `{variable}` interpolation, and stores the preference in AsyncStorage + Firestore.
- **Service layer** (`services/`) — All external AI calls (Gemini, ElevenLabs) are abstracted away from the UI.

## 🧠 AI Pipeline

**Plan generation with Gemini** (`src/services/geminiService.ts`)
1. **3-layer prompt:** (1) persona/role definition → (2) conditional instructions built from the user's answers → (3) strict JSON schema enforcement.
2. **Schema enforcement via `responseSchema`** — the model can only return JSON in the defined shape; exercise names are requested in standard international English (for video search).
3. **Fault tolerance:** up to 3 attempts. On transient errors (`503/429/UNAVAILABLE/demand`), it backs off with increasing delays and automatically switches from `gemini-2.5-flash` to the **fallback model** `gemini-2.0-flash`.
4. **Multilingual:** all prompt fragments come from the active language's translation file; the plan is produced in the user's language.

**Other AI endpoints:** `getRecipeDetails` (recipe + nutrition), `generateMeditationScript` (resilient with a fallback text), `generateRecipesFromImage` (multimodal image → ingredient recognition & recipes).

**ElevenLabs TTS** (`src/services/elevenLabsService.ts`) — For reliability on RN it uses **XMLHttpRequest + arraybuffer** instead of `fetch+blob`; writes the audio to cache as `.mp3` via a pure-JS Base64 converter over `expo-file-system`; old files are cleaned on each generation; 60s timeout.

## 🗄 Data Model (Firestore)

```
users/{uid}                         → profile, xp, level, streak, settings.language
  ├── weightHistory/{id}            → weight logs
  ├── workoutHistory/{id}           → completed workout history
  ├── bodyFatHistory/{id}           → body-fat measurements
  └── calorieHistory/{id}           → calorie/macro calculations
activePlans/{uid}                   → current active plan + completion status
heartRateLogs/{uid}/logs/{id}       → heart-rate logs (daily/pre/post)
moodEntries/{uid}/entries/{id}      → mood journal
meditation/{uid}/logs|favorites     → meditation sessions and favorites
smartKitchen/{uid}/history/{id}     → Smart Kitchen analysis history
```

> All collections are protected by `firestore.rules`: a user can only read/write documents belonging to **their own `uid`**.

## 🚀 Setup & Run

### Requirements
- **Node.js 18+**
- **Expo CLI** (usable via `npx expo`; global install not required)
- For testing: **Expo Go** (physical device) or **Android Studio / Xcode** (emulator)
- An active **Firebase** project, a **Google Gemini** API key, and an **ElevenLabs** API key

### 1. Clone the repository
```bash
git clone https://github.com/<username>/FitPulse.git
cd FitPulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create the `.env` file
Add a `.env` file to the project root. All keys use the `EXPO_PUBLIC_` prefix:

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# AI Services
EXPO_PUBLIC_GEMINI_API_KEY=...        # https://aistudio.google.com/app/apikey
EXPO_PUBLIC_ELEVENLABS_API_KEY=...    # https://elevenlabs.io
```

> Keys are **never hardcoded** into the source; they are read only from `.env`, which is protected by `.gitignore`.

### 4. (Recommended) Verify dependency compatibility
```bash
npx expo install --check     # aligns versions with the Expo SDK
npx expo install expo-asset  # dependency required by expo-audio
```

### 5. Start the app
```bash
npx expo start           # QR with Expo Go
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator
```

## 📖 Usage Guide

1. **Sign up / Sign in** — Create an account with email & password; the session persists on the device.
2. **Home** — A large "pulse" button drives the main action (create a plan if none, continue if one exists). Quick-access cards for the body-fat and calorie calculators live here.
3. **Create a Plan (Wizard)** — Choose your preferences across 11 steps; the AI generates a workout + nutrition plan tailored to that day.
4. **Active Plan** — Check off meals and exercises one by one (progress bar). "Play Video" for exercises, "View Recipe" for meals. When done, **Mark Completed** → success screen → **feedback** (calibrates the next plan).
5. **Smart Kitchen** — Snap a photo of your ingredients; the AI suggests recipes.
6. **Calculators** — Body fat (U.S. Navy) and calories/macros (Mifflin-St Jeor); push the result straight into a plan.
7. **Mental Rhythms** — Pick theme + voice + speed + ambience and listen to an AI voice meditation.
8. **Heart Rate / Mood / Analytics / Profile** — Log your data and watch progress on the muscle heatmap and the XP/level/weight chart.
9. **Settings** — Profile, language (6 languages), password change, logout.

## 📂 Project Structure

```
FitPulse/
├── App.tsx                      # Root component, providers, TabView navigation
├── app.json                     # Expo config (permissions, icons, plugins)
├── firebase.json / .firebaserc  # Firebase project config
├── firestore.rules              # Firestore security rules
├── LICENSE                      # Proprietary (All Rights Reserved) license
├── src/
│   ├── config/firebaseConfig.ts # Firebase init (Auth + Firestore + Storage)
│   ├── context/                 # AppContext (global state) + LocalizationContext
│   ├── services/                # geminiService, elevenLabsService
│   ├── screens/                 # 14 screens
│   ├── components/              # Reusable UI & SVG components
│   ├── utils/                   # fitnessCalculations, muscleMapping, meditationStorage, theme
│   ├── locales/                 # tr, en, de, es, fr, zh
│   └── types/index.ts           # TypeScript type definitions
└── assets/                      # Icons, logo, splash images
```

## 🌐 Internationalization

6 languages are fully supported: 🇹🇷 Turkish · 🇬🇧 English · 🇩🇪 German · 🇪🇸 Spanish · 🇫🇷 French · 🇨🇳 Chinese

The language preference is saved both locally (AsyncStorage) and to the cloud (Firestore `users/{uid}/settings.language`), so it stays in sync across devices. All AI-generated content (plans, recipes, meditations) is produced in the selected language.

## 🔒 Security Notes

- The `.env` file is in `.gitignore`; keys are **never** committed to version control.
- Firestore access is isolated per user via `firestore.rules` (`request.auth.uid == userId`).
- ⚠️ `EXPO_PUBLIC_*` variables are **bundled into the client** by Expo; they become accessible in a published build. Therefore:
  - Restrict the Firebase API key with **application restrictions** and App Check.
  - **The ElevenLabs key is a paid secret** — in production, call it through a **backend (proxy)** rather than directly from the client.

## 📄 License

**All Rights Reserved (Proprietary).** © 2026 Muhammet Emir Aydoğan.

This repository is made public **only for viewing, educational reference, and portfolio evaluation**. Using, copying, modifying, distributing, or creating derivatives of the code **without the Author's prior written permission is prohibited**. See the [LICENSE](LICENSE) file for details.

## 📬 Contact

**Muhammet Emir Aydoğan** — 📧 m.emr.aydogan@gmail.com

> _"Fit your pulse — listen to your body and mind anew, every day."_

<div align="center"><a href="#fitpulse">⬆️ Back to top</a></div>
