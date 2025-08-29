import React, { useMemo } from 'react';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { theme } from '../../theme/theme';

interface ChartRendererProps {
  type: 'weight' | 'reps' | 'sets';
  data: any[];
  color: string;
  isFullScreen?: boolean;
  width: number;
  height: number;
}

// Yardımcı: Y ekseninde tam desired adet etiketi eşit aralıklarla üret
const buildYLabelsExact = (values: number[], desired: number): string[] => {
  if (values.length === 0) return [];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!isFinite(min) || !isFinite(max)) return [];
  if (min === max) {
    min = Math.floor(min - 1);
    max = Math.ceil(max + 1);
  }
  const out: string[] = [];
  const step = (max - min) / (desired - 1);
  for (let i = 0; i < desired; i++) {
    const v = min + step * i;
    out.push(Number(v.toFixed(2)).toString());
  }
  return out;
};

// Yardımcı: X ekseninde tam desiredCount etiketi düzgün aralıklarla üret
const buildXLabelsExact = (labels: string[], desired: number): string[] => {
  if (labels.length === 0) return [];
  const count = Math.min(desired, labels.length);
  if (count === labels.length) return labels; // zaten az
  const out = new Array(labels.length).fill('');
  const last = labels.length - 1;
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * last) / (count - 1)); // 0 ve son dahil eşit aralık
    out[idx] = labels[idx];
  }
  return out as string[];
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  data,
  color,
  isFullScreen = false,
  width,
  height
}) => {
  const desiredTicks = isFullScreen ? 7 : 6;

  // Array işlemlerini useMemo ile optimize et
  const chartConfig = useMemo(() => {
    // X ekseni: tam desiredTicks etiketi eşit aralıkla
    const xAxisLabelTexts = buildXLabelsExact(data.map((d: any) => d.label), desiredTicks);
    
    // Y ekseni: tam desiredTicks etiket
    const yAxisLabelTexts = buildYLabelsExact(data.map((d: any) => Number(d.value)), desiredTicks);
    const noOfSectionsVal = Math.max(1, desiredTicks - 1);

    return {
      xAxisLabelTexts,
      yAxisLabelTexts,
      noOfSectionsVal
    };
  }, [data, desiredTicks]);

  // Style'ları useMemo ile optimize et
  const chartStyles = useMemo(() => {
    const yAxisTextStyle = [
      { color: theme.colors.subtext, fontSize: 10 },
      isFullScreen ? { fontSize: 12 } : { fontSize: 9 },
    ];
    const xAxisTextStyle = [
      { color: theme.colors.subtext, fontSize: 10 },
      { fontSize: 11, fontWeight: '500' },
      isFullScreen ? { fontSize: 12 } : { fontSize: 9 },
    ];
    const yAxisLabelWidthVal = isFullScreen ? 34 : 26;
    const xAxisLabelsHeightVal = isFullScreen ? 18 : 14;

    return {
      yAxisTextStyle,
      xAxisTextStyle,
      yAxisLabelWidthVal,
      xAxisLabelsHeightVal
    };
  }, [isFullScreen]);

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
        initialSpacing={isFullScreen ? 12 : 12}
        endSpacing={isFullScreen ? 12 : 12}
        spacing={isFullScreen ? 30 : 15}
        backgroundColor="transparent"
        rulesColor={theme.colors.border}
        rulesType="solid"
        yAxisColor={theme.colors.border}
        xAxisColor={theme.colors.border}
        yAxisTextStyle={chartStyles.yAxisTextStyle as any}
        xAxisLabelTextStyle={chartStyles.xAxisTextStyle as any}
        yAxisLabelWidth={chartStyles.yAxisLabelWidthVal}
        xAxisLabelsHeight={chartStyles.xAxisLabelsHeightVal}
        yAxisLabelTexts={chartConfig.yAxisLabelTexts}
        xAxisLabelTexts={chartConfig.xAxisLabelTexts}
        noOfSections={chartConfig.noOfSectionsVal}
        dataPointsColor={color}
        dataPointsRadius={isFullScreen ? 4 : 2}
        curved
        showVerticalLines={false}
        hideAxesAndRules={false}
        hideRules={!isFullScreen}
        hideOrigin={!isFullScreen}
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
        initialSpacing={isFullScreen ? 12 : 12}
        endSpacing={isFullScreen ? 12 : 12}
        barBorderRadius={isFullScreen ? 4 : 2}
        frontColor={color}
        backgroundColor="transparent"
        rulesColor={theme.colors.border}
        rulesType="solid"
        yAxisColor={theme.colors.border}
        xAxisColor={theme.colors.border}
        yAxisTextStyle={chartStyles.yAxisTextStyle as any}
        xAxisLabelTextStyle={chartStyles.xAxisTextStyle as any}
        yAxisLabelWidth={chartStyles.yAxisLabelWidthVal}
        xAxisLabelsHeight={chartStyles.xAxisLabelsHeightVal}
        yAxisLabelTexts={chartConfig.yAxisLabelTexts}
        xAxisLabelTexts={chartConfig.xAxisLabelTexts}
        noOfSections={chartConfig.noOfSectionsVal}
        showVerticalLines={false}
      />
    );
  }
};

// Default export ekle
export default ChartRenderer;
