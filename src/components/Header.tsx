import React, { useState } from 'react';
import { ViewCurrency } from '../types';
import { TrendingUp, Plus, Settings, DollarSign, RefreshCw, Clock } from 'lucide-react';

interface HeaderProps {
  viewCurrency: ViewCurrency;
  setViewCurrency: (currency: ViewCurrency) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  onOpenAddModal: () => void;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
  lastRateUpdate: Date;
}

export const Header: React.FC<HeaderProps> = ({
  viewCurrency,
  setViewCurrency,
  exchangeRate,
  setExchangeRate,
  onOpenAddModal,
  onRefreshPrices,
  isRefreshing,
  lastRateUpdate,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate.toString());

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(tempRate);
    if (!isNaN(num) && num > 0) {
      setExchangeRate(num);
      setShowSettings(false);
    }
  };

  const formattedTime = lastRateUpdate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              포트폴리오 대시보드
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                PRO
              </span>
            </h1>
            <p className="text-xs text-zinc-400">실시간 자산 현황 및 다중 통화 관리</p>
          </div>
        </div>

        {/* Controls & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Currency Toggle */}
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center">
            <button
              onClick={() => setViewCurrency('KRW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewCurrency === 'KRW'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              KRW (₩)
            </button>
            <button
              onClick={() => setViewCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewCurrency === 'USD'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Exchange Rate Setting Button & 1hr auto status */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="환율 설정 및 1시간 주기 자동 갱신 안내"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              <span className="hidden md:inline">환율: ₩{exchangeRate.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 ml-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                <Clock className="w-3 h-3" /> 1hr
              </span>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    USD/KRW 환율 설정
                  </h3>
                  <span className="text-[10px] text-zinc-400">
                    최근 갱신: {formattedTime}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">
                  💡 환율은 1시간(1hr) 주기로 최신 시장 환율에 맞춰 자동으로 갱신됩니다.
                </p>
                <form onSubmit={handleSaveRate} className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">1 USD 당 원화 금액</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">₩</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tempRate}
                        onChange={(e) => setTempRate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-500 font-medium"
                    >
                      적용
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Refresh Simulation */}
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
            title="시세 새로고침/변동"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">시세 갱신</span>
          </button>

          {/* Add Stock Button */}
          <button
            onClick={onOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>신규 주식 등록</span>
          </button>
        </div>
      </div>
    </header>
  );
};
