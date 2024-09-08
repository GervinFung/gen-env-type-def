import type { EnvType } from './generator';

import Generator from './generator';
import IO from './io';
import Parser from './parser';
import Writer from './writer';

type Directory = Readonly<{
	inDir: string;
	ignoreFiles?: ReadonlyArray<string>;
	envType: EnvType;
	outDir?: string;
}>;

const genEnvTypeDef = (directories: ReadonlyArray<Directory>) => {
	const io = IO.of();

	if (!directories.length) {
		throw new Error(
			'Directories cannot be empty; otherwise, there will be nothing to operate on'
		);
	}

	directories.forEach((prop) => {
		const parser = Parser.of({
			io,
			envDir: prop.inDir,
			ignoreFiles: prop.ignoreFiles,
		});

		const generator = Generator.of({
			io,
			contents: parser.parseContents(),
		});

		const writer = Writer.of({
			io,
			outDir: prop.outDir ?? prop.inDir,
		});

		switch (prop.envType) {
			case 'process.env': {
				writer.writeProcessEnv(generator.processEnv());
				break;
			}
			case 'import.meta.env': {
				writer.writeImportMetaEnv(generator.importMetaEnv());
				break;
			}
		}
	});
};

export { genEnvTypeDef };
