import path from 'path';

import { describe, expect, it } from 'vitest';

import IO from '../../../src/io';
import Parser from '../../../src/parser';
import { generateCommonAssertion } from '../test';
import { createTypedValue } from '../util';

describe('should parse all .env* files and generate type definitions with unspecified variable not unionised with string correctly', () => {
	const commonAssertion = generateCommonAssertion('./exclude');

	it('should parse, ignore comments, and generate type definitions', async () => {
		const { includeUnion, excludeUnion } = createTypedValue(Parser);

		const io = IO.of();

		const parser = Parser.of({
			io,
			ignoreFiles: ['.env.ignore'],
			envDir: path.join(process.cwd(), 'test', 'env', 'non-empty'),
			allowStringType: {
				for: 'some',
				case: 'exclude',
				variables: ['NODE_ENV', 'ORIGIN', 'TIME_OUT'],
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
			SAME: includeUnion(['hi', '', 'hi', 'hi', 'hi']),
			REQUIRED_IN_DEV_ONLY: includeUnion(['true']),
			REQUIRED_IN_TEST_ONLY: includeUnion(['false']),
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

		await commonAssertion.generateTypeDefinition({
			io,
			contents,
		});
	});

	commonAssertion.cleanup();
});
