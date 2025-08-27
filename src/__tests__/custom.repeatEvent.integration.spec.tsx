import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// 통합 테스트용 설정 함수
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// 기본 일정 생성 헬퍼 함수
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 통합 테스트', () => {
  beforeEach(() => {
    // 기본 이벤트 목록 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // 1단계: 매일 반복 일정 생성 통합 테스트 (단위 테스트 기준)
  it('매일 반복 일정을 생성하면 5일간의 일정이 생성된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 1. 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 2. 기본 정보 입력
    await user.type(screen.getByLabelText('제목'), '매일 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-01-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '매일 진행되는 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 3. 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 4. 반복 설정
    await user.click(screen.getByLabelText('반복 일정'));

    // 5. 반복 설정 UI가 나타날 때까지 기다림
    await screen.findByText('반복 유형');

    // 6. 반복 유형 선택 (매일)
    await user.click(screen.getByText('반복 유형').closest('div')!.querySelector('div')!);
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 7. 반복 간격 입력
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');

    // 8. 종료일 입력
    await user.type(screen.getByLabelText('반복 종료일'), '2025-01-05');

    // 9. 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 10. 결과 확인 - 5개의 일정이 생성되어야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('매일 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-01')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-02')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-03')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-04')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-05')).toBeInTheDocument();

    // 11. 반복 아이콘도 표시되어야 함
    expect(eventList.getByText('🔄')).toBeInTheDocument();
  });

  // 2단계: 매주 반복 일정 생성 통합 테스트
  it('매주 반복 일정을 생성하면 같은 요일에 일정이 생성된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 1. 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 2. 기본 정보 입력
    await user.type(screen.getByLabelText('제목'), '주간 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-01-01'); // 수요일
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '주간 진행되는 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 3. 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 4. 반복 설정
    await user.click(screen.getByLabelText('반복 일정'));

    // 5. 반복 설정 UI가 나타날 때까지 기다림
    await screen.findByText('반복 유형');

    // 6. 반복 유형 선택 (매주)
    await user.click(screen.getByText('반복 유형').closest('div')!.querySelector('div')!);
    await user.click(screen.getByRole('option', { name: '매주' }));

    // 7. 반복 간격 입력
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');

    // 8. 종료일 입력
    await user.type(screen.getByLabelText('반복 종료일'), '2025-01-22');

    // 9. 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 10. 결과 확인 - 4개의 일정이 생성되어야 함 (수요일마다)
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('주간 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-01')).toBeInTheDocument(); // 수요일
    expect(eventList.getByText('2025-01-08')).toBeInTheDocument(); // 수요일
    expect(eventList.getByText('2025-01-15')).toBeInTheDocument(); // 수요일
    expect(eventList.getByText('2025-01-22')).toBeInTheDocument(); // 수요일

    // 11. 반복 아이콘도 표시되어야 함
    expect(eventList.getByText('📋')).toBeInTheDocument();
  });
});
