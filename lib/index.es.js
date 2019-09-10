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
            const args = this.config.args
                ? [existsAt].concat(this.config.args)
                : [existsAt];
            this.eProcess = spawn('electron', args, {
                env: process.env,
                stdio: 'inherit',
            });
            const disposable = this.eProcess.on('close', (code, signal) => {
                this.log(`code: ${code}, signal: ${signal}`);
                disposable();
                process.kill(process.pid, signal);
            });
            /*
            once(event: "close", listener: (code: number, signal: string) => void): this;
            once(event: "disconnect", listener: () => void): this;
            once(event: "error", listener: (err: Error) => void): this;
            once(event: "exit", listener: (code: number | null, signal: string | null) => void): this;
            once(event: "message", listener: (message: any, sendHandle: net.Socket | net.Server) => void): this;
             */
            this.eProcess.on('close', () => {
                this.log('close');
            });
            this.eProcess.on('disconnect', () => {
                this.log('disconnect');
            });
            this.eProcess.on('error', () => {
                this.log('error');
            });
            this.eProcess.on('exit', () => {
                this.log('exit');
            });
            this.eProcess.on('message', () => {
                this.log('message');
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
