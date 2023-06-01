import type IO from './io';
import Parser from './parser';

type EnvType = 'process.env' | 'import.meta.env';

type ParsedContents = ReturnType<Parser['parseContents']>;

type GeneratorField = Readonly<{
    io: IO;
    contents: ParsedContents;
}>;

export default class Generator {
    private constructor(private readonly field: GeneratorField) {}

    static readonly of = (field: GeneratorField) => new this(field);

    private readonly generateTypeDefinitions = (
        param: Readonly<{
            envType: EnvType;
            tagsCount: number;
        }>
    ) => {
        const longestValue = Object.values(this.field.contents).reduce(
            (longest, value) => (value.size > longest ? value.size : longest),
            0
        );

        const result = Object.entries(this.field.contents).reduce(
            (typeDefinitions, [key, values]) =>
                typeDefinitions.concat(
                    `${'\t'.repeat(param.tagsCount)}readonly ${key}${
                        values.size === longestValue ? '' : '?'
                    }: ${Array.from(values)
                        .map((value) => `"${value}"`)
                        .join(' | ')}`
                ),
            [] as ReadonlyArray<string>
        );

        this.field.io.writeGeneratedTypeDefinition(param.envType);

        return result;
    };

    readonly processEnv = () => {
        const typeDefinitions = this.generateTypeDefinitions({
            tagsCount: 3,
            envType: 'process.env',
        });

        return [
            'export {}',
            'declare global {',
            '\tnamespace NodeJS {',
            '\t\tinterface ProcessEnv {',
            `${typeDefinitions.join('\n')}`,
            '\t\t}',
            '\t}',
            '}',
        ].join('\n');
    };

    readonly importMetaEnv = () => {
        const typeDefinitions = this.generateTypeDefinitions({
            tagsCount: 1,
            envType: 'import.meta.env',
        });

        return [
            'interface ImportMetaEnv {',
            `${typeDefinitions.join('\n')}`,
            '}',
            'interface ImportMeta {',
            '\treadonly env: ImportMetaEnv',
            '}',
        ].join('\n');
    };
}

export type { EnvType };
