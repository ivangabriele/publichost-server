import ky from 'ky'

const TEST_API_BASE_URL = 'http://publichost.localhost:5508'

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
describe('[E2E] PUT Requests', () => {
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  it('should send a PUT request and receive the expected response', async () => {
    const response = await ky.put(`${TEST_API_BASE_URL}/posts/1`, {
      json: {
        id: 1,
        body: 'bar',
        title: 'foo',
        userId: 1,
      },
    })

    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(response.status).toBe(200)
    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(await response.json()).toEqual({
      id: 1,
      body: 'bar',
      title: 'foo',
      userId: 1,
    })
  })
})
