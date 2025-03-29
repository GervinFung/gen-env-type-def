import fs from 'fs';

import { afterAll, expect } from 'vitest';

import Generator from '../../src/generator';
import type IO from '../../src/io';
import type Parser from '../../src/parser';
import Writer from '../../src/writer';

const generateCommonAssertion = (outDir: string) => {
	return {
		cleanup: () => {
			afterAll(() => {
				fs.rmSync(outDir, { recursive: true, force: true });
			});
		},
		generateTypeDefinition: (
			props: Readonly<{
				io: IO;
				contents: ReturnType<Parser['parseContents']>;
			}>
		) => {
			const generator = Generator.of(props);
			const processEnv = generator.processEnv();
			const importMetaEnv = generator.importMetaEnv();

			const writer = Writer.of({
				io: props.io,
				outDir,
			});

			void expect(writer.writeProcessEnv(processEnv)).toMatchFileSnapshot(
				'output/process-env'
			);
			void expect(
				writer.writeImportMetaEnv(importMetaEnv)
			).toMatchFileSnapshot('output/import-meta-env');
		},
	};
};

export { generateCommonAssertion };
