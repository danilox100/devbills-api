import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3001),
  DATABASE_URL: z.string().min(6, 'DATABASE_URL Obrigatório'),
  NODE_ENV: z.enum(['dev', 'test', 'prod'], {
    message: 'NODE_ENV deve ser dev, test ou prod',
  }),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Variáveis de ambiente inválidas:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
