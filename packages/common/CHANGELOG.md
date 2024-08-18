## [1.1.1](https://github.com/ivangabriele/publichost/compare/v1.1.0...v1.1.1) (2024-08-18)

### Documentation

- **readme:** add NPM badge ([b0ad4e5](https://github.com/ivangabriele/publichost/commit/b0ad4e5accc00ff18473c017343b6c3d6dfbb107))
- **readme:** fix typo ([e358854](https://github.com/ivangabriele/publichost/commit/e358854c4b999115018800ca75325884cd4bfaef))

## [1.1.0](https://github.com/ivangabriele/publichost/compare/v1.0.3...v1.1.0) (2024-08-17)

### Features

- **client:** add API key setup ([bd32c34](https://github.com/ivangabriele/publichost/commit/bd32c3409db1d003c3294b2085c0cc90af077101))
- handle requests & responses concurrency ([2e568c1](https://github.com/ivangabriele/publichost/commit/2e568c120e1150b74218778bd20ef52b7eee3c5c))
- **server:** add basic API_KEY authorization mechanism ([f322329](https://github.com/ivangabriele/publichost/commit/f3223295dc2f99aa831e749a5e09a2c4da0a583f))
- **server:** add more logs ([b01a5f2](https://github.com/ivangabriele/publichost/commit/b01a5f23d8a99da0d453e30e614ad1fbf254d488))
- **server:** add welcome page ([b9dc3fd](https://github.com/ivangabriele/publichost/commit/b9dc3fde5afae545f61c32e69463b58d40b8260f))
- **server:** disable wrong defer in koa static ([6a65383](https://github.com/ivangabriele/publichost/commit/6a65383307b769dba88f6467a3ee35d8c906f6ba))
- **server:** fix x-api-key case ([1516737](https://github.com/ivangabriele/publichost/commit/151673709a6feb1413ac674e88ae391f79d87c75))
- **server:** improve wrong domain name logging ([d4e46cd](https://github.com/ivangabriele/publichost/commit/d4e46cd8c3bc7930d349b5c1710bc159168e2521))
- **server:** limit ping-pong events loop to registered clients ([7d04ce6](https://github.com/ivangabriele/publichost/commit/7d04ce684a087f96c5487b843558a62c1e8e6820))
- **server:** reject HTTP requests not matching base domain ([2fab9ce](https://github.com/ivangabriele/publichost/commit/2fab9ce862a238e68c11de068e5fc77c770dc845))
- **server:** simplify public files handling ([b6b9950](https://github.com/ivangabriele/publichost/commit/b6b99500c3ee821ba99a04e36c7ee1941015da35))

### Bug Fixes

- **client:** clean host header from server request tunnel ([c2f3c13](https://github.com/ivangabriele/publichost/commit/c2f3c1315ab6be08161bc99e8d36d4c4f0077d87))
- **server:** add missing return in subdomain request handler rejection ([6202f96](https://github.com/ivangabriele/publichost/commit/6202f964218a08ac0c526c7e61af8c306a10d238))
- **server:** add request body parser ([6872af2](https://github.com/ivangabriele/publichost/commit/6872af29bba9d86902e0a2fccf73e2627ddd519e))
- **server:** fix & simplify body tunneling ([6f01795](https://github.com/ivangabriele/publichost/commit/6f01795de3cd2342464af3b735aad19f1c8341bb))
- **server:** fix port env var ([e8c53ac](https://github.com/ivangabriele/publichost/commit/e8c53ac424e6cdf5318dccf55c644bcb58763d51))
- **server:** fix welome page status code ([f9a7fa1](https://github.com/ivangabriele/publichost/commit/f9a7fa10ad28d77c69d7dff79c8510cdc7fbfbba))
- **server:** fix wrong domain condition ([e7a889c](https://github.com/ivangabriele/publichost/commit/e7a889c65457c55868a315ee14048b34174330ec))
- **server:** separate base domain from subdomain routing concerns ([f91e736](https://github.com/ivangabriele/publichost/commit/f91e7363749d0e663dd221000a4df727f5dab9c9))
- **server:** skip domain requests in subdomain request handler ([a9f8c1b](https://github.com/ivangabriele/publichost/commit/a9f8c1bd1284f8765a47c00e54361d022ad27c8c))

### Documentation

- **readme:** add badges ([479135e](https://github.com/ivangabriele/publichost/commit/479135eace363df96d0e43941ba9eb5341be8542))
- **readme:** update header ([a831045](https://github.com/ivangabriele/publichost/commit/a831045fa09d9ff4f441bcfc1824672d7e15dc9b))

### Styles

- **server:** add favicon ([68e3ddd](https://github.com/ivangabriele/publichost/commit/68e3ddd5e828b866d54cf3e940fabd3a1ec629f3))

### Code Refactoring

- **server:** split index code into middlewares ([0dcc712](https://github.com/ivangabriele/publichost/commit/0dcc712c5383ce0dde4faffeadb97f9a4f7a230d))

## [1.0.3](https://github.com/ivangabriele/publichost/compare/v1.0.2...v1.0.3) (2024-08-16)

### Bug Fixes

- **client:** add missing wss scheme to server url ([335e681](https://github.com/ivangabriele/publichost/commit/335e6815242bcc3a3ecaa6ba84a8906869dab8c3))
- keep connection alive via ping-pong events ([e1ac430](https://github.com/ivangabriele/publichost/commit/e1ac43037cb677a609c0a61b4678a668134ec6bd))

### Build System

- **npm:** clean bin path ([3daec12](https://github.com/ivangabriele/publichost/commit/3daec120fef982f842bccef601b5e58fca686ad1))

## [1.0.2](https://github.com/ivangabriele/publichost/compare/v1.0.1...v1.0.2) (2024-08-16)

### Bug Fixes

- **client:** use fs-extra/esm import ([2f2c1eb](https://github.com/ivangabriele/publichost/commit/2f2c1eb6ebf3db98731f2038e0b38b9416b6f78f))

## [1.0.1](https://github.com/ivangabriele/publichost/compare/v1.0.0...v1.0.1) (2024-08-16)

### Bug Fixes

- **client:** import all from CJS fs-extra dependency ([264f060](https://github.com/ivangabriele/publichost/commit/264f06066dd9a3e002a355ac8cae5b5e336cedc9))

## 1.0.0 (2024-08-16)

### Features

- finalize first server & client draft ([87d245c](https://github.com/ivangabriele/publichost/commit/87d245c58ebce770aa3118269a4d7aad9b038e44))
- initialize project ([c301f46](https://github.com/ivangabriele/publichost/commit/c301f46f7a3b7df3daec22dde35818b9a80e7f19))
- prepare first release ([d600668](https://github.com/ivangabriele/publichost/commit/d6006681181bce8884bb8848de29952c2d5158f4))

### Build System

- **tsup:** setup build & bundling ([b2b04fe](https://github.com/ivangabriele/publichost/commit/b2b04fe165f4aae3bdbc9bf77ccedcd12f6cf9a8))
- **yarn:** update lockfile ([473b59b](https://github.com/ivangabriele/publichost/commit/473b59bfff9dd67fd80c1e07abc97b08877f6d1d))
