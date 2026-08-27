import React, { useState, useEffect } from 'react';
import { StockItem, ViewCurrency } from './types';
import { INITIAL_STOCKS } from './data/initialData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { PortfolioChart } from './components/PortfolioChart';
import { PortfolioTable } from './components/PortfolioTable';
import { StockModal } from './components/StockModal';
import { DEFAULT_EXCHANGE_RATE } from './utils/formatters';

const STORAGE_KEY_STOCKS = 'stock_portfolio_items_v1';
const STORAGE_KEY_CURRENCY = 'stock_portfolio_currency_v1';
const STORAGE_KEY_RATE = 'stock_portfolio_exchange_rate_v1';

export default function App() {
  const [stocks, setStocks] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STOCKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stocks from localStorage', e);
      }
    }
    return INITIAL_STOCKS;
  });

  const [viewCurrency, setViewCurrency] = useState<ViewCurrency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
    return (saved === 'USD' || saved === 'KRW') ? saved : 'KRW';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RATE);
    const num = saved ? parseFloat(saved) : NaN;
    return !isNaN(num) && num > 0 ? num : DEFAULT_EXCHANGE_RATE;
  });

  const [lastRateUpdate, setLastRateUpdate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 로컬 스토리지 동기화
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENCY, viewCurrency);
  }, [viewCurrency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RATE, exchangeRate.toString());
  }, [exchangeRate]);

  // 1시간(3600초) 단위 환율 자동 최신화 타이머
  useEffect(() => {
    const fetchLatestExchangeRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates && data.rates.KRW) {
            const newRate = Math.round(data.rates.KRW * 100) / 100;
            setExchangeRate(newRate);
            setLastRateUpdate(new Date());
            return;
          }
        }
      } catch (err) {
        console.log('Live exchange rate fetch skipped, applying natural fluctuation simulation.');
      }

      // Fallback: 자연스러운 소폭 변동 시뮬레이션 (±0.3%)
      setExchangeRate((prev) => {
        const delta = (Math.random() * 0.006 - 0.003) * prev;
        return Math.round((prev + delta) * 100) / 100;
      });
      setLastRateUpdate(new Date());
    };

    // 1시간 = 3600 * 1000 ms
    const intervalId = setInterval(fetchLatestExchangeRate, 3600 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 주식 추가 / 수정 저장 핸들러
  const handleSaveStock = (stockData: Omit<StockItem, 'id'> | StockItem) => {
    if ('id' in stockData && stockData.id) {
      // 수정
      setStocks((prev) =>
        prev.map((item) => (item.id === stockData.id ? (stockData as StockItem) : item))
      );
    } else {
      // 신규 등록
      const newItem: StockItem = {
        ...(stockData as Omit<StockItem, 'id'>),
        id: Date.now().toString(),
      };
      setStocks((prev) => [newItem, ...prev]);
    }
  };

  // 주식 삭제 핸들러
  const handleDeleteStock = (id: string) => {
    if (window.confirm('정말 이 주식 종목을 포트폴리오에서 삭제하시겠습니까?')) {
      setStocks((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 수정 모달 오픈
  const handleOpenEdit = (stock: StockItem) => {
    setEditingStock(stock);
    setIsModalOpen(true);
  };

  // 신규 모달 오픈
  const handleOpenAdd = () => {
    setEditingStock(null);
    setIsModalOpen(true);
  };

  // 시세 새로고침/변동 시뮬레이션
  const handleRefreshPrices = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStocks((prev) =>
        prev.map((stock) => {
          // 소폭 변동 시뮬레이션 (-2% ~ +2%)
          const fluctuationPercent = (Math.random() * 4 - 2) / 100;
          const newCurrentPrice = Math.max(1, Math.round((stock.currentPrice * (1 + fluctuationPercent)) * 100) / 100);
          const newDailyRate = Math.round((stock.dailyChangeRate + (fluctuationPercent * 100)) * 100) / 100;

          return {
            ...stock,
            currentPrice: newCurrentPrice,
            dailyChangeRate: newDailyRate,
          };
        })
      );
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <Header
        viewCurrency={viewCurrency}
        setViewCurrency={setViewCurrency}
        exchangeRate={exchangeRate}
        setExchangeRate={setExchangeRate}
        onOpenAddModal={handleOpenAdd}
        onRefreshPrices={handleRefreshPrices}
        isRefreshing={isRefreshing}
        lastRateUpdate={lastRateUpdate}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Metric Cards */}
        <SummaryCards
          stocks={stocks}
          viewCurrency={viewCurrency}
          exchangeRate={exchangeRate}
        />

        {/* Portfolio Visual Allocation Chart */}
        <PortfolioChart
          stocks={stocks}
          viewCurrency={viewCurrency}
          exchangeRate={exchangeRate}
        />

        {/* Portfolio Table */}
        <PortfolioTable
          stocks={stocks}
          viewCurrency={viewCurrency}
          exchangeRate={exchangeRate}
          onEditStock={handleOpenEdit}
          onDeleteStock={handleDeleteStock}
        />
      </main>

      {/* Add / Edit Stock Modal */}
      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStock}
        editingStock={editingStock}
      />
    </div>
  );
}
