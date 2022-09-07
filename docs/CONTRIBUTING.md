# Contributing

> Thank you for contributing. Contributions are always welcome, no matter how large or small.

## Table of Contents

- [Setup development environment](#setup-development-environment)
  - [Clone the Repository](#clone-repo)
  - [Install Dependencies](#install-dependencies)
  - [Prepare server database](#prepare-server-database)
- [Contribution flow](#contribution-flow)
- [File Structure](#file-structure)
- [Working with workspace](#working-with-workspace)

---

## Setup development environment <a id="setup-development-environment"></a>

### Clone the Repository <a id="clone-repo"></a>

```sh
git clone git@github.com:repo-name.git && cd repo-name
```

### Install Dependencies <a id="install-dependencies"></a>

```sh
# Install nx CLI globally
npm install -g @nrwl/nx

# Install dependencies
yarn install
```

### Prepare server database <a id="prepare-server-database"></a>

```sh
# Bootstrap session storage for shopify
touch apps/server/database.sqlite
```

---

## Contribution flow <a id="contribution-flow"></a>

- Create your branch from `main`.
- Ensure your [git commit messages follow the required format](STYLE_GUIDES.md#git-commit-messages).
- Ensure your scripts are well-formed, well-documented and object-oriented.
- Ensure your scripts are stateless and can be reused by all.
- Update your branch, and resolve any conflicts, before making pull request.
- Create pull request fill in [the required template](pull_request_template.md), name PR according to [PR naming convention](STYLE_GUIDES.md#git-pr-naming)
- Include screenshots and animated GIFs in your pull request whenever possible.
- Follow the [style guide](STYLE_GUIDES.md) [applicable to the language](STYLE_GUIDES.md#languages) or task.
- Include thoughtfully-worded, well-structured tests/specs. See the [Tests/Specs Style Guide](STYLE_GUIDES.md#tests).
- Document new code based on the [Documentation Style Guide](STYLE_GUIDES.md#documentation).
- End all files with a newline.

---

## Important Links <a id="important-links"></a>

- [Learn how to use Nx Workspace](https://nrwl.io/nx/guide-nx-workspace#creating-an-app)
- [Introduction to NX free course](https://nxplaybook.com/p/nx-workspaces)
- [Scale NX react development free course](https://egghead.io/courses/scale-react-development-with-nx-4038)

---

## File Structure <a id="file-structure"></a>

```treeview
google-shopify-crs/
├── apps/
├── libs/
├── tools/
├── workspace.json
├── nx.json
├── package.json
└── tsconfig.base.json
```

`/apps/` contains the application projects. This is the main entry point for a runnable application. We recommend keeping applications as light-weight as possible, with all the heavy lifting being done by libraries that are imported by each application.

`/libs/` contains the library projects. There are many kinds of libraries, and each library defines its own external API so that boundaries between libraries remain clear.

`/tools/` contains scripts that act on your code base. This could be database scripts, [custom executors](/executors/creating-custom-builders), or [workspace generators](/generators/workspace-generators).

`/workspace.json` lists every project in your workspace. (this file is optional)

`/nx.json` configures the Nx CLI itself. It tells Nx what needs to be cached, how to run tasks etc.

`/tsconfig.base.json` sets up the global TypeScript settings and creates aliases for each library to aid when creating TS/JS imports.

---

## Coding rules <a id="coding-rules"></a>

- [Branch naming guidelines](STYLE_GUIDES.md#git-branch-naming)
- [Commit message guidelines](STYLE_GUIDES.md#git-commit-messages)
- [Documentation](STYLE_GUIDES.md#documentation)
- [Lint](STYLE_GUIDES.md#lint)
- [Source Code](STYLE_GUIDES.md#source-code)
- [Tests/Specs](STYLE_GUIDES.md#tests)

---

## Working with workspace <a id="working-with-workspace"></a>

### Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [React](https://reactjs.org)
  - `yarn add -D @nrwl/react`
- Web (no framework frontends)
  - `yarn add -D @nrwl/web`
- [Angular](https://angular.io)
  - `yarn add -D @nrwl/angular`
- [Nest](https://nestjs.com)
  - `yarn add -D @nrwl/nest`
- [Express](https://expressjs.com)
  - `yarn add -D @nrwl/express`
- [Node](https://nodejs.org)
  - `yarn add -D @nrwl/node`

There are also many [community plugins](https://nx.dev/community) you could add.

### Generate an application

Run `nx g @nrwl/react:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generate a library

Run `nx g @nrwl/react:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@google-shopify-crs/mylib`.

### Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.

### Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

### Running end-to-end tests

Run `nx e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

### Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.

### Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

---

#### Happy coding!
