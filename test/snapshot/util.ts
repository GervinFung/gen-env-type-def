import type Parser from '../../src/parser';

const createTypedValue = (parser: typeof Parser) => {
	const excludeUnion = (values: ReadonlyArray<string>) => {
		return values.map((value) => {
			return {
				type: 'original',
				value,
			};
		});
	};

	return {
		excludeUnion,
		includeUnion: (values: ReadonlyArray<string>) => {
			return excludeUnion(values).concat({
				type: 'unioned',
				value: parser.getUnionisedString(),
			});
		},
	};
};

export { createTypedValue };
