import supertest from "supertest"
import dotenv from "dotenv"
import app from "../app"
jest.mock("../api/google")
import { getIdToken } from "../api/google"

dotenv.config()

const request = supertest(app)

describe("Login route", () => {
  it("should send back status 400 when empty object is sent", async () => {
    // Given
    const testData = {}

    // When
    const response = await request.post("/api/login").send(testData)

    // Then
    expect(response.status).toBe(400)
  })

  it("should send back status 401 when wrong auth code is sent", async () => {
    // Given
    const testData = { code: "fake_code" }

    // When
    const response = await request.post("/api/login").send(testData)

    // Then
    expect(response.status).toBe(401)
  })

  it("should send back a valid mocked id_token when valid auth code is sent", async () => {
    // Given
    const mockedGetIdToken = jest.mocked(getIdToken)
    mockedGetIdToken.mockResolvedValueOnce("mocked id_token")
    const testData = "mocked auth code"

    // When
    const response = await getIdToken(testData)

    // Then
    expect(response).toBe("mocked id_token")
  })
})