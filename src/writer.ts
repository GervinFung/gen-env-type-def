import fs from 'fs';

export default class Writer {
    private constructor(private readonly outDir: string) {
        this.ensureOutDirExists();
    }

    static readonly of = (outDir: string) => new this(outDir);

    private readonly ensureOutDirExists = () => {
        if (!fs.existsSync(this.outDir)) {
            fs.mkdirSync(this.outDir, { recursive: true });
        }
    };

    readonly write = (content: string) => {
        const file = `${this.outDir}/env.d.ts`;
        fs.writeFileSync(file, content);
        return fs.readFileSync(file, { encoding: 'utf-8' });
    };
}
