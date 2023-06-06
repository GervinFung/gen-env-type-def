# gen-env-type-def

Initially, I found myself type guarding environment variables either as `process.env.SOMETHING` or `import.meta.env.SOMETHING`, treating them as generic strings. However, I realized that I could go beyond just basic type safety and ensure the correct import of environment variables in production. Instead of writing individual type guards, I decided to create a function that generates specific types for each environment variable, using discriminated unions for enhanced type safety. This approach not only provides compile-time type checking but also guarantees runtime safety.

But that's not all. I encountered a different way of importing environment variables while using Vite. Instead of using `process.env.SOMETHING`, Vite uses `import.meta.env.SOMETHING`, requiring a different type definition.

During my search for tools that handle this task, I came across ["gen-env-types"](https://github.com/benawad/gen-env-types) by Ben Awad, which does a great job. However, I found it lacking in generating discriminated union types based on different environment variables across multiple files and limited to only process.env. I desired a tool that could fulfill both requirements.

That's why I developed this tool – to provide the following capabilities:

1. Generate discriminated union types based on different environment variables across multiple files.
2. Support for both process.env and import.meta.env.

With this tool, you can ensure type safety, handle various environment variables, and streamline your development process.

# Feature

The gen-env-type-def tool is designed to generate type definitions based on different `.env*` files. To use it, simply specify the directory where the type definitions should be generated. Additionally, you can choose whether to generate types for `process.env` or `import.meta.env`.

With `gen-env-type-def`, you have the flexibility to provide different input configurations for each directory, allowing you to generate specific type definitions for various environments or configurations within your project.

By leveraging this tool, you can effortlessly generate precise and thorough type definitions for your environment variables. This enhances type safety and enables smooth integration with your development workflow, ensuring a seamless and reliable environment for your project.

# Usage

#### API

Given root dir has arbitary set of environment variables in

.env.development

```
NODE_ENV=development
REQUIRED_IN_DEV_ONLY="true"
ORIGIN=http://localhost:3000
TIME_OUT=0
```

.env.production

```
NODE_ENV=production
ORIGIN=https://arkham.io
TIME_OUT=2_000_000
```

and that of <root_dir>/backend in

.env.development

```
DIR=backend-dev
REPOSITORY_PROVIDER=github
```

.env.production

```
DIR=backend-pro
REPOSITORY_PROVIDER=gitlab
```

Use `gen-env-type-def` like the following

```ts
import { genEnvTypeDef } from 'gen-env-type-def'

genEnvTypeDef([{
    inDir: __dirname // root dir,
    envType: 'import.meta.env',
    outDir: `${__dirname}/typing` // defaults to inDir
}, {
    inDir: `${__dirname}/backend` // backend,
    envType: 'process.env',
}])
```

Will generate `env.d.ts` in <root_dir>/backend and root dir

in root dir, it's

```js
`${root_dir}/env.d.ts`;
```

```ts
interface ImportMetaEnv {
    readonly NODE_ENV: 'development' | 'production' | 'staging' | 'testing';
    readonly REQUIRED_IN_DEV_ONLY?: 'true';
    readonly ORIGIN: 'http://localhost:3000' | 'https://arkham.io';
    readonly TIME_OUT?: '0' | '2_000_000';
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
```

backend, it's

```js
`${root_dir}/backend/env.d.ts`;
```

```ts
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            readonly DIR: 'backend-dev' | 'backend-pro';
            readonly REPOSITORY_PROVIDER: 'github' | 'gitlab';
        }
    }
}
```

At this stage, I trust that I have effectively conveyed the benefits and capabilities of using `gen-env-type-def` to generate type definitions for environment variables. This tool empowers developers to ensure type safety and seamless integration with their development workflow by automatically generating accurate and comprehensive type definitions based on environment variable configurations

# Contributions

I appreciate your active participation in the development process. If you come across any bugs, have feature requests, or need clarification on any aspect of the project, please don't hesitate to open an issue.

Additionally, your contributions to the project are highly valued. If you have ideas or improvements that you would like to implement, I invite you to suggest a pull request. Simply fork the repository, make the necessary code changes, add relevant tests to ensure quality, and push your changes.

Your feedback and contributions play an essential role in making the project better, and I am grateful for your involvement. Thank you for your support and participation in the development of the project.
