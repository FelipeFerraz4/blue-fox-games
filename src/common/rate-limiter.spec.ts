import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let now: number;
  const clock = () => now;

  beforeEach(() => {
    now = 0;
  });

  it('permite até o limite dentro da janela e bloqueia o excedente', () => {
    const limiter = new RateLimiter(3, 1000, clock);
    expect([1, 2, 3].map(() => limiter.tryConsume('a'))).toEqual([true, true, true]);
    expect(limiter.tryConsume('a')).toBe(false);
  });

  it('conta cada chave separadamente', () => {
    const limiter = new RateLimiter(1, 1000, clock);
    expect(limiter.tryConsume('a')).toBe(true);
    expect(limiter.tryConsume('b')).toBe(true);
    expect(limiter.tryConsume('a')).toBe(false);
  });

  it('libera de novo quando as tentativas antigas saem da janela', () => {
    const limiter = new RateLimiter(2, 1000, clock);
    limiter.tryConsume('a');
    now = 500;
    limiter.tryConsume('a');
    expect(limiter.tryConsume('a')).toBe(false);
    now = 1000;
    expect(limiter.tryConsume('a')).toBe(true);
  });

  it('tentativas bloqueadas não estendem o bloqueio', () => {
    const limiter = new RateLimiter(1, 1000, clock);
    limiter.tryConsume('a');
    now = 900;
    expect(limiter.tryConsume('a')).toBe(false);
    now = 1000;
    expect(limiter.tryConsume('a')).toBe(true);
  });

  it('prune remove só as chaves sem tentativas recentes', () => {
    const limiter = new RateLimiter(1, 1000, clock);
    limiter.tryConsume('old');
    now = 800;
    limiter.tryConsume('new');
    now = 1200;
    limiter.prune();
    expect(limiter.tryConsume('old')).toBe(true);
    expect(limiter.tryConsume('new')).toBe(false);
  });
});
