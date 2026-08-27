import React, { useState, useEffect } from 'react';
import { StockItem, Currency, MarketType } from '../types';
import { X, Sparkles, Plus, Check } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: Omit<StockItem, 'id'> | StockItem) => void;
  editingStock: StockItem | null;
}

const POPULAR_PRESETS = [
  { name: 'Apple Inc.', ticker: 'AAPL', market: 'US' as MarketType, currency: 'USD' as Currency, price: 189.30, category: '테크' },
  { name: 'NVIDIA Corporation', ticker: 'NVDA', market: 'US' as MarketType, currency: 'USD' as Currency, price: 124.60, category: '반도체' },
  { name: 'Tesla, Inc.', ticker: 'TSLA', market: 'US' as MarketType, currency: 'USD' as Currency, price: 214.50, category: 'EV/모빌리티' },
  { name: 'Microsoft Corporation', ticker: 'MSFT', market: 'US' as MarketType, currency: 'USD' as Currency, price: 425.10, category: '테크' },
  { name: '삼성전자', ticker: '005930', market: 'KRX' as MarketType, currency: 'KRW' as Currency, price: 78500, category: '반도체' },
  { name: 'SK하이닉스', ticker: '000660', market: 'KRX' as MarketType, currency: 'KRW' as Currency, price: 172000, category: '반도체' },
  { name: 'NAVER', ticker: '035420', market: 'KRX' as MarketType, currency: 'KRW' as Currency, price: 205000, category: '인터넷/플랫폼' },
];

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStock,
}) => {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [market, setMarket] = useState<MarketType>('US');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [quantity, setQuantity] = useState('10');
  const [avgPrice, setAvgPrice] = useState('150');
  const [currentPrice, setCurrentPrice] = useState('155');
  const [dailyChangeRate, setDailyChangeRate] = useState('1.5');
  const [category, setCategory] = useState('테크');

  useEffect(() => {
    if (editingStock) {
      setName(editingStock.name);
      setTicker(editingStock.ticker);
      setMarket(editingStock.market);
      setCurrency(editingStock.currency);
      setQuantity(editingStock.quantity.toString());
      setAvgPrice(editingStock.avgPrice.toString());
      setCurrentPrice(editingStock.currentPrice.toString());
      setDailyChangeRate(editingStock.dailyChangeRate.toString());
      setCategory(editingStock.category);
    } else {
      setName('');
      setTicker('');
      setMarket('US');
      setCurrency('USD');
      setQuantity('10');
      setAvgPrice('150');
      setCurrentPrice('155');
      setDailyChangeRate('1.2');
      setCategory('테크');
    }
  }, [editingStock, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setTicker(preset.ticker);
    setMarket(preset.market);
    setCurrency(preset.currency);
    setCurrentPrice(preset.price.toString());
    setAvgPrice((preset.price * 0.95).toFixed(2));
    setCategory(preset.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ticker.trim()) return;

    const stockData = {
      ...(editingStock ? { id: editingStock.id } : {}),
      name,
      ticker: ticker.toUpperCase(),
      market,
      currency,
      quantity: parseFloat(quantity) || 0,
      avgPrice: parseFloat(avgPrice) || 0,
      currentPrice: parseFloat(currentPrice) || 0,
      dailyChangeRate: parseFloat(dailyChangeRate) || 0,
      category: category.trim() || '기타',
    };

    onSave(stockData as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-100">
              {editingStock ? '주식 정보 수정' : '신규 주식 등록'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {!editingStock && (
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                인기 종목 빠른 선택
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRESETS.map((p) => (
                  <button
                    key={p.ticker}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({p.ticker})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">주식명 (회사명)</label>
              <input
                type="text"
                required
                placeholder="예: 애플 또는 삼성전자"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">티커 심볼 (Ticker)</label>
              <input
                type="text"
                required
                placeholder="예: AAPL 또는 005930"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">거래소 구분</label>
              <select
                value={market}
                onChange={(e) => {
                  const val = e.target.value as MarketType;
                  setMarket(val);
                  setCurrency(val === 'KRX' ? 'KRW' : 'USD');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="US">미국 (US)</option>
                <option value="KRX">국내 (KRX)</option>
                <option value="OTHER">기타 (OTHER)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">원화/달러 통화 단위</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="USD">USD ($)</option>
                <option value="KRW">KRW (₩)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">보유 수량</label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">1주 평균금액 (평단가)</label>
              <input
                type="number"
                step="any"
                required
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">현재가</label>
              <input
                type="number"
                step="any"
                required
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">일일 변동성 (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={dailyChangeRate}
                onChange={(e) => setDailyChangeRate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                placeholder="예: 1.25 또는 -0.85"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">섹터 / 분류</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                placeholder="예: 테크, 반도체, 금융"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/50"
            >
              {editingStock ? '수정 완료' : '주식 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
