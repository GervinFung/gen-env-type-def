import fs from 'fs';
import { afterAll, describe, expect, it } from 'vitest';
import Parser from '../src/parser';
import Generator from '../src/generator';
import Writer from '../src/writer';

describe('should parse all .env* files and generate type definitions correctly', () => {
    const outDir = `${__dirname}/typing`;

    it('should parse, ignore comments, and generate type definitions', () => {
        const parser = Parser.of(`${__dirname}/env`);
        const contents = parser.parseContents();
        expect(contents).toStrictEqual({
            NODE_ENV: new Set([
                'development',
                'production',
                'staging',
                'testing',
            ]),
            REQUIRED_IN_DEV_ONLY: new Set(['true']),
            REQUIRED_IN_TEST_ONLY: new Set(['false']),
            ORIGIN: new Set([
                'http://localhost:3000',
                'https://arkham.io',
                'https://staging.arkham.io',
                'http://localhost:8000',
            ]),
            TIME_OUT: new Set(['0', '1_000_000', '2_000_000']),
        });

        const generator = Generator.of(contents);
        const processEnv = generator.processEnv();
        const importMetaEnv = generator.importMetaEnv();
        expect(processEnv).toMatchInlineSnapshot(`
          "declare global {
          	namespace NodeJS {
          		interface ProcessEnv {
          			readonly NODE_ENV: \\"development\\" | \\"production\\" | \\"staging\\" | \\"testing\\"
          			readonly REQUIRED_IN_DEV_ONLY?: \\"true\\"
          			readonly ORIGIN: \\"http://localhost:3000\\" | \\"https://arkham.io\\" | \\"https://staging.arkham.io\\" | \\"http://localhost:8000\\"
          			readonly TIME_OUT?: \\"0\\" | \\"2_000_000\\" | \\"1_000_000\\"
          			readonly REQUIRED_IN_TEST_ONLY?: \\"false\\"
          		}
          	}
          }"
        `);
        expect(importMetaEnv).toMatchInlineSnapshot(`
          "interface ImportMetaEnv {
          	readonly NODE_ENV: \\"development\\" | \\"production\\" | \\"staging\\" | \\"testing\\"
          	readonly REQUIRED_IN_DEV_ONLY?: \\"true\\"
          	readonly ORIGIN: \\"http://localhost:3000\\" | \\"https://arkham.io\\" | \\"https://staging.arkham.io\\" | \\"http://localhost:8000\\"
          	readonly TIME_OUT?: \\"0\\" | \\"2_000_000\\" | \\"1_000_000\\"
          	readonly REQUIRED_IN_TEST_ONLY?: \\"false\\"
          }
          interface ImportMeta {
          	readonly env: ImportMetaEnv
          }"
        `);

        const writer = Writer.of(outDir);

        expect(writer.write(processEnv)).toMatchFileSnapshot(
            'snapshot/process-env'
        );
        expect(writer.write(importMetaEnv)).toMatchFileSnapshot(
            'snapshot/import-meta-env'
        );
    });

    afterAll(() => {
        fs.rmSync(outDir, { recursive: true, force: true });
    });
});
