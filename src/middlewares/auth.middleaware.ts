import type { FastifyReply, FastifyRequest } from 'fastify';
import admin from 'firebase-admin';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const authHeader = request.headers.authorization;

  console.log('====================');
  console.log('HEADER RAW:', authHeader);

  if (!authHeader) {
    console.log('❌ SEM HEADER');
    await reply.code(401).send({ error: 'Token not provided' });
    return;
  }

  const parts = authHeader.split(' ');

  console.log('PARTS:', parts);

  if (parts.length !== 2) {
    console.log('❌ HEADER MAL FORMADO');
    await reply.code(401).send({ error: 'Invalid token format' });
    return;
  }

  const [scheme, token] = parts;

  if (scheme !== 'Bearer') {
    console.log('❌ NÃO É BEARER');
    await reply.code(401).send({ error: 'Invalid auth scheme' });
    return;
  }

  console.log('TOKEN EXTRAÍDO:', token);

  if (!token || token.length < 100) {
    console.log('❌ TOKEN INVÁLIDO OU INCOMPLETO');
    await reply.code(401).send({ error: 'Invalid token (too short)' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 🔥 ESSENCIAL — agora o controller vai funcionar
    request.userId = decodedToken.uid;

    console.log('✅ TOKEN VÁLIDO');
    console.log('USER UID:', decodedToken.uid);
  } catch (err) {
    console.error('❌ ERRO AO VALIDAR TOKEN:', err);
    await reply.code(401).send({ error: 'Invalid token' });
    return;
  }

  console.log('====================');
};
