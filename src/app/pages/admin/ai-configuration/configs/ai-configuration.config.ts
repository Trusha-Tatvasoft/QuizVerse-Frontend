import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CardInputConfig } from '../../../../shared/interfaces/card-component.interface';
import { AIConfigurationSummary } from '../interfaces/ai-configuration.interface';

export const qiConfigurationsHeaderConfig: PageHeaderComponent = {
  icon: 'quiz',
  title: 'AI & Machine Learning Configuration',
  subtitle: 'Configure AI-powered features for question generation and explanations',
  theme: 'quizDifficulty' as const,
};

const aiBaseCardConfig: Record<
  keyof AIConfigurationSummary,
  Omit<CardInputConfig, 'value' | 'subtitle'>
> = {
  curruntMonthApiCalls: {
    title: 'Monthly API Calls',
    icon: 'call_made',
    iconColor: 'purple',
    subtitleColor: 'purple',
    valueColor: 'black',
  },
  generatedQuestionsCurruntMonth: {
    title: 'Generated Questions',
    icon: 'bar_chart_4_bars',
    iconColor: 'green',
    subtitleColor: 'green',
    valueColor: 'black',
  },
  generatedQuestionsLastMonth: {
    title: 'Last Month Questions',
    icon: '',
    iconColor: 'purple',
    subtitleColor: 'purple',
    valueColor: 'black',
  },
  successRate: {
    title: 'Success Rate',
    icon: 'settings',
    iconColor: 'blue',
    subtitleColor: 'purple',
    valueColor: 'black',
  },
};

//  Maps API data into display-ready CardInputConfig[]
export function mapAiSummaryToCards(data: AIConfigurationSummary): CardInputConfig[] {
  const growthRate = calculateGrowthRate(
    data.generatedQuestionsCurruntMonth,
    data.generatedQuestionsLastMonth,
  );

  return [
    {
      ...aiBaseCardConfig.curruntMonthApiCalls,
      subtitle: 'Current month',
      value: data.curruntMonthApiCalls.toLocaleString(),
    },
    {
      ...aiBaseCardConfig.generatedQuestionsCurruntMonth,
      subtitle: `${growthRate}% this month`,
      value: data.generatedQuestionsCurruntMonth.toLocaleString(),
      subtitleColor: growthRate.startsWith('+') ? 'green' : 'red',
    },
    {
      ...aiBaseCardConfig.successRate,
      subtitle: 'Excellent performance',
      value: `${data.successRate}%`,
    },
  ];
}

// Utility to calculate % growth between current & last month.
export function calculateGrowthRate(current: number, last: number): string {
  if (!last || last === 0) {
    if (current === 0) {
      return '+0';
    } else {
      return '+100';
    }
  }
  const rate = ((current - last) / last) * 100;
  return rate > 0 ? `+${rate.toFixed(1)}` : `${rate.toFixed(1)}`;
}
