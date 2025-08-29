import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme/theme';
import { Performance } from '../../types';
import ChartRenderer from './ChartRenderer';

const { width: screenWidth } = Dimensions.get('window');

// Sabit mesafe değerleri
const SPACING = {
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 24,
};

interface DateLegendProps {
  recentPerformances: Performance[];
}

export const DateLegend: React.FC<DateLegendProps> = ({ recentPerformances }) => (
  <View style={[styles.dateLegend, { marginTop: SPACING.s }]}>
    <View style={styles.legendHeader}>
      <Ionicons name="calendar-outline" size={16} color={theme.colors.text} style={{marginRight:8}} />
      <Text style={styles.dateLegendTitle}>Antrenman Sırası</Text>
    </View>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={styles.dateLegendScroll}
    >
      {recentPerformances.map((perf, index) => (
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
);

interface ChartCardProps {
  type: 'weight' | 'reps' | 'sets';
  data: any[];
  title: string;
  color: string;
  onPress: () => void;
  chartWidth: number;
  chartHeight: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  type, 
  data, 
  title, 
  color, 
  onPress, 
  chartWidth, 
  chartHeight 
}) => (
  <TouchableOpacity 
    style={styles.chartContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.chartHeader}>
      <Ionicons 
        name={
          type === 'weight' ? 'barbell-outline' : 
          type === 'reps' ? 'repeat-outline' : 'checkmark-done-outline'
        } 
        size={16} 
        color={theme.colors.text} 
        style={{marginRight:6}} 
      />
      <Text style={styles.chartTitle}>{title}</Text>
    </View>
    <View style={styles.chartWrapper} pointerEvents="none">
      <ChartRenderer
        type={type}
        data={data}
        color={color}
        width={chartWidth}
        height={chartHeight}
      />
    </View>
  </TouchableOpacity>
);

interface StatsSummaryProps {
  chartData: {
    weightData: any[];
    repsData: any[];
    setsData: any[];
  };
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ chartData }) => (
  <View style={[styles.statsContainer, { marginTop: SPACING.s }]}>
    <View style={styles.statsHeader}>
      <Ionicons name="stats-chart-outline" size={18} color={theme.colors.text} style={{marginRight: 8}} />
      <Text style={styles.statsTitle}>Özet İstatistikler</Text>
    </View>
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
);

interface FullScreenChartModalProps {
  selectedChart: {
    type: 'weight' | 'reps' | 'sets';
    data: any[];
    title: string;
    color: string;
  } | null;
  onClose: () => void;
  chartData: {
    recentPerformances: Performance[];
  };
}

export const FullScreenChartModal: React.FC<FullScreenChartModalProps> = ({ 
  selectedChart, 
  onClose, 
  chartData 
}) => {
  if (!selectedChart) return null;

  const fullScreenChartWidth = Math.max(screenWidth - 40, (selectedChart.data.length || 0) * 100);
  const fullScreenChartHeight = 300;

  return (
    <Modal
      visible={selectedChart !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedChart.title}</Text>
            <TouchableOpacity 
              onPress={onClose}
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
              <ChartRenderer
                type={selectedChart.type}
                data={selectedChart.data}
                color={selectedChart.color}
                isFullScreen={true}
                width={fullScreenChartWidth}
                height={fullScreenChartHeight}
              />
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
  );
};

const styles = StyleSheet.create({
  // DateLegend styles
  dateLegend: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  dateLegendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  dateLegendScroll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
  },
  dateLegendItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 4,
    minWidth: 40,
  },
  dateLegendNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  dateLegendDate: {
    fontSize: 10,
    color: theme.colors.subtext,
    textAlign: 'center',
  },

  // ChartCard styles
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    width: screenWidth - 40,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.s,
    paddingHorizontal: SPACING.xs,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // StatsSummary styles
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 0,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.subtext,
    textAlign: 'center',
  },

  // FullScreenModal styles
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
    padding: SPACING.m,
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
    padding: SPACING.xs,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.subtext,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.m,
  },
  fullScreenChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: '100%',
    width: '100%',
  },
  modalDateLegend: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: SPACING.m,
    marginTop: SPACING.s,
    marginHorizontal: SPACING.m,
  },
  modalDateLegendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalDateLegendSubtitle: {
    fontSize: 10,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalDateLegendScroll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
  },
  modalDateLegendItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 4,
    minWidth: 40,
  },
  modalDateLegendNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  modalDateLegendDate: {
    fontSize: 10,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
});

// Ana bileşen olarak export et
const ChartComponents = {
  DateLegend,
  ChartCard,
  StatsSummary,
  FullScreenChartModal
};

export default ChartComponents;
