import fs from 'fs';
import path from 'path';
import { guard } from './type';
import type IO from './io';

type ParserField = Readonly<{
	io: IO;
	ignoreFiles: undefined | ReadonlyArray<string>;
	envDir: string;
	envPaths: ReadonlyArray<string>;
}>;

export default class Parser {
	private static readonly KEY_VALUE_PATTERN =
		/^\s*([\w.-]+)\s*=\s*("[^"]*"|'[^']*'|[^#]*)?(\s*|\s*#.*)?$/;

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

			const key = guard({
				value: env.at(1),
				error: new Error(
					'There should be a key if there are four elements'
				),
			});

			const value = guard({
				value: env.at(2),
				error: new Error(
					'There should be a value if there are four elements'
				),
			});

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

	readonly parseContents = () => {
		return this.envContents()
			.flatMap(this.parseContent)
			.reduce(
				(result, env) => {
					return {
						...result,
						[env.key]: Array.from(result[env.key] ?? []).concat(
							env.value
						),
					};
				},
				{} as Readonly<Record<string, ReadonlyArray<string>>>
			);
	};
}
