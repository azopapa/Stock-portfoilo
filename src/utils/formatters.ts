import { Currency, ViewCurrency, StockItem } from '../types';

export const DEFAULT_EXCHANGE_RATE = 1350; // 1 USD = 1,350 KRW

/**
 * 특정 금액을 지정한 표시 통화(ViewCurrency)로 변환
 * @param amount 원본 금액
 * @param originalCurrency 원본 주식의 통화 (KRW 또는 USD)
 * @param viewCurrency 사용자가 현재 보고 있는 통화 (KRW 또는 USD)
 * @param exchangeRate USD/KRW 환율 (1 USD = ? KRW)
 */
export function convertCurrency(
  amount: number,
  originalCurrency: Currency,
  viewCurrency: ViewCurrency,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): number {
  if (originalCurrency === viewCurrency) {
    return amount;
  }

  if (originalCurrency === 'USD' && viewCurrency === 'KRW') {
    return amount * exchangeRate;
  }

  if (originalCurrency === 'KRW' && viewCurrency === 'USD') {
    return amount / exchangeRate;
  }

  return amount;
}

/**
 * 통화 기호 및 포맷팅
 */
export function formatCurrency(amount: number, viewCurrency: ViewCurrency): string {
  if (viewCurrency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(rate: number): string {
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
}
