import type IO from './io';

import fs from 'fs';
import path from 'path';

import { guard } from './type';

type ParserField = Readonly<{
	io: IO;
	ignoreFiles: undefined | ReadonlyArray<string>;
	envDir: string;
	envPaths: ReadonlyArray<string>;
	allowStringType: Readonly<
		| {
				for: 'all' | 'none';
		  }
		| {
				for: 'some';
				case: 'exclude' | 'include';
				variables: ReadonlyArray<string>;
		  }
	>;
}>;

export default class Parser {
	private static readonly KEY_VALUE_PATTERN =
		/^\s*([\w.-]+)\s*=\s*("[^"]*"|'[^']*'|[^#]*)?(\s*|\s*#.*)?$/;

	private static readonly UNIONISED_STRING = '(string & {})';

	private constructor(private readonly field: ParserField) {}

	static readonly of = (field: Omit<ParserField, 'envPaths'>) => {
		field.io.writeFindingAllEnvFiles(field.envDir);

		const envPaths = fs
			.readdirSync(field.envDir)
			.filter((path) => {
				return path.startsWith('.env');
			})
			.filter((path) => {
				const isExample = path.includes('example');

				const isIgnored = (field.ignoreFiles ?? []).includes(path);

				return !(isExample || isIgnored);
			});

		if (!envPaths.length) {
			throw new Error(
				`There is no .env* file(s) to be found in ${path.resolve(
					field.envDir
				)}`
			);
		}

		field.io.writeFoundAllEnvFiles(envPaths);
		return new this({ ...field, envPaths });
	};

	static readonly getUnionisedString = () => {
		return this.UNIONISED_STRING;
	};

	private readonly envContents = () => {
		return this.field.envPaths.map((envPath) => {
			return fs.readFileSync(path.join(this.field.envDir, envPath), {
				encoding: 'utf-8',
			});
		});
	};

	private readonly parseContent = (content: string) => {
		return content.split('\n').flatMap((line) => {
			const env = Parser.KEY_VALUE_PATTERN.exec(line);
			if (env?.length !== 4) {
				return [];
			}

			const key = guard(
				env.at(1),
				new Error('There should be a key if there are four elements')
			);

			const value = env.at(2) ?? '';

			const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
			const isSingleQuoted = value.startsWith("'") && value.endsWith("'");

			return [
				{
					key,
					value: !(isDoubleQuoted || isSingleQuoted)
						? value
						: value.slice(1, -1),
				},
			];
		});
	};

	private readonly parseValues = (
		props: Readonly<{
			key: string;
			value: ReadonlyArray<
				Readonly<{
					type: 'original' | 'unioned';
					value: string;
				}>
			>;
		}>
	) => {
		const { allowStringType } = this.field;

		switch (allowStringType.for) {
			case 'none': {
				return props.value;
			}
			case 'all': {
				return props.value.concat({
					type: 'unioned',
					value: Parser.UNIONISED_STRING,
				});
			}
			case 'some': {
				const includesKey = allowStringType.variables.includes(
					props.key
				);

				const whenExclude =
					allowStringType.case === 'exclude' && includesKey;
				const whenInclude =
					allowStringType.case === 'include' && !includesKey;

				if (whenExclude || whenInclude) {
					return props.value;
				}

				return props.value.concat({
					type: 'unioned',
					value: Parser.UNIONISED_STRING,
				});
			}
		}
	};

	readonly parseContents = () => {
		type Props = Parameters<typeof this.parseValues>[0];

		type Env = Readonly<Record<Props['key'], Props['value']>>;

		const envs = this.envContents()
			.flatMap(this.parseContent)
			.reduce((result, env) => {
				return {
					...result,
					[env.key]: (result[env.key] ?? []).concat({
						type: 'original',
						value: env.value,
					}),
				};
			}, {} as Env);

		return Object.entries(envs)
			.map(([key, value]) => {
				return {
					key,
					value,
				};
			})
			.reduce((result, env) => {
				return {
					...result,
					[env.key]: this.parseValues(env),
				};
			}, {} as Env);
	};
}

export type { ParserField };
