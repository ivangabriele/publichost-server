import ky from 'ky'

const TEST_API_BASE_URL = 'http://publichost.localhost:5508'

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
describe('[E2E] DELETE Requests', () => {
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  it('should send a DELETE request and receive the expected response', async () => {
    const response = await ky.delete(`${TEST_API_BASE_URL}/posts/1`)

    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(response.status).toBe(200)
    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(await response.json()).toEqual({})
  })
})
