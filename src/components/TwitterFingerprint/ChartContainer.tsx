'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BarChart3, Type } from 'lucide-react';
import RadialChart from './RadialChart';
import { AnalyticsData } from '@/types';

interface ChartContainerProps {
  data: AnalyticsData;
  username: string;
}

type ChartType = 'timeOfDay' | 'tweetLength' | 'characterFrequency';

const chartConfig = {
  timeOfDay: {
    title: 'Time of Day Activity',
    description: 'When you tweet most throughout the day',
    icon: Clock,
    color: 'blue',
  },
  tweetLength: {
    title: 'Tweet Length Distribution',
    description: 'Distribution of your tweet character counts',
    icon: BarChart3,
    color: 'pink',
  },
  characterFrequency: {
    title: 'Character Frequency',
    description: 'Most used characters in your tweets',
    icon: Type,
    color: 'green',
  },
};

export default function ChartContainer({ data }: ChartContainerProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('timeOfDay');
  const [showAllCharts, setShowAllCharts] = useState(true);

  const toggleChart = (chartType: ChartType) => {
    if (activeChart === chartType) {
      setShowAllCharts(true);
      setActiveChart('timeOfDay');
    } else {
      setShowAllCharts(false);
      setActiveChart(chartType);
    }
  };

  const getChartData = (type: ChartType) => {
    switch (type) {
      case 'timeOfDay':
        return data.timeOfDay;
      case 'tweetLength':
        return data.tweetLength;
      case 'characterFrequency':
        return data.characterFrequency;
      default:
        return {};
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Chart Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {Object.entries(chartConfig).map(([key, config]) => {
          const chartType = key as ChartType;
          const Icon = config.icon;
          const isActive = activeChart === chartType;
          const colorClasses = {
            blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
            pink: isActive ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100',
            green: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100',
          };

          return (
            <motion.button
              key={chartType}
              onClick={() => toggleChart(chartType)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${colorClasses[config.color as keyof typeof colorClasses]}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{config.title}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Chart Display */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <AnimatePresence mode="wait">
          {showAllCharts ? (
            <motion.div
              key="all-charts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {Object.entries(chartConfig).map(([key, config]) => {
                const chartType = key as ChartType;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={chartType}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="mb-4">
                      <Icon className={`w-8 h-8 mx-auto mb-2 text-${config.color}-600`} />
                      <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                    </div>
                    <div className="aspect-square">
                      <RadialChart
                        data={getChartData(chartType)}
                        type={chartType}
                        width={200}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="single-chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  {(() => {
                    const Icon = chartConfig[activeChart].icon;
                    return <Icon className="w-8 h-8 text-pink-600" />;
                  })()}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {chartConfig[activeChart].title}
                  </h2>
                </div>
                <p className="text-gray-600">{chartConfig[activeChart].description}</p>
              </div>
              
              <div className="flex justify-center">
                <RadialChart
                  data={getChartData(activeChart)}
                  type={activeChart}
                  width={500}
                  height={500}
                  className="max-w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{data.stats.totalTweets}</div>
          <div className="text-sm opacity-90">Total Tweets</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{data.stats.averageTweetLength}</div>
          <div className="text-sm opacity-90">Avg Length</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-lg font-bold">{data.stats.mostActiveTime}</div>
          <div className="text-sm opacity-90">Most Active</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-lg font-bold">{data.stats.leastActiveTime}</div>
          <div className="text-sm opacity-90">Least Active</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-lg font-bold">{data.stats.mostUsedCharacter}</div>
          <div className="text-sm opacity-90">Most Used</div>
        </div>
      </motion.div>
    </div>
  );
}
