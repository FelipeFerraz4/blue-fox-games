import { Socket } from 'socket.io';

/**
 * IP do cliente de um socket. Atrás do reverse proxy, `handshake.address` é sempre o IP do proxy,
 * então com TRUST_PROXY=true usamos o ÚLTIMO item do X-Forwarded-For (o que o nosso proxy acrescentou;
 * os anteriores vêm do cliente e podem ser forjados). Só ligue TRUST_PROXY se o container não for
 * acessível sem passar pelo proxy.
 */
export function clientIp(socket: Socket): string {
  if (process.env.TRUST_PROXY === 'true') {
    const header = socket.handshake.headers['x-forwarded-for'];
    const value = Array.isArray(header) ? header.join(',') : header;
    const last = value?.split(',').map((ip) => ip.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return socket.handshake.address;
}
