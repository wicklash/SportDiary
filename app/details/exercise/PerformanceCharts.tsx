import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import useChartData from '../../hooks/useChartData';
import { theme } from '../../theme/theme';
import { Performance } from '../../types';
import ChartComponents from './ChartComponents';
const { ChartCard, DateLegend, FullScreenChartModal, StatsSummary } = ChartComponents;

interface PerformanceChartsProps {
  performanceHistory: Performance[];
}

const { width: screenWidth } = Dimensions.get('window');

// Sabit mesafe değerleri
const SPACING = {
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 24,
};

export default function PerformanceCharts({ performanceHistory }: PerformanceChartsProps) {
  const [selectedChart, setSelectedChart] = useState<{
    type: 'weight' | 'reps' | 'sets';
    data: any[];
    title: string;
    color: string;
  } | null>(null);

  // Hook ile grafik verilerini al
  const chartData = useChartData(performanceHistory);

  if (!chartData || performanceHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz performans verisi yok</Text>
        <Text style={styles.emptySubtext}>İlk antrenmanınızı tamamladıktan sonra grafikler burada görünecek</Text>
      </View>
    );
  }

  // Grafik boyutları
  const chartWidth = Math.min(screenWidth - 60, 350);
  const chartHeight = 140;

  const handleChartPress = (type: 'weight' | 'reps' | 'sets') => {
    let chartInfo;
    switch (type) {
      case 'weight':
        chartInfo = {
          type,
          data: chartData.weightData,
          title: '🏋️ Maksimum Ağırlık (kg)',
          color: theme.colors.primary
        };
        break;
      case 'reps':
        chartInfo = {
          type,
          data: chartData.repsData,
          title: '🔄 Toplam Tekrar Sayısı',
          color: theme.colors.secondary
        };
        break;
      case 'sets':
        chartInfo = {
          type,
          data: chartData.setsData,
          title: '✅ Tamamlanan Set Sayısı',
          color: theme.colors.success
        };
        break;
    }
    setSelectedChart(chartInfo);
  };

  return (
    <View style={styles.container}>
      {/* Tarih Açıklaması */}
      <DateLegend recentPerformances={chartData.recentPerformances} />
      
      {/* Grafik Kartları - Sıralı kaydırma */}
      <View style={[styles.chartsScrollContainer, { marginTop: SPACING.s }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          snapToInterval={screenWidth - 28}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Ağırlık Grafiği - Sadece ağırlık verisi varsa göster */}
          {chartData.weightData.some(item => item.value > 0) && (
            <ChartCard
              type="weight"
              data={chartData.weightData}
              title="Maksimum Ağırlık (kg)"
              color={theme.colors.primary}
              onPress={() => handleChartPress('weight')}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          )}

          {/* Tekrar Sayısı Grafiği */}
          <ChartCard
            type="reps"
            data={chartData.repsData}
            title="Toplam Tekrar Sayısı"
            color={theme.colors.secondary}
            onPress={() => handleChartPress('reps')}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
          />

          {/* Set Sayısı Grafiği */}
          <ChartCard
            type="sets"
            data={chartData.setsData}
            title="Tamamlanan Set Sayısı"
            color={theme.colors.success}
            onPress={() => handleChartPress('sets')}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
          />
        </ScrollView>
      </View>

      {/* İstatistik Özeti */}
      <StatsSummary chartData={chartData} />

      {/* Tam Ekran Grafik Modal */}
      <FullScreenChartModal
        selectedChart={selectedChart}
        onClose={() => setSelectedChart(null)}
        chartData={chartData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  chartsScrollContainer: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingRight: 0,
    paddingLeft: 0,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 18,
  },
});
