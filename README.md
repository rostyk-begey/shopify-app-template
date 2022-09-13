# Shopify App Template | NX - Nest - React Vite

> This is a template for embedded Shopify apps. <br/>
> Build on top of NX with Nest as a server framework and React with Vite as frontend option.

Found a bug? Please create an issue! ❤️

## Table of Contents

- ✨ Features
- 👀 Requirements
- 🤓 Getting Started

## ✨ Features

- 📝 TypeScript
- 🦾 [NX](https://nx.dev/) - Smart, Fast and Extensible Build System
- ⚡ [Nest](https://nestjs.com/) - A progressive Node.js framework
- 🥷 React with [Vite](https://vitejs.dev/)
- 💫 [React Query](https://react-query.tanstack.com)
- 📄 File based routing
- 🔑 Works with Shopify CLI 3.0
- 📦️ Dockerfile
- 🚨 Code quality tools
  - eslint
  - prettier
  - commitlint
  - lintstaged
  - husky with _pre-commit_ and _commit-msg_ hooks

## 👀 Requirements

- Shopify Partner Account
- Shopify Dev Store
- Ngrok account

## 🤓 Getting Started

- Click `Use this template` or [this link](https://github.com/rostyk-begey/shopify-app-template/generate)
- Create an App in your Shopify Partner Account
  - Set https://localhost as the App Url for now
- Fill out your `shopify.app.toml` file
  - `name`: The Shopify App name
  - `scopes`: The [access scopes](https://shopify.dev/api/usage/access-scopes) your app needs
- Run `yarn install`
- Run `yarn start`
- Your apps ngrok url will be printed to the terminal
- Install the app to your dev store
