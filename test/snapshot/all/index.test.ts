import path from 'path';

import { describe, expect, it } from 'vitest';

import IO from '../../../src/io';
import Parser from '../../../src/parser';

import { createTypedValue } from '../util';
import { generateCommonAssertion } from '../test';

describe('should parse all .env* files and generate type definitions with all variable unionised with string correctly', () => {
	const commonAssertion = generateCommonAssertion('./all');

	it('should parse, ignore comments, and generate type definitions', () => {
		const { includeUnion } = createTypedValue(Parser);

		const io = IO.of();

		const parser = Parser.of({
			io,
			ignoreFiles: ['.env.ignore'],
			envDir: path.join(process.cwd(), 'test', 'env', 'non-empty'),
			allowStringType: {
				for: 'all',
			},
		});

		const contents = parser.parseContents();

		expect(contents).toStrictEqual({
			NODE_ENV: includeUnion([
				'development',
				'',
				'production',
				'staging',
				'testing',
			]),
			SAME: includeUnion(['hi', '', 'hi', 'hi', 'hi']),
			REQUIRED_IN_DEV_ONLY: includeUnion(['true']),
			REQUIRED_IN_TEST_ONLY: includeUnion(['false']),
			ORIGIN: includeUnion([
				'http://localhost:3000',
				'',
				'https://arkham.io',
				'https://staging.arkham.io',
				'http://localhost:8000',
			]),
			TIME_OUT: includeUnion([
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
