import { knex as setupKnex, Knex } from 'knex'
import 'dot/config'

if (!process.env.DATABASE_URL){
  throw new Error('Enviroment Variable DATABASE_URL not found.')
}
export const knexConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: process.env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations'
  }
}

export const knex = setupKnex(knexConfig)