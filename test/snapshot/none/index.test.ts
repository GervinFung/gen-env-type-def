import path from 'path';

import { describe, expect, it } from 'vitest';

import IO from '../../../src/io';
import Parser from '../../../src/parser';

import { createTypedValue } from '../util';
import { generateCommonAssertion } from '../test';

describe('should parse all .env* files and generate type definitions without unionising with string correctly', () => {
	const commonAssertion = generateCommonAssertion('./none');

	it('should parse, ignore comments, and generate type definitions', () => {
		const { excludeUnion } = createTypedValue(Parser);

		const io = IO.of();

		const parser = Parser.of({
			io,
			ignoreFiles: ['.env.ignore'],
			envDir: path.join(process.cwd(), 'test', 'env', 'non-empty'),
			allowStringType: {
				for: 'none',
			},
		});

		const contents = parser.parseContents();

		expect(contents).toStrictEqual({
			NODE_ENV: excludeUnion([
				'development',
				'',
				'production',
				'staging',
				'testing',
			]),
			SAME: excludeUnion(['hi', '', 'hi', 'hi', 'hi']),
			REQUIRED_IN_DEV_ONLY: excludeUnion(['true']),
			REQUIRED_IN_TEST_ONLY: excludeUnion(['false']),
			ORIGIN: excludeUnion([
				'http://localhost:3000',
				'',
				'https://arkham.io',
				'https://staging.arkham.io',
				'http://localhost:8000',
			]),
			TIME_OUT: excludeUnion([
				'0',
				'',
				'2_000_000',
				'2_000_000',
				'1_000_000',
			]),
		});

		commonAssertion.generateTypeDefinition({
			io,
			contents,
		});
	});

	commonAssertion.cleanup();
});
