import { Event } from '../types';

/**
 * 반복 일정의 아이콘을 반환하는 함수
 * @param event 일정 정보
 * @returns 아이콘 문자열
 */
export function getRepeatIcon(event: Event): string {
  switch (event.repeat.type) {
    case 'daily':
      return '🔄';
    case 'weekly':
      return '📅';
    case 'monthly':
      return '📆';
    case 'yearly':
      return '🗓️';
    default:
      return '';
  }
}

/**
 * 반복 일정에 아이콘이 표시되어야 하는지 확인하는 함수
 * @param event 일정 정보
 * @returns 아이콘 표시 여부
 */
export function shouldShowRepeatIcon(event: Event): boolean {
  return event.repeat.type !== 'none';
}

/**
 * 반복 타입별 아이콘 클래스명을 반환하는 함수
 * @param repeatType 반복 타입
 * @returns CSS 클래스명
 */
export function getRepeatIconClass(repeatType: string): string {
  switch (repeatType) {
    case 'daily':
      return 'icon-daily';
    case 'weekly':
      return 'icon-weekly';
    case 'monthly':
      return 'icon-monthly';
    case 'yearly':
      return 'icon-yearly';
    default:
      return '';
  }
}
