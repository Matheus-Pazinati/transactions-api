import { FastifyInstance } from "fastify"
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const TransactionRequestBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debt'])
    })

    const { title, amount, type } = TransactionRequestBodySchema.parse(request.body) 

    await knex('transactions')
    .insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1
    })
  
    return reply.status(201).send()
  })

  app.get('/', async () => {
    const transations = await knex('transactions').select()

    return { transations }
  })

  app.get('/:id', async (request) => {
    const RequestParamsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = RequestParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()

    return { transaction }
  })
}