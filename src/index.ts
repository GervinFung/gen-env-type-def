import Parser from './parser';
import Generator from './generator';
import Writer from './writer';

type EnvType = 'process.env' | 'import.meta.env';

type Directory = Readonly<{
    inDir: string;
    envType: EnvType;
    outDir?: string;
}>;

const genEnvTypeDef = (param: ReadonlyArray<Directory>) => {
    param.forEach((prop) => {
        const parser = Parser.of(prop.inDir);
        const generator = Generator.of(parser.parseContents());
        const writer = Writer.of(prop.outDir ?? prop.inDir);
        switch (prop.envType) {
            case 'process.env': {
                writer.write(generator.processEnv());
                break;
            }
            case 'import.meta.env': {
                writer.write(generator.importMetaEnv());
                break;
            }
        }
    });
};

export { genEnvTypeDef };
