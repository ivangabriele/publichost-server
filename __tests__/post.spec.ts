import ky from 'ky'

const TEST_API_BASE_URL = 'http://publichost.localhost:5508'

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
describe('[E2E] POST Requests', () => {
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  it('should send a POST request and receive the expected response', async () => {
    const response = await ky.post(`${TEST_API_BASE_URL}/posts`, {
      json: {
        body: 'bar',
        title: 'foo',
        userId: 1,
      },
      retry: 0,
    })

    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(response.status).toBe(201)
    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(await response.json()).toEqual({
      id: 101,
      body: 'bar',
      title: 'foo',
      userId: 1,
    })
  })
})
