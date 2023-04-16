import request from 'supertest'
import {
  connect,
  cleanData,
  disconnect,
  addTestUserToDB as addTestUserToDB
} from '../mongodb-memory-server/mongodb.memory.test.helper'
import app from '../app'
import dotenv from 'dotenv'
dotenv.config()

describe('/api/transactions route', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  const FakeUserJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Ihqwpjj9-exyi9zupZ5mmam_E6cups5oDJ0LpJTp4Ho'

  test("POST method returns the created document of the authenticated user when sending correct data", async () => {
    // Given 
    const testData = {
      name: "Bread",
      amount: 500,
      type: "expense",
      currency: "HUF",
      category: "Food",
      date: "2023-04-15T15:23:00.000Z"
    }

    const token = FakeUserJWT

    // When 
    const response = await request(app).post("/api/transactions").send(testData).set({ "Authorization": `Bearer ${token}` })

    // Then
    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      name: "Bread",
      amount: 500,
      currency: "HUF",
      type: "expense",
      category: "Food",
      date: "2023-04-15T15:23:00.000Z",
      _id: expect.any(String)
    })
  })
})
