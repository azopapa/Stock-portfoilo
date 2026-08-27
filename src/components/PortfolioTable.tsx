import React, { useState } from 'react';
import { StockItem, ViewCurrency } from '../types';
import { convertCurrency, formatCurrency, formatPercent } from '../utils/formatters';
import { Search, Trash2, Edit3, TrendingUp, TrendingDown, ArrowUpDown, Layers } from 'lucide-react';

interface PortfolioTableProps {
  stocks: StockItem[];
  viewCurrency: ViewCurrency;
  exchangeRate: number;
  onEditStock: (stock: StockItem) => void;
  onDeleteStock: (id: string) => void;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  stocks,
  viewCurrency,
  exchangeRate,
  onEditStock,
  onDeleteStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [marketFilter, setMarketFilter] = useState<string>('ALL');

  // 필터링
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = marketFilter === 'ALL' || stock.market === marketFilter;
    return matchesSearch && matchesMarket;
  });

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">보유 주식 포트폴리오 목록</h2>
            <p className="text-xs text-zinc-400">총 {stocks.length}개 종목 관리 중</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="종목명 또는 티커 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setMarketFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                marketFilter === 'ALL' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setMarketFilter('US')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                marketFilter === 'US' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              미국주식
            </button>
            <button
              onClick={() => setMarketFilter('KRX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                marketFilter === 'KRX' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              국내주식
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-950/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">보유 주식명</th>
              <th className="py-3.5 px-4 text-right">수량</th>
              <th className="py-3.5 px-4 text-right">1주 평균금액</th>
              <th className="py-3.5 px-4 text-right">현재가</th>
              <th className="py-3.5 px-4 text-right">일일 변동성</th>
              <th className="py-3.5 px-4 text-right">원금</th>
              <th className="py-3.5 px-4 text-right">평가금액</th>
              <th className="py-3.5 px-4 text-right">평가손익 (수익률)</th>
              <th className="py-3.5 px-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-xs sm:text-sm">
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-zinc-500">
                  등록된 주식이 없거나 검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock) => {
                // 환산 계산
                const avgPriceConverted = convertCurrency(stock.avgPrice, stock.currency, viewCurrency, exchangeRate);
                const currentPriceConverted = convertCurrency(stock.currentPrice, stock.currency, viewCurrency, exchangeRate);
                const principalConverted = convertCurrency(stock.quantity * stock.avgPrice, stock.currency, viewCurrency, exchangeRate);
                const valuationConverted = convertCurrency(stock.quantity * stock.currentPrice, stock.currency, viewCurrency, exchangeRate);
                
                const profitLoss = valuationConverted - principalConverted;
                const profitLossRate = principalConverted > 0 ? (profitLoss / principalConverted) * 100 : 0;
                const isPositivePL = profitLoss >= 0;
                const isPositiveDaily = stock.dailyChangeRate >= 0;

                return (
                  <tr key={stock.id} className="hover:bg-zinc-800/40 transition-colors group">
                    {/* 주식명 & 티커 */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${stock.market === 'US' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {stock.market}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            {stock.name}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {stock.ticker}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">{stock.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* 수량 */}
                    <td className="py-4 px-4 text-right font-mono text-zinc-300">
                      {stock.quantity.toLocaleString()}주
                    </td>

                    {/* 1주 평균금액 */}
                    <td className="py-4 px-4 text-right font-mono text-zinc-300">
                      {formatCurrency(avgPriceConverted, viewCurrency)}
                      <div className="text-[10px] text-zinc-400 font-sans">({stock.currency})</div>
                    </td>

                    {/* 현재가 */}
                    <td className="py-4 px-4 text-right font-mono font-semibold text-zinc-100">
                      {formatCurrency(currentPriceConverted, viewCurrency)}
                    </td>

                    {/* 일일 변동성 */}
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${isPositiveDaily ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {isPositiveDaily ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(stock.dailyChangeRate)}
                      </span>
                    </td>

                    {/* 원금 */}
                    <td className="py-4 px-4 text-right font-mono text-zinc-300">
                      {formatCurrency(principalConverted, viewCurrency)}
                    </td>

                    {/* 평가금액 */}
                    <td className="py-4 px-4 text-right font-mono font-semibold text-zinc-100">
                      {formatCurrency(valuationConverted, viewCurrency)}
                    </td>

                    {/* 평가손익 (수익률) */}
                    <td className="py-4 px-4 text-right font-mono">
                      <div className={`font-semibold ${isPositivePL ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositivePL ? '+' : ''}{formatCurrency(profitLoss, viewCurrency)}
                      </div>
                      <div className={`text-[11px] ${isPositivePL ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                        ({formatPercent(profitLossRate)})
                      </div>
                    </td>

                    {/* 관리 버튼 */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditStock(stock)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStock(stock.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
