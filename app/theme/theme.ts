// Ana tema dosyası
export const theme = {
  colors: {
    // Ana renkler - Okyanus & Mavi Paleti
    primary: "#0984e3",        // Okyanus Mavisi
    primaryOn: "#FFFFFF",      // Beyaz metin
    secondary: "#00b894",      // Deniz Yeşili
    
    // Yüzey renkleri
    background: "#0a1628",     // Koyu Deniz Mavisi
    surface: "#1e2f42", 
    card: "#1e2f42",
    
    // Metin renkleri
    text: "#FFFFFF",           // Ana metin
    subtext: "#a0b4c7",        // Mavi tonunda gri
    
    // Durum renkleri
    success: "#00cec9",        // Turkuaz
    danger: "#e17055",         // Mercan
    warning: "#fdcb6e",        // Altın Sarısı
    
    // Kenar renkleri
    border: "#2d3748",         // Mavi tonunda koyu gri
    tabBar: "#1e2f42",         // Surface ile aynı
  },
  
  // Yarıçaplar
  radius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
  },
  
  // Boşluklar
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
  },
  
  // Gölgeler
  shadows: {
    card: {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    button: {
      shadowColor: "#000000", 
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
  },
  
  // Marka gradyanı - Okyanus teması
  brandGradient: ["#0984e3", "#00b894"] as const,
  
  // Tipografi
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "bold" as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: "bold" as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 16,
    },
  },
};

// Tip tanımları
export type Theme = typeof theme;
export type ThemeColors = keyof Theme['colors'];
export type ThemeRadius = keyof Theme['radius'];
export type ThemeSpacing = keyof Theme['spacing'];
