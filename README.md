# SportDiary 📱💪

**Spor ve fitness antrenmanlarınızı takip etmek için geliştirilmiş modern mobil uygulama.**

## 🎯 Proje Hakkında

SportDiary, React Native ve Expo kullanılarak geliştirilmiş, kullanıcıların antrenman programlarını oluşturmasına, egzersizlerini takip etmesine ve performans geçmişini izlemesine olanak sağlayan kapsamlı bir fitness takip uygulamasıdır.

## ✨ Özellikler

### 🏋️ **Antrenman Yönetimi**
- Antrenman programları oluşturma ve düzenleme
- Günlük antrenman planları
- Egzersiz ekleme ve kategorilendirme
- Set ve tekrar sayısı takibi

### 📊 **Performans İzleme**
- Detaylı performans geçmişi
- Ağırlık ve tekrar sayısı kayıtları
- İlerleme grafikleri ve istatistikler
- Notlar ve yorumlar ekleme

### 🎨 **Modern Kullanıcı Arayüzü**
- Koyu tema desteği
- Responsive tasarım
- Intuitive navigation
- Custom alert sistemi

### 💾 **Veri Yönetimi**
- Local storage ile veri saklama
- Offline çalışma desteği
- Veri yedekleme ve geri yükleme

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- Android Studio (Android geliştirme için)
- Xcode (iOS geliştirme için, sadece macOS)

### Adım Adım Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone https://github.com/wicklash/SportDiary.git
   cd SportDiary
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Uygulamayı başlatın**
   ```bash
   npx expo start
   ```

4. **Geliştirme seçenekleri:**
   - **Android Emulator:** `a` tuşuna basın
   - **iOS Simulator:** `i` tuşuna basın (sadece macOS)
   - **Expo Go:** QR kodu telefonunuzla tarayın
   - **Web:** `w` tuşuna basın

## 📁 Proje Yapısı

```
SportDiary/
├── app/                          # Ana uygulama dosyaları
│   ├── (tabs)/                  # Tab navigation
│   │   ├── programs.tsx         # Programlar sayfası
│   │   ├── progress.tsx         # İlerleme sayfası
│   │   └── settings.tsx         # Ayarlar sayfası
│   ├── components/              # Yeniden kullanılabilir bileşenler
│   │   ├── ui/                  # UI bileşenleri
│   │   └── ErrorBanner.tsx      # Hata gösterimi
│   ├── details/                 # Detay sayfaları
│   │   ├── day/                 # Gün detayları
│   │   ├── exercise/            # Egzersiz detayları
│   │   └── program/             # Program detayları
│   ├── services/                # Veri servisleri
│   │   └── storage/             # Storage işlemleri
│   ├── hooks/                   # Custom React hooks
│   ├── theme/                   # Tema ve stil tanımları
│   ├── types/                   # TypeScript tip tanımları
│   └── utils/                   # Yardımcı fonksiyonlar
├── assets/                      # Resimler, fontlar ve diğer kaynaklar
└── scripts/                     # Yardımcı scriptler
```

## 🛠️ Geliştirme

### Kullanılan Teknolojiler
- **React Native** - Mobil uygulama framework'ü
- **Expo** - Geliştirme platformu
- **TypeScript** - Tip güvenliği
- **Expo Router** - File-based routing
- **AsyncStorage** - Local veri saklama

### Kod Kalitesi
```bash
# Lint kontrolü
npm run lint

# TypeScript tip kontrolü
npx tsc --noEmit

# Proje sıfırlama (dikkatli kullanın!)
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:





**SportDiary ile antrenmanlarınızı profesyonelce takip edin! 💪✨**
