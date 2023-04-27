import { test, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

beforeAll( async () => {
  await app.ready()
})

afterAll( async () => {
  await app.close()
})

test('should create new transaction', async () => {
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'Air Fryer',
      amount: 400,
      type: 'debt'
    })
    .expect(201)
})