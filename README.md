# gen-env-type-def

A tool that generates types based on the value of each environment variable, using union type for enhanced type safety. This approach not only provides compile-time type checking but also guarantees runtime safety (unless there are dynamically generated environment variables that are not specified in `.env*` files)

1. Generate union types based on different environment variables across multiple files.
2. Support for both process.env and import.meta.env.

# Feature

Specify the directory where the type definitions should be generated. Additionally, you can choose whether to generate types for `process.env` or `import.meta.env`.

With this tool, you have the flexibility to provide different input configurations for each directory, allowing you to generate specific type definitions for various environments or configurations within your project.

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

Additionally, you can also generate generic string type while keeping the type specified in environment files by doing so

.env

```
// other environment variables
RANDOM_ENV=yes
```

```ts
import { genEnvTypeDef } from 'gen-env-type-def';

genEnvTypeDef([
	{
		inDir: 'some-directory',
		envType: 'import.meta.env',
		allowStringType: {
			for: 'some', // all/some
			case: 'include', // include/exclude listed variables
			variables: ['RANDOM_ENV'],
		},
	},
]);
```

Will generate the following output

```ts
interface ImportMetaEnv {
	// other environment variables
	RANDOM_ENV: 'yes' | (string & {});
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
```

This is useful in scenarios where you have environment files like `.env.development`, `.env.test`, and `.env.production`, but you do not wish to commit `.env.production`. However, you have code that depends on this environment file, such as:

```ts
if (process.env.MODE === 'prodution') {
	// do something
}
```

In a CI/CD pipeline, this setup may fail depending on your ESLint or TypeScript configuration, as the only available types for MODE are `development` and `test`.

At this stage, I trust that I have effectively conveyed the benefits and capabilities of using `gen-env-type-def` to generate type definitions for environment variables

# Contributions

I appreciate your active participation in the development process. If you come across any bugs, have feature requests, or need clarification on any aspect of the project, please don't hesitate to open an issue.

Additionally, your contributions to the project are highly valued. If you have ideas or improvements that you would like to implement, I invite you to suggest a pull request. Simply fork the repository, make the necessary code changes, add relevant tests to ensure quality, and push your changes.

Your feedback and contributions play an essential role in making the project better, and I am grateful for your involvement. Thank you for your support and participation in the development of the project.
