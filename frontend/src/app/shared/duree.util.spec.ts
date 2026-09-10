import { formatDuree, formatMinutesHHMM } from './duree.util';

describe('formatMinutesHHMM', () => {
  it('zero-padde les minutes en dessous de 10', () => {
    expect(formatMinutesHHMM(5)).toBe('00:05');
  });

  it('formate 0 minute', () => {
    expect(formatMinutesHHMM(0)).toBe('00:00');
  });

  it('formate une durée sous l\'heure', () => {
    expect(formatMinutesHHMM(45)).toBe('00:45');
  });

  it('formate une durée pile sur l\'heure', () => {
    expect(formatMinutesHHMM(60)).toBe('01:00');
  });

  it('formate une durée au-dessus d\'une heure', () => {
    expect(formatMinutesHHMM(135)).toBe('02:15');
  });

  it('ne plafonne pas à 24h : un cumul de 27h15 reste "27:15"', () => {
    expect(formatMinutesHHMM(27 * 60 + 15)).toBe('27:15');
  });
});

describe('formatDuree', () => {
  it('formate la durée écoulée au format hh:mm zero-paddé', () => {
    expect(formatDuree('2026-01-05T09:00:00.000Z', '2026-01-05T09:05:00.000Z')).toBe('00:05');
  });

  it('formate une durée écoulée au-delà d\'une heure', () => {
    expect(formatDuree('2026-01-05T09:00:00.000Z', '2026-01-05T11:15:00.000Z')).toBe('02:15');
  });
});
