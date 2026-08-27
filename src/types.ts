export type Currency = 'KRW' | 'USD';

export type MarketType = 'KRX' | 'US' | 'OTHER';

export interface StockItem {
  id: string;
  name: string;
  ticker: string;
  market: MarketType;
  currency: Currency; // 원화(KRW) 또는 달러(USD) 단위로 기록
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  dailyChangeRate: number; // 일일 변동성 (%) e.g. 2.5 (-1.2 등)
  category: string; // 섹터 (예: 기술, 반도체, 2차전지, 금융 등)
}

export type ViewCurrency = 'KRW' | 'USD';
