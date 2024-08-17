import ky from 'ky'

const TEST_API_BASE_URL = 'http://publichost.localhost:5508'

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
describe('[E2E] PATCH Requests', () => {
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  it('should send a PATCH request and receive the expected response', async () => {
    const response = await ky.patch(`${TEST_API_BASE_URL}/posts/1`, {
      json: {
        title: 'foo',
      },
    })

    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(response.status).toBe(200)
    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    expect(await response.json()).toEqual({
      id: 1,
      body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
      title: 'foo',
      userId: 1,
    })
  })
})
