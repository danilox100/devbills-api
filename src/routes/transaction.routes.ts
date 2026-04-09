import type { FastifyInstance } from 'fastify';
import zodToJsonSchema from 'zod-to-json-schema';
import createTransaction from '../controllers/transactions/createTransaction.controller';
import { deleteTransaction } from '../controllers/transactions/deleteTransaction.controller';
import { getTransactionSummary } from '../controllers/transactions/getTransactionSummary.controller';
import { getTransactions } from '../controllers/transactions/getTransactions.controller';
import { authMiddleware } from '../middlewares/auth.middleaware';
import {
  createTransactionSchema,
  deleteTransactioSchema,
  getTransactionSchema,
  getTransactionSummarySchema,
} from '../schemas/transaction.schema';

const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', authMiddleware);

  //Criação
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: zodToJsonSchema(createTransactionSchema),
    },
    handler: createTransaction,
  });

  //Buscar com filtros
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: zodToJsonSchema(getTransactionSchema),
    },
    handler: getTransactions,
  });

  //Buscar o resumo
  fastify.route({
    method: 'GET',
    url: '/summary',
    schema: {
      querystring: zodToJsonSchema(getTransactionSummarySchema),
    },
    handler: getTransactionSummary,
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
