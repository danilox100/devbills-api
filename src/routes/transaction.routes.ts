import type { FastifyInstance } from 'fastify';
import zodToJsonSchema from 'zod-to-json-schema';

import createTransaction from '../controllers/transactions/createTransaction.controller';
import { deleteTransaction } from '../controllers/transactions/deleteTransaction.controller';
import { getHistoricalTransactions } from '../controllers/transactions/getHistoricalTransaction.controller';
import { getTransactionSummary } from '../controllers/transactions/getTransactionSummary.controller';
import { getTransactions } from '../controllers/transactions/getTransactions.controller';

import { authMiddleware } from '../middlewares/auth.middleaware';

import {
  createTransactionSchema,
  deleteTransactioSchema,
  getHistoricalTransactionSchema,
  getTransactionSchema,
  getTransactionSummarySchema,
} from '../schemas/transaction.schema';

const transactionRoutes = async (fastify: FastifyInstance) => {
  // 🔥 Aplica autenticação em TODAS as rotas
  fastify.addHook('preHandler', authMiddleware);

  // Criar transação
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: zodToJsonSchema(createTransactionSchema),
    },
    handler: createTransaction,
  });

  // Buscar transações
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: zodToJsonSchema(getTransactionSchema),
    },
    handler: getTransactions,
  });

  // Resumo
  fastify.route({
    method: 'GET',
    url: '/summary',
    schema: {
      querystring: zodToJsonSchema(getTransactionSummarySchema),
    },
    handler: getTransactionSummary,
  });

  // Histórico
  fastify.route({
    method: 'GET',
    url: '/historical',
    schema: {
      querystring: zodToJsonSchema(getHistoricalTransactionSchema),
    },
    handler: getHistoricalTransactions,
  });

  // Deletar
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: zodToJsonSchema(deleteTransactioSchema),
    },
    handler: deleteTransaction,
  });
};

export default transactionRoutes;
