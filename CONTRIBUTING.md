# Contributing

## Local Development

```sh
yarn
yarn dev:setup
yarn dev
```

## Local Development with a remote PublicHost Server

```sh
yarn
# Be careful to set the `-w` flag to the root path,
# otherwise the auto-detected workspace path will be within the `packages/client` directory
yarn start:client init example.org your_subdomain YOUR_API_KEY -w /path/to/your/publichost/root
yarn dev-remote
```
