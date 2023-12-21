import fs from 'fs';
import path from 'path';
import { afterAll, describe, expect, it } from 'vitest';
import Parser from '../../src/parser';
import Generator from '../../src/generator';
import Writer from '../../src/writer';
import IO from '../../src/io';

describe('should parse all .env* files and generate type definitions correctly', () => {
	const outDir = `./typing`;

	it('should parse, ignore comments, and generate type definitions', () => {
		const io = IO.of();

		const parser = Parser.of({
			io,
			ignoreFiles: ['.env.ignore'],
			envDir: path.join(
				path.resolve(__dirname, '..'),
				'env',
				'non-empty'
			),
		});
		const contents = parser.parseContents();
		expect(contents).toStrictEqual({
			NODE_ENV: ['development', 'production', 'staging', 'testing'],
			SAME: ['hi', 'hi', 'hi', 'hi'],
			REQUIRED_IN_DEV_ONLY: ['true'],
			REQUIRED_IN_TEST_ONLY: ['false'],
			ORIGIN: [
				'http://localhost:3000',
				'https://arkham.io',
				'https://staging.arkham.io',
				'http://localhost:8000',
			],
			TIME_OUT: ['0', '2_000_000', '2_000_000', '1_000_000'],
		});

		const generator = Generator.of({
			io,
			contents,
		});
		const processEnv = generator.processEnv();
		const importMetaEnv = generator.importMetaEnv();
		expect(processEnv).toMatchInlineSnapshot(`
			"export {}
			declare global {
				namespace NodeJS {
					interface ProcessEnv {
						readonly NODE_ENV: "development" | "production" | "staging" | "testing"
						readonly REQUIRED_IN_DEV_ONLY?: "true"
						readonly ORIGIN: "http://localhost:3000" | "https://arkham.io" | "https://staging.arkham.io" | "http://localhost:8000"
						readonly TIME_OUT: "0" | "2_000_000" | "1_000_000"
						readonly SAME: "hi"
						readonly REQUIRED_IN_TEST_ONLY?: "false"
					}
				}
			}"
		`);
		expect(importMetaEnv).toMatchInlineSnapshot(`
			"interface ImportMetaEnv {
				readonly NODE_ENV: "development" | "production" | "staging" | "testing"
				readonly REQUIRED_IN_DEV_ONLY?: "true"
				readonly ORIGIN: "http://localhost:3000" | "https://arkham.io" | "https://staging.arkham.io" | "http://localhost:8000"
				readonly TIME_OUT: "0" | "2_000_000" | "1_000_000"
				readonly SAME: "hi"
				readonly REQUIRED_IN_TEST_ONLY?: "false"
			}
			interface ImportMeta {
				readonly env: ImportMetaEnv
			}"
		`);

		const writer = Writer.of({
			io,
			outDir,
		});

		expect(writer.writeProcessEnv(processEnv)).toMatchFileSnapshot(
			'snapshot/dts-output/process-env'
		);
		expect(writer.writeImportMetaEnv(importMetaEnv)).toMatchFileSnapshot(
			'snapshot/dts-output/import-meta-env'
		);
	});

	afterAll(() => {
		fs.rmSync(outDir, { recursive: true, force: true });
	});
});
