import Parser from './parser';

type ParsedContents = ReturnType<Parser['parseContents']>;

export default class Generator {
    private constructor(private readonly contents: ParsedContents) {}

    static readonly of = (contents: ParsedContents) => new this(contents);

    private readonly generateTypeDefinitions = (tagsCount: number) => {
        const longestValue = Object.values(this.contents).reduce(
            (longest, value) => (value.size > longest ? value.size : longest),
            0
        );

        return Object.entries(this.contents).reduce(
            (typeDefinitions, [key, values]) =>
                typeDefinitions.concat(
                    `${'\t'.repeat(tagsCount)}readonly ${key}${
                        values.size === longestValue ? '' : '?'
                    }: ${Array.from(values)
                        .map((value) => `"${value}"`)
                        .join(' | ')}`
                ),
            [] as ReadonlyArray<string>
        );
    };

    readonly processEnv = () => {
        const typeDefinitions = this.generateTypeDefinitions(3);

        return [
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
        const typeDefinitions = this.generateTypeDefinitions(1);

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
