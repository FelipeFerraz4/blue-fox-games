/**
 * Limitador por chave (ex.: IP) com janela deslizante, em memória.
 * TS puro, sem Nest, para ser testável com Jest. Como as salas, vale para uma instância só.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Registra uma tentativa e diz se ela está dentro do limite. */
  tryConsume(key: string): boolean {
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** Remove chaves sem tentativas na janela atual, para o Map não crescer sem fim. */
  prune(): void {
    const now = this.now();
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= this.windowMs)) this.hits.delete(key);
    }
  }
}
