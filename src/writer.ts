import fs from 'fs';
import path from 'path';
import type IO from './io';
import type { EnvType } from './generator';

type WriterField = Readonly<{
	io: IO;
	outDir: string;
}>;

export default class Writer {
	private constructor(private readonly field: WriterField) {
		this.ensureOutDirExists();
	}

	static readonly of = (field: WriterField) => {
		return new this(field);
	};

	private readonly ensureOutDirExists = () => {
		if (!fs.existsSync(this.field.outDir)) {
			fs.mkdirSync(this.field.outDir, { recursive: true });
		}
	};

	private readonly write = (
		param: Readonly<{
			content: string;
			envType: EnvType;
		}>
	) => {
		const outFile = 'env.d.ts';
		const file = path.join(this.field.outDir, outFile);
		fs.writeFileSync(file, param.content);
		this.field.io.writeWrittenTypeDefinition({
			outFile,
			envType: param.envType,
			outDir: this.field.outDir,
		});
		return fs.readFileSync(file, { encoding: 'utf-8' });
	};

	readonly writeProcessEnv = (content: string) => {
		return this.write({
			content,
			envType: 'process.env',
		});
	};

	readonly writeImportMetaEnv = (content: string) => {
		return this.write({
			content,
			envType: 'import.meta.env',
		});
	};
}
