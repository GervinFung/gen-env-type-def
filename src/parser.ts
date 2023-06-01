import fs from 'fs';
import { guard } from './type';

export default class Parser {
    private static readonly KEY_VALUE_PATTERN =
        /^\s*([\w.-]+)\s*=\s*("[^"]*"|'[^']*'|[^#]*)?(\s*|\s*#.*)?$/;

    private readonly envPaths: ReadonlyArray<string>;

    private constructor(private readonly envDir: string) {
        this.envPaths = fs
            .readdirSync(envDir)
            .filter((path) => path.startsWith('.env'))
            .filter((path) => !path.includes('example'));
    }

    static readonly of = (envDir: string) => new this(envDir);

    private readonly envContents = () =>
        this.envPaths.map((envPath) =>
            fs.readFileSync(`${this.envDir}/${envPath}`, {
                encoding: 'utf-8',
            })
        );

    private readonly parseContent = (content: string) =>
        content.split('\n').flatMap((line) => {
            const env = Parser.KEY_VALUE_PATTERN.exec(line);
            if (env?.length !== 4) {
                return [];
            }

            const key = guard({
                value: env.at(1),
                error: () =>
                    new Error(
                        'There should be a key if there are four elements'
                    ),
            });

            const value = guard({
                value: env.at(2),
                error: () =>
                    new Error(
                        'There should be a value if there are four elements'
                    ),
            });

            const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
            const isSingleQuoted = value.startsWith("'") && value.endsWith("'");

            return [
                {
                    key,
                    value: !(isDoubleQuoted || isSingleQuoted)
                        ? value
                        : value.slice(1, -1),
                },
            ];
        });

    readonly parseContents = () =>
        this.envContents()
            .flatMap(this.parseContent)
            .reduce(
                (result, env) => ({
                    ...result,
                    [env.key]: new Set(
                        Array.from(result[env.key] ?? []).concat(env.value)
                    ),
                }),
                {} as Readonly<Record<string, Set<string>>>
            );
}
