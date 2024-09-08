import path from 'path';

import { describe, expect, it } from 'vitest';

import { genEnvTypeDef } from '../../src';

describe('should not be able to proceed further due to invalid input', () => {
	it('should throw error when given an empty array as the input', () => {
		expect(() => {
			return genEnvTypeDef([]);
		}).toThrowError();
	});
	it.each(['process.env', 'import.meta.env'] as const)(
		'should throw error when given an array of directory without any ".env*" files as the input, when it is generated for %s',
		(envType) => {
			expect(() => {
				return genEnvTypeDef([
					{
						envType,
						inDir: path.join(
							path.resolve(__dirname, '..'),
							'env',
							'empty'
						),
					},
				]);
			}).toThrowError();
		}
	);
});
