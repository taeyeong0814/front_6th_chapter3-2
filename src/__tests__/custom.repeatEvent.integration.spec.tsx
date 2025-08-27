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

  // 1단계: 기본 일정 생성 테스트 (반복 없이)
  it('기본 일정을 생성하면 일정 목록에 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '테스트 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 회의입니다',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('테스트 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-01-01')).toBeInTheDocument();
    expect(eventList.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(eventList.getByText('테스트 회의입니다')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  // 2단계: 반복 체크박스 활성화 테스트
  it('반복 체크박스를 클릭하면 반복 설정 UI가 나타난다', async () => {
    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 체크박스 클릭
    await user.click(screen.getByLabelText('반복 일정'));

    // 반복 설정 UI가 나타나는지 확인
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
    expect(screen.getByText('반복 간격')).toBeInTheDocument();
    expect(screen.getByText('반복 종료일')).toBeInTheDocument();
  });
});
