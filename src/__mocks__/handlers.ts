import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return HttpResponse.json({ ...events[index], ...updatedEvent });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // 반복 일정 일괄 처리
  http.post('/api/events-list', async ({ request }) => {
    const { events: newEvents } = (await request.json()) as { events: Event[] };
    const repeatId = String(Date.now());

    const processedEvents = newEvents.map((event, index) => {
      const isRepeatEvent = event.repeat.type !== 'none';
      return {
        ...event,
        id: String(events.length + index + 1),
        repeat: {
          ...event.repeat,
          id: isRepeatEvent ? repeatId : undefined,
        },
      };
    });

    // 실제로 events 배열에 추가
    events.push(...processedEvents);
    return HttpResponse.json(processedEvents, { status: 201 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const { events: updatedEvents } = (await request.json()) as { events: Event[] };

    // 실제로 events 배열을 업데이트
    updatedEvents.forEach((updatedEvent) => {
      const index = events.findIndex((event) => event.id === updatedEvent.id);
      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
      }
    });

    return HttpResponse.json(updatedEvents);
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const { eventIds } = (await request.json()) as { eventIds: string[] };

    // 실제로 events 배열에서 해당 ID들을 제거
    const initialLength = events.length;
    for (let i = events.length - 1; i >= 0; i--) {
      if (eventIds.includes(events[i].id)) {
        events.splice(i, 1);
      }
    }

    console.log(`Deleted ${initialLength - events.length} events`);
    return new HttpResponse(null, { status: 204 });
  }),
];
