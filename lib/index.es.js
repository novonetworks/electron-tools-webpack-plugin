import { build } from 'electron-builder';
import spawn from 'cross-spawn';

const isDevelopment = process.env.NODE_ENV === 'development';
// noinspection JSUnusedGlobalSymbols
class ElectronToolsWebpackPlugin {
    constructor(options) {
        this.config = {};
        this.startElectron = (compilation) => {
            this.log('startElectron');
            if (!this.config.main || this.eProcess) {
                return;
            }
            const existsAt = compilation.assets[this.config.main].existsAt;
            const args = [existsAt].concat(this.config.args);
            this.eProcess = spawn('electron', args, {
                env: process.env,
                stdio: 'inherit',
            });
            this.eProcess.on('SIGINT', () => {
                this.log('SIGINT');
                process.exit(0);
            });
        };
        this.buildElectron = async () => {
            this.log('buildElectron');
            await build();
        };
        this.log = (message, ...optionalParams) => {
            this.config.isDebug && console.log(message, optionalParams);
        };
        Object.assign(this.config, options);
        this.log(`constructor: ${{ options }}`);
    }
    apply(compiler) {
        this.log(`apply: ${{ compiler }}`);
        this.compiler = compiler;
        if (isDevelopment) {
            this.afterEmit();
        }
        else {
            this.done();
        }
    }
    afterEmit() {
        this.log('afterEmit');
        this.compiler.hooks.afterEmit.tap(ElectronToolsWebpackPlugin.name, this.startElectron);
    }
    done() {
        this.log('done');
        this.compiler.hooks.afterEmit.tap(ElectronToolsWebpackPlugin.name, this.buildElectron);
    }
}

export default ElectronToolsWebpackPlugin;
//# sourceMappingURL=index.es.js.map
