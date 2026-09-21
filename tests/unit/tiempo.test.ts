import { describe, expect, it } from 'vitest';
import { fechaEnColombia, formatoHora, horaEnColombia, momentoDelDia } from '../../src/lib/tiempo';

describe('hora civil de Colombia (UTC−5)', () => {
  it('la fecha cambia a medianoche de Colombia, no de UTC', () => {
    expect(fechaEnColombia(new Date('2026-09-22T04:59:00Z'))).toBe('2026-09-21');
    expect(fechaEnColombia(new Date('2026-09-22T05:00:00Z'))).toBe('2026-09-22');
  });
  it('hora decimal con minutos', () => expect(horaEnColombia(new Date('2026-09-21T13:30:00Z'))).toBe(8.5));
  it('medianoche es 0, no 24', () => expect(horaEnColombia(new Date('2026-09-22T05:00:00Z'))).toBe(0));
});

describe('momento del día', () => {
  it.each([[0, 'noche'], [4.99, 'noche'], [5, 'manana'], [11.99, 'manana'], [12, 'tarde'], [17.99, 'tarde'], [18, 'noche'], [23.5, 'noche']])(
    '%s h → %s', (h, m) => expect(momentoDelDia(h)).toBe(m));
});

describe('formatoHora', () => {
  it.each([[8.5, '08:30'], [0, '00:00'], [13 + 5 / 60, '13:05'], [23 + 59.6 / 60, '00:00'], [9 + 59.4 / 60, '09:59']])('%s → %s', (h, t) =>
    expect(formatoHora(h)).toBe(t));
});
