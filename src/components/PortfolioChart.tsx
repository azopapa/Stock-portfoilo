import React, { useState } from 'react';
import { StockItem, ViewCurrency } from '../types';
import { convertCurrency, formatCurrency } from '../utils/formatters';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Sector } from 'recharts';
import { PieChart as PieIcon, Layers } from 'lucide-react';

interface PortfolioChartProps {
  stocks: StockItem[];
  viewCurrency: ViewCurrency;
  exchangeRate: number;
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', 
  '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7'
];

// 커스텀 3D Active Shape 렌더링
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <text x={cx} cy={cy - 12} textAnchor="middle" fill="#f4f4f5" className="text-xs sm:text-sm font-bold">
        {payload.name}
      </text>
      <text x={cx} cy={cy + 12} textAnchor="middle" fill="#10b981" className="text-xs font-mono font-semibold">
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 10px 12px rgba(0, 0, 0, 0.6))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.5}
      />
    </g>
  );
};

// 그래프 내외부에 보유주식명과 비중을 표시하는 커스텀 라벨
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name } = props;
  if (percent < 0.02) return null; // 비중이 너무 작으면 생략

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#d4d4d8"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[11px] font-medium tracking-tight select-none"
    >
      {name} <tspan fill="#10b981" fontWeight="bold">{(percent * 100).toFixed(1)}%</tspan>
    </text>
  );
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  stocks,
  viewCurrency,
  exchangeRate,
}) => {
  const [chartType, setChartType] = useState<'stock' | 'category'>('stock');
  const [activeIndex, setActiveIndex] = useState(0);

  if (stocks.length === 0) {
    return null;
  }

  // 데이터 가공 및 총합 계산
  let chartData: { name: string; value: number }[] = [];
  let totalValue = 0;

  if (chartType === 'stock') {
    stocks.forEach((stock) => {
      const valInStock = stock.quantity * stock.currentPrice;
      const convertedVal = convertCurrency(valInStock, stock.currency, viewCurrency, exchangeRate);
      totalValue += convertedVal;
    });

    chartData = stocks.map((stock) => {
      const valInStock = stock.quantity * stock.currentPrice;
      const convertedVal = convertCurrency(valInStock, stock.currency, viewCurrency, exchangeRate);
      return {
        name: stock.name,
        value: Math.round(convertedVal * 100) / 100,
      };
    });
  } else {
    const categoryMap: { [key: string]: number } = {};
    stocks.forEach((stock) => {
      const valInStock = stock.quantity * stock.currentPrice;
      const convertedVal = convertCurrency(valInStock, stock.currency, viewCurrency, exchangeRate);
      const cat = stock.category || '기타';
      categoryMap[cat] = (categoryMap[cat] || 0) + convertedVal;
      totalValue += convertedVal;
    });

    chartData = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: Math.round(categoryMap[cat] * 100) / 100,
    }));
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Background 3D Glow Effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-zinc-800/80 gap-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 tracking-wide flex items-center gap-2">
              포트폴리오 자산 비중 3D 분석
            </h2>
            <p className="text-xs text-zinc-400">그래프 내에서 종목별 명칭과 비중(%)을 직접 확인할 수 있습니다</p>
          </div>
        </div>
        
        {/* Toggle View */}
        <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 flex items-center shadow-inner">
          <button
            onClick={() => { setChartType('stock'); setActiveIndex(0); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'stock'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            종목별 비중
          </button>
          <button
            onClick={() => { setChartType('category'); setActiveIndex(0); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'category'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            섹터별 비중
          </button>
        </div>
      </div>

      <div className="h-80 sm:h-96 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={115}
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={onPieEnter}
              label={renderCustomizedLabel}
              labelLine={{ stroke: '#52525b', strokeWidth: 1 }}
              stroke="#18181b"
              strokeWidth={3}
              style={{ filter: 'drop-shadow(0 12px 16px rgba(0, 0, 0, 0.7))' }}
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderRadius: '0.875rem',
                color: '#f4f4f5',
                fontSize: '13px',
                padding: '12px 16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
              }}
              formatter={(value: any, name: any) => [
                <span className="font-bold text-emerald-400">
                  {Number(value).toLocaleString()} {viewCurrency === 'KRW' ? '원' : 'USD'} 
                  ({totalValue > 0 ? ((Number(value) / totalValue) * 100).toFixed(1) : 0}%)
                </span>,
                name
              ]}
            />
            <Legend
              formatter={(value) => <span className="text-xs sm:text-sm text-zinc-300 font-medium px-1">{value}</span>}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '16px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


