import type { EnvType } from './generator';

type IOField = Readonly<{
	silentOutput: boolean;
}>;

export default class IO {
	private constructor(private readonly field: IOField) {}

	static readonly of = (field?: IOField) =>
		new this({ silentOutput: field?.silentOutput ?? false });

	private readonly log = (data: Parameters<Console['log']>[0]) => {
		if (!this.field.silentOutput) {
			console.log(data);
		}
	};

	readonly writeGeneratedTypeDefinition = (envType: EnvType) =>
		this.log(`Generated type definition for "${envType}"`);

	readonly writeFindingAllEnvFiles = (envDir: string) =>
		this.log(`Finding... all .env* files in "${envDir}"`);

	readonly writeFoundAllEnvFiles = (envPaths: ReadonlyArray<string>) =>
		this.log(`Found ${envPaths.map((path) => `"${path}"`).join(', ')}`);

	readonly writeWrittenTypeDefinition = (
		param: Readonly<{
			outDir: string;
			outFile: string;
			envType: EnvType;
		}>
	) =>
		this.log(
			`Written type definition in "${param.outFile}" for "${param.envType}" at "${param.outDir}"`
		);
}
