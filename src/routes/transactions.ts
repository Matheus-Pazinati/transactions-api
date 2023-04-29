import { FastifyInstance } from "fastify"
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionId } from "../middlewares/check-session-id"

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const TransactionRequestBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debt'])
    })

    const { title, amount, type } = TransactionRequestBodySchema.parse(request.body) 

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('transactions')
    .insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })
  
    return reply.status(201).send()
  })

  app.get('/', {preHandler: [checkSessionId]}, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
    .where('session_id', sessionId)
    .select()

    return { transactions }
  })

  app.get('/:id', {preHandler: [checkSessionId]}, async (request) => {
    const RequestParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = RequestParamsSchema.parse(request.params)
    const { sessionId } = request.cookies

    const transaction = await knex('transactions').where({
      session_id: sessionId,
      id
    }).first()

    return { transaction }
  })

  app.get('/summary', {preHandler: [checkSessionId]}, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('transactions')
      .select()
      .sum('amount', {
        as: 'amount'
      })
      .where('session_id', sessionId)
      .first()

    return { summary }
  })
}