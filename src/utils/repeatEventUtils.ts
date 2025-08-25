import { Event } from '../types';

/**
 * 반복 일정을 생성하는 함수
 * @param baseEvent 기본 일정 정보
 * @returns 생성된 반복 일정들의 배열
 */
export function generateRepeatEvents(baseEvent: Event): Event[] {
  console.log('Processing event:', baseEvent.id);
  return [];
}
