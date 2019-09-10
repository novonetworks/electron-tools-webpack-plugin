import { build } from 'electron-builder';
import spawn from 'cross-spawn';

const isDevelopment = process.env.NODE_ENV === 'development';
class ElectronToolsWebpackPlugin {
    constructor(options) {
        this.startElectron = (compilation) => {
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
                process.exit(0);
            });
        };
        this.buildElectron = async () => await build();
        Object.assign(this.config, options);
    }
    apply(compiler) {
        this.compiler = compiler;
        if (isDevelopment) {
            this.afterEmit();
        }
        else {
            this.done();
        }
    }
    afterEmit() {
        this.compiler.hooks.afterEmit.tap(ElectronToolsWebpackPlugin.name, this.startElectron);
    }
    done() {
        this.compiler.hooks.afterEmit.tap(ElectronToolsWebpackPlugin.name, this.buildElectron);
    }
}

export default ElectronToolsWebpackPlugin;
export { ElectronToolsWebpackPlugin };
//# sourceMappingURL=index.es.js.map
