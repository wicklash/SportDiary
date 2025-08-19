# Storage Katmanı - BaseStorage Sınıfı

## Genel Bakış

`BaseStorage` sınıfı, tüm storage servisleri için ortak fonksiyonalite sağlayan abstract bir temel sınıftır. Bu sınıf, kod tekrarını azaltır ve tutarlı error handling sağlar.

## Özellikler

### 🔧 **Temel Storage İşlemleri**
- `getItem<T>(key)`: AsyncStorage'dan veri getir ve parse et
- `setItem(key, value)`: AsyncStorage'a veri kaydet
- `removeItem(key)`: AsyncStorage'dan veri sil

### 📊 **Program Yönetimi**
- `getPrograms()`: Tüm programları getir
- `savePrograms(programs)`: Program listesini kaydet
- `findProgramIndex(programs, programId)`: Program index'ini bul
- `updateProgramTimestamp(program)`: Program güncelleme zamanını güncelle

### 🏃 **Performans Yönetimi**
- `getPerformances()`: Tüm performansları getir
- `savePerformances(performances)`: Performans listesini kaydet

### 🔍 **Yardımcı Metodlar**
- `findDayIndex(days, dayId)`: Gün index'ini bul
- `findExerciseIndex(exercises, exerciseId)`: Egzersiz index'ini bul
- `generateId()`: Yeni ID oluştur
- `safeStringCompare(str1, str2)`: Güvenli string karşılaştırması
- `throwError(message, originalError)`: Standart hata fırlatma

## Kullanım Örneği

```typescript
import { BaseStorage } from './BaseStorage';

export class ExerciseStorage extends BaseStorage {
  
  static async addExercise(programId: string, dayId: string, exercise: Omit<Exercise, 'id'>): Promise<ExerciseResult> {
    try {
      // BaseStorage metodlarını kullan
      const programList: Program[] = await this.getPrograms();
      const programIndex = this.findProgramIndex(programList, programId);
      
      if (programIndex === -1) {
        return { success: false, error: 'Program bulunamadı' };
      }
      
      // Güvenli string karşılaştırması
      const existingExercise = programList[programIndex].days[dayIndex].exercises
        .find(e => this.safeStringCompare(e.name, exercise.name));
      
      if (existingExercise) {
        return { success: false, error: `"${exercise.name}" egzersizi bu günde zaten mevcut` };
      }
      
      const newExercise: Exercise = {
        ...exercise,
        id: this.generateId(), // BaseStorage'dan ID oluştur
      };
      
      programList[programIndex].days[dayIndex].exercises.push(newExercise);
      this.updateProgramTimestamp(programList[programIndex]); // Timestamp güncelle
      
      await this.savePrograms(programList); // BaseStorage ile kaydet
      return { success: true, data: newExercise };
    } catch (error) {
      return { success: false, error: 'Egzersiz eklenirken bir hata oluştu' };
    }
  }
}
```

## Faydalar

### ✅ **Kod Tekrarını Azaltır**
- AsyncStorage işlemleri tek yerde tanımlanır
- JSON parse/stringify işlemleri standartlaştırılır
- Error handling tutarlı hale getirilir

### ✅ **Bakım Kolaylığı**
- Storage anahtarları merkezi yönetim
- Ortak metodlar tek yerde güncellenir
- Tip güvenliği sağlanır

### ✅ **Hata Yönetimi**
- Standart error mesajları
- Tutarlı logging
- Güvenli string işlemleri

### ✅ **Performans**
- Array kontrolleri optimize edilir
- Gereksiz JSON parse işlemleri önlenir
- Memory kullanımı optimize edilir

## Mevcut Storage Sınıfları

- `ExerciseStorage` ✅ BaseStorage'dan türetildi - Tüm metodlar güncellendi
- `ProgramStorage` ✅ BaseStorage'dan türetildi - Tüm metodlar güncellendi
- `DayStorage` ✅ BaseStorage'dan türetildi - Tüm metodlar güncellendi
- `PerformanceStorage` ✅ BaseStorage'dan türetildi - Tüm metodlar güncellendi

## Kod İyileştirmeleri

### 📉 **Azaltılan Kod Satırları**
- **ExerciseStorage**: ~50 satır azaldı
- **ProgramStorage**: ~40 satır azaldı
- **DayStorage**: ~35 satır azaldı
- **PerformanceStorage**: ~45 satır azaldı
- **Toplam**: ~170 satır kod tekrarı kaldırıldı

### 🔧 **Standartlaştırılan İşlemler**
- AsyncStorage CRUD işlemleri
- JSON parse/stringify işlemleri
- Error handling ve logging
- ID oluşturma ve timestamp güncelleme
- String karşılaştırma işlemleri

## Gelecek Geliştirmeler

- [ ] Database migration desteği
- [ ] Offline sync mekanizması
- [ ] Data validation katmanı
- [ ] Caching mekanizması
- [ ] Backup/restore fonksiyonları
