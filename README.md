<p align="center">
  <img alt="FirePT Logo" height="128" src="https://raw.githubusercontent.com/ivangabriele/publichost/main/packages/server/public/logo.1.png" />
</p>
<h1 align="center">PublicHost</h1>
<h3 align="center">Tunneling subdomains to your localhost applications.</h3>
<p align="center">
  <a href="https://www.npmjs.com/package/publichost">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/publichost?style=for-the-badge" />
  </a>
  <a href="https://github.com/ivangabriele/publichost/blob/main/LICENSE">
    <img alt="AGPL-3.0 license" src="https://img.shields.io/github/license/ivangabriele/publichost?style=for-the-badge&labelColor=000">
  </a>
  <a href="https://github.com/ivangabriele/publichost/actions?query=branch%3Amain+workflow%3ACheck">
    <img alt="CI Check Workflow" src="https://img.shields.io/github/actions/workflow/status/ivangabriele/publichost/check.yml?branch=main&label=Check&style=for-the-badge&labelColor=000">
  </a>
  <a href="https://github.com/ivangabriele/publichost/actions?query=branch%3Amain+workflow%3AE2E">
    <img alt="CI E2E Workflow" src="https://img.shields.io/github/actions/workflow/status/ivangabriele/publichost/e2e.yml?branch=main&label=E2E&style=for-the-badge&labelColor=000">
  </a>
</p>

---

- [Why PublicHost?](#why-publichost)
- [Features](#features)
- [How it works](#how-it-works)
- [Installation](#installation)
  - [CLI](#cli)
  - [Usage](#usage)
  - [Node.js SDK](#nodejs-sdk)
    - [Koa Example](#koa-example)
  - [Express Example](#express-example)

---

## Why PublicHost?

Because [ngrok](https://ngrok.com) but open-source and free.

## Features

- [x] PublicHost Server
  - [x] Basic API Key Authentication
- [x] PublicHost Client
  - [x] CLI commands
  - [x] Node.js SDK

## How it works

**To be updated.**

<!-- ```mermaid
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
``` -->

## Installation

### CLI

```sh
npm install -g publichost
```

### Usage

```sh
ph --help
```

### Node.js SDK

```sh
npm install -E publichost
```

#### Koa Example

```ts
import Koa from 'koa'

const { PORT, PUBLICHOST_API_KEY, PUBLICHOST_HOST, PUBLICHOST_SUBDOMAIN } = process.env

const app = new Koa()

app.listen(PORT, () => {
  console.info('[My Amazing Localhost App]', `Server listening on port ${PORT}.`)

  startPublicHost(PUBLICHOST_HOST, PUBLICHOST_SUBDOMAIN, PUBLICHOST_API_KEY, {
    localhostAppPort: PORT,
  })
})
```

### Express Example

```ts
import express from 'express'

const { PORT, PUBLICHOST_API_KEY, PUBLICHOST_HOST, PUBLICHOST_SUBDOMAIN } = process.env

const app = express()

app.listen(PORT, () => {
  console.info('[My Amazing Localhost App]', `Server listening on port ${PORT}.`)

  startPublicHost(PUBLICHOST_HOST, PUBLICHOST_SUBDOMAIN, PUBLICHOST_API_KEY, {
    localhostAppPort: PORT,
  })
})
```
