import { describe, expect, it } from 'vitest';
import { romano, url } from '../../src/lib/url';

describe('url y numerales', () => {
  it('antepone la base del sitio y normaliza la barra inicial', () => {
    expect(url('/principios')).toBe('/principios');
    expect(url('principios')).toBe('/principios');
    expect(url()).toBe('/');
  });
  it.each([[1, 'I'], [4, 'IV'], [9, 'IX'], [12, 'XII'], [13, '13']])('%i → %s', (n, r) => expect(romano(n)).toBe(r));
});
