import React from 'react';
import { StockItem, ViewCurrency } from '../types';
import { convertCurrency, formatCurrency, formatPercent } from '../utils/formatters';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon } from 'lucide-react';

interface SummaryCardsProps {
  stocks: StockItem[];
  viewCurrency: ViewCurrency;
  exchangeRate: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stocks,
  viewCurrency,
  exchangeRate,
}) => {
  // 계산 로직
  let totalPrincipal = 0;
  let totalValuation = 0;
  let totalDailyProfit = 0;

  stocks.forEach((stock) => {
    const principalInStockCurrency = stock.quantity * stock.avgPrice;
    const valuationInStockCurrency = stock.quantity * stock.currentPrice;
    
    // 일일 변동 금액 (현재가 기준 하루 변동)
    // currentPrice / (1 + dailyChangeRate / 100) 를 전일 종가로 가정하여 하루 변동액 산출
    const prevPrice = stock.currentPrice / (1 + stock.dailyChangeRate / 100);
    const dailyProfitInStockCurrency = stock.quantity * (stock.currentPrice - prevPrice);

    // viewCurrency로 변환 환산
    totalPrincipal += convertCurrency(principalInStockCurrency, stock.currency, viewCurrency, exchangeRate);
    totalValuation += convertCurrency(valuationInStockCurrency, stock.currency, viewCurrency, exchangeRate);
    totalDailyProfit += convertCurrency(dailyProfitInStockCurrency, stock.currency, viewCurrency, exchangeRate);
  });

  const totalProfitLoss = totalValuation - totalPrincipal;
  const totalProfitLossRate = totalPrincipal > 0 ? (totalProfitLoss / totalPrincipal) * 100 : 0;
  const isPositiveTotal = totalProfitLoss >= 0;
  const isPositiveDaily = totalDailyProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 카드 1: 총 평가금액 */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">총 평가금액</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-1">
          {formatCurrency(totalValuation, viewCurrency)}
        </div>
        <div className="text-xs text-zinc-400 flex items-center gap-1">
          <span>보유 종목 수:</span>
          <span className="text-zinc-200 font-semibold">{stocks.length}개</span>
        </div>
      </div>

      {/* 카드 2: 총 원금 */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">총 투자 원금</span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-1">
          {formatCurrency(totalPrincipal, viewCurrency)}
        </div>
        <div className="text-xs text-zinc-400">
          실제 투입된 자산 총액
        </div>
      </div>

      {/* 카드 3: 총 평가손익 */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
        <div className={`absolute top-0 right-0 w-32 h-32 ${isPositiveTotal ? 'bg-emerald-500/5' : 'bg-rose-500/5'} rounded-full blur-2xl transition-all`} />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">총 평가손익 (수익률)</span>
          <div className={`w-9 h-9 rounded-xl ${isPositiveTotal ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} border flex items-center justify-center`}>
            {isPositiveTotal ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${isPositiveTotal ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositiveTotal ? '+' : ''}{formatCurrency(totalProfitLoss, viewCurrency)}
        </div>
        <div className={`text-xs font-semibold flex items-center gap-1 ${isPositiveTotal ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span>수익률: {formatPercent(totalProfitLossRate)}</span>
        </div>
      </div>

      {/* 카드 4: 일일 손익 */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-lg backdrop-blur-sm group hover:border-zinc-700 transition-all">
        <div className={`absolute top-0 right-0 w-32 h-32 ${isPositiveDaily ? 'bg-emerald-500/5' : 'bg-rose-500/5'} rounded-full blur-2xl transition-all`} />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">일일 변동 손익</span>
          <div className={`w-9 h-9 rounded-xl ${isPositiveDaily ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} border flex items-center justify-center`}>
            {isPositiveDaily ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${isPositiveDaily ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositiveDaily ? '+' : ''}{formatCurrency(totalDailyProfit, viewCurrency)}
        </div>
        <div className="text-xs text-zinc-400">
          전일 종가 대비 변동 금액
        </div>
      </div>
    </div>
  );
};
