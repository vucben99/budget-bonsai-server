import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User } from '../models/User'

let mongoDb: MongoMemoryServer

export const connect = async (): Promise<void> => {
  mongoDb = await MongoMemoryServer.create()
  const uri = mongoDb.getUri()
  mongoose.set('strictQuery', false)
  await mongoose.connect(uri)
}

export const cleanData = async (): Promise<void> => {
  await mongoose.connection.db.dropDatabase()
}

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect()
  await mongoDb.stop()
}

export const addTestUserToDB = async (): Promise<void> => {
  User.create({
    sub: '1234567890',
    email: 'john.doe@foobar.com',
    first_name: 'John',
    last_name: 'Doe',
    last_login: new Date(),
    transactions: []
  })
}