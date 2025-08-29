import { useMemo } from 'react';
import { Performance } from '../types';

export const useChartData = (performanceHistory: Performance[]) => {
  return useMemo(() => {
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
};

// Default export ekle
export default useChartData;
