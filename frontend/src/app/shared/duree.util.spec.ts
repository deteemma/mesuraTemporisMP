import { formatDuree, formatSecondesHHMMSS } from './duree.util';

describe('formatSecondesHHMMSS', () => {
  it('zero-padde les secondes en dessous de 10', () => {
    expect(formatSecondesHHMMSS(5)).toBe('00:00:05');
  });

  it('formate 0 seconde', () => {
    expect(formatSecondesHHMMSS(0)).toBe('00:00:00');
  });

  it('formate une durée sous la minute', () => {
    expect(formatSecondesHHMMSS(45)).toBe('00:00:45');
  });

  it('formate une durée pile sur la minute', () => {
    expect(formatSecondesHHMMSS(60)).toBe('00:01:00');
  });

  it('formate une durée sous l\'heure', () => {
    expect(formatSecondesHHMMSS(5 * 60 + 12)).toBe('00:05:12');
  });

  it('formate une durée pile sur l\'heure', () => {
    expect(formatSecondesHHMMSS(3600)).toBe('01:00:00');
  });

  it('formate une durée au-dessus d\'une heure', () => {
    expect(formatSecondesHHMMSS(2 * 3600 + 15 * 60 + 42)).toBe('02:15:42');
  });

  it('ne plafonne pas à 24h : un cumul de 27h15m42s reste "27:15:42"', () => {
    expect(formatSecondesHHMMSS(27 * 3600 + 15 * 60 + 42)).toBe('27:15:42');
  });
});

describe('formatDuree', () => {
  it('formate la durée écoulée au format hh:mm:ss zero-paddé', () => {
    expect(formatDuree('2026-01-05T09:00:00.000Z', '2026-01-05T09:05:00.000Z')).toBe('00:05:00');
  });

  it('conserve une précision à la seconde exacte, sans arrondi à la minute', () => {
    expect(formatDuree('2026-01-05T09:00:00.000Z', '2026-01-05T09:00:42.000Z')).toBe('00:00:42');
  });

  it('formate une durée écoulée au-delà d\'une heure', () => {
    expect(formatDuree('2026-01-05T09:00:00.000Z', '2026-01-05T11:15:30.000Z')).toBe('02:15:30');
  });
});
