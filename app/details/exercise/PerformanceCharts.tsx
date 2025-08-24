import { useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { theme } from '../../theme/theme';
import { Performance } from '../../types';

interface PerformanceChartsProps {
  performanceHistory: Performance[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function PerformanceCharts({ performanceHistory }: PerformanceChartsProps) {
  const [selectedChart, setSelectedChart] = useState<{
    type: 'weight' | 'reps' | 'sets';
    data: any[];
    title: string;
    color: string;
  } | null>(null);

  // Grafik verilerini hazırla
  const chartData = useMemo(() => {
    if (performanceHistory.length === 0) return null;

    // Tüm performansları al (5 adet sınırını kaldır)
    const recentPerformances = performanceHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reverse(); // En eski antrenmandan en yeniye sırala

    // Ağırlık grafiği için veri - X ekseni etiketlerini daha net yap
    const weightData = recentPerformances.map((perf, index) => {
      const maxWeight = Math.max(...perf.sets.map(set => set.weight || 0));
      return {
        value: maxWeight,
        label: `${index + 1}`, // Sadece sayı, # işareti olmadan
        dataPointText: maxWeight > 0 ? maxWeight.toString() : undefined,
        // Ek bilgi olarak tarihi sakla
        date: new Date(perf.date).toLocaleDateString('tr-TR', { 
          month: 'short', 
          day: 'numeric' 
        }),
      };
    });

    // Tekrar sayısı grafiği için veri
    const repsData = recentPerformances.map((perf, index) => {
      const totalReps = perf.sets.reduce((sum, set) => sum + set.reps, 0);
      return {
        value: totalReps,
        label: `${index + 1}`, // Sadece sayı
        dataPointText: totalReps.toString(),
        date: new Date(perf.date).toLocaleDateString('tr-TR', { 
          month: 'short', 
          day: 'numeric' 
        }),
      };
    });

    // Set sayısı grafiği için veri
    const setsData = recentPerformances.map((perf, index) => {
      const completedSets = perf.sets.filter(set => set.completed).length;
      return {
        value: completedSets,
        label: `${index + 1}`, // Sadece sayı
        dataPointText: completedSets.toString(),
        date: new Date(perf.date).toLocaleDateString('tr-TR', { 
          month: 'short', 
          day: 'numeric' 
        }),
      };
    });

    return { weightData, repsData, setsData, recentPerformances };
  }, [performanceHistory]);

  if (!chartData || performanceHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz performans verisi yok</Text>
        <Text style={styles.emptySubtext}>İlk antrenmanınızı tamamladıktan sonra grafikler burada görünecek</Text>
      </View>
    );
  }

  // Grafik genişliğini ekran boyutuna göre ayarla - kartlar arasında kaydırma için
  const chartWidth = Math.min(screenWidth - 64, 240); // Daha küçük boyut
  const chartHeight = 100; // Daha küçük yükseklik

  // Tam ekran grafik boyutları
  const fullScreenChartWidth = Math.max(screenWidth - 32, (selectedChart?.data?.length || 0) * 100); // Her antrenman için 100px
  const fullScreenChartHeight = 300;

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

  const renderChart = (type: 'weight' | 'reps' | 'sets', data: any[], title: string, color: string, isFullScreen = false) => {
    const width = isFullScreen ? fullScreenChartWidth : chartWidth;
    const height = isFullScreen ? fullScreenChartHeight : chartHeight;

    if (type === 'weight') {
      return (
        <LineChart
          data={data}
          width={width}
          height={height}
          color={color}
          thickness={isFullScreen ? 3 : 2}
          startFillColor={color}
          endFillColor={color}
          startOpacity={0.2}
          endOpacity={0.05}
          initialSpacing={isFullScreen ? 12 : 6}
          endSpacing={isFullScreen ? 12 : 6}
          spacing={isFullScreen ? 30 : 15}
          backgroundColor="transparent"
          rulesColor={theme.colors.border}
          rulesType="solid"
          yAxisColor={theme.colors.border}
          xAxisColor={theme.colors.border}
          yAxisTextStyle={[styles.axisText, isFullScreen && styles.fullScreenAxisText]}
          xAxisLabelTextStyle={[styles.axisText, styles.xAxisText, isFullScreen && styles.fullScreenAxisText]}
          dataPointsColor={color}
          dataPointsRadius={isFullScreen ? 4 : 2}
          curved
          showVerticalLines={false}
          hideAxesAndRules={false}
          hideRules={false}
          hideOrigin={false}
        />
      );
    } else {
      return (
        <BarChart
          data={data}
          width={width}
          height={height}
          barWidth={isFullScreen ? 20 : 8}
          spacing={isFullScreen ? Math.max(15, 800 / Math.max(data.length, 1)) : 10}
          initialSpacing={isFullScreen ? 12 : 6}
          endSpacing={isFullScreen ? 12 : 6}
          barBorderRadius={isFullScreen ? 4 : 2}
          frontColor={color}
          backgroundColor="transparent"
          rulesColor={theme.colors.border}
          rulesType="solid"
          yAxisColor={theme.colors.border}
          xAxisColor={theme.colors.border}
          yAxisTextStyle={[styles.axisText, isFullScreen && styles.fullScreenAxisText]}
          xAxisLabelTextStyle={[styles.axisText, styles.xAxisText, isFullScreen && styles.fullScreenAxisText]}
          showVerticalLines={false}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Performans Grafikleri</Text>
      
      {/* Tarih Açıklaması - Daha kompakt */}
      <View style={styles.dateLegend}>
        <Text style={styles.dateLegendTitle}>📅 Antrenman Sırası:</Text>
        <Text style={styles.dateLegendSubtitle}>Sağa kaydırarak tüm antrenmanları görün</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.dateLegendScroll}
        >
          {chartData.recentPerformances.map((perf, index) => (
            <View key={index} style={styles.dateLegendItem}>
              <Text style={styles.dateLegendNumber}>{index + 1}</Text>
              <Text style={styles.dateLegendDate}>
                {new Date(perf.date).toLocaleDateString('tr-TR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Grafik Kartları - Aralarında kaydırma */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ağırlık Grafiği - Sadece ağırlık verisi varsa göster */}
        {chartData.weightData.some(item => item.value > 0) && (
          <TouchableOpacity 
            style={styles.chartContainer}
            onPress={() => handleChartPress('weight')}
            activeOpacity={0.8}
          >
            <Text style={styles.chartTitle}>🏋️ Maksimum Ağırlık (kg)</Text>
            <View style={styles.chartWrapper} pointerEvents="none">
              {renderChart('weight', chartData.weightData, 'Maksimum Ağırlık', theme.colors.primary)}
            </View>
            <Text style={styles.tapHint}>📱 Detay için dokun</Text>
          </TouchableOpacity>
        )}

        {/* Tekrar Sayısı Grafiği */}
        <TouchableOpacity 
          style={styles.chartContainer}
          onPress={() => handleChartPress('reps')}
          activeOpacity={0.8}
        >
          <Text style={styles.chartTitle}>🔄 Toplam Tekrar Sayısı</Text>
          <View style={styles.chartWrapper} pointerEvents="none">
            {renderChart('reps', chartData.repsData, 'Toplam Tekrar Sayısı', theme.colors.secondary)}
          </View>
          <Text style={styles.tapHint}>📱 Detay için dokun</Text>
        </TouchableOpacity>

        {/* Set Sayısı Grafiği */}
        <TouchableOpacity 
          style={styles.chartContainer}
          onPress={() => handleChartPress('sets')}
          activeOpacity={0.8}
        >
          <Text style={styles.chartTitle}>✅ Tamamlanan Set Sayısı</Text>
          <View style={styles.chartWrapper} pointerEvents="none">
            {renderChart('sets', chartData.setsData, 'Tamamlanan Set Sayısı', theme.colors.success)}
          </View>
          <Text style={styles.tapHint}>📱 Detay için dokun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* İstatistik Özeti */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📈 Özet İstatistikler</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.max(...chartData.weightData.map(item => item.value))}
            </Text>
            <Text style={styles.statLabel}>Max Ağırlık</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.max(...chartData.repsData.map(item => item.value))}
            </Text>
            <Text style={styles.statLabel}>Max Tekrar</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {chartData.setsData.length}
            </Text>
            <Text style={styles.statLabel}>Antrenman</Text>
          </View>
        </View>
      </View>

      {/* Tam Ekran Grafik Modal */}
      <Modal
        visible={selectedChart !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedChart(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedChart?.title}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedChart(null)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.fullScreenChartWrapper}>
                {selectedChart && renderChart(
                  selectedChart.type, 
                  selectedChart.data, 
                  selectedChart.title, 
                  selectedChart.color, 
                  true
                )}
              </View>
            </ScrollView>

            {/* Tam ekran tarih açıklaması */}
            <View style={styles.modalDateLegend}>
              <Text style={styles.modalDateLegendTitle}>📅 Antrenman Sırası:</Text>
              <Text style={styles.modalDateLegendSubtitle}>Sağa kaydırarak tüm antrenmanları görün</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.modalDateLegendScroll}
              >
                {chartData.recentPerformances.map((perf, index) => (
                  <View key={index} style={styles.modalDateLegendItem}>
                    <Text style={styles.modalDateLegendNumber}>{index + 1}</Text>
                    <Text style={styles.modalDateLegendDate}>
                      {new Date(perf.date).toLocaleDateString('tr-TR', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  // Tarih açıklaması stilleri
  dateLegend: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16, // Daha fazla padding
    marginBottom: 12,
  },
  dateLegendTitle: {
    fontSize: 13, // Daha küçük font
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8, // Daha az margin
    textAlign: 'center',
  },
  dateLegendSubtitle: {
    fontSize: 10,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: 8,
  },
  dateLegendScroll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16, // Daha fazla padding
  },
  dateLegendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  dateLegendItem: {
    alignItems: 'center',
    marginHorizontal: 6, // Daha az margin
    marginBottom: 4, // Daha az margin
    minWidth: 40, // Minimum genişlik
  },
  dateLegendNumber: {
    fontSize: 14, // Daha küçük font
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2, // Daha az margin
  },
  dateLegendDate: {
    fontSize: 10, // Daha küçük font
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  scrollContent: {
    paddingRight: 16,
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12, // Daha az padding
    marginRight: 16, // Önceki margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    minWidth: 240, // Daha küçük minimum genişlik
    overflow: 'hidden', // Grafiklerin taşmasını engelle
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 12, // Daha küçük font
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8, // Daha az margin
    textAlign: 'center',
  },
  axisText: {
    color: theme.colors.subtext,
    fontSize: 10,
  },
  xAxisText: {
    fontSize: 11, // X ekseni etiketleri için biraz daha büyük
    fontWeight: '500', // Daha net görünüm
  },
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12, // Daha az padding
    marginTop: 12, // Daha az margin
  },
  statsTitle: {
    fontSize: 14, // Daha küçük font
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8, // Daha az margin
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18, // Daha küçük font
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2, // Daha az margin
  },
  statLabel: {
    fontSize: 10, // Daha küçük font
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
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
  tapHint: {
    fontSize: 8, // Daha küçük font
    color: theme.colors.subtext,
    marginTop: 6, // Daha az margin
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.subtext,
  },
  modalScrollContent: {
    paddingHorizontal: 8, // Daha az padding
    paddingBottom: 16,
  },
  fullScreenChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: '100%', // Tüm genişliği kullan
    width: '100%', // Genişliği zorla
  },
  modalDateLegend: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16, // Daha fazla padding
    marginTop: 12,
    marginHorizontal: 16,
  },
  modalDateLegendTitle: {
    fontSize: 13, // Daha küçük font
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8, // Daha az margin
    textAlign: 'center',
  },
  modalDateLegendSubtitle: {
    fontSize: 10,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDateLegendScroll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16, // Daha fazla padding
  },
  modalDateLegendItem: {
    alignItems: 'center',
    marginHorizontal: 6, // Daha az margin
    marginBottom: 4, // Daha az margin
    minWidth: 40, // Minimum genişlik
  },
  modalDateLegendNumber: {
    fontSize: 14, // Daha küçük font
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2, // Daha az margin
  },
  modalDateLegendDate: {
    fontSize: 10, // Daha küçük font
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  fullScreenAxisText: {
    fontSize: 12, // Daha büyük font
  },
  chartScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
