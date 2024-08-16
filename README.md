# PublicHost Server & Client

Tunneling subdomains to your localhost applications. Like [ngrok](https://ngrok.com) but open source and free.

---

> [!NOTE]  
> This is a work in progress.

---

## How it works

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Server as PublicHost Server
    participant Client as PublicHost Client
    participant App as Local Application (localhost:8080)

    User->>Server: 1. HTTP Request (GET /hi) to http://default.localhost:3000/hi
    Server->>Client: 2. Forward request via WebSocket
    Client->>App: 3. Forward request to http://localhost:8080/hi
    App->>Client: 4. Local Application processes and sends response
    Client->>Server: 5. Forward response via WebSocket
    Server->>User: 6. HTTP Response (200 OK)
```
