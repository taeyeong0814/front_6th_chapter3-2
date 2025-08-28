import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

// 전역 테스트 타임아웃 설정 (30초) --일단 해결법이 마땅한 부분이 없어서 타임아웃을 30초로 늘리는 방법을 선택.
vi.setConfig({ testTimeout: 30000 });

// ! Hard 여기 제공 안함
/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions(); // ? Med: 이걸 왜 써야하는지 물어보자

  vi.setSystemTime(new Date('2025-10-01')); // ? Med: 이걸 왜 써야하는지 물어보자
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
