'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electronBuilder = require('electron-builder');
var spawn = _interopDefault(require('cross-spawn'));

const isDevelopment = process.env.NODE_ENV === 'development';
class ElectronToolsWebpackPlugin {
    constructor(options) {
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
            await electronBuilder.build();
        };
        this.log = (message, ...optionalParams) => {
            this.config.isDebug && console.log(message, optionalParams);
        };
        this.log(`constructor: ${{ options }}`);
        Object.assign(this.config, options);
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

exports.ElectronToolsWebpackPlugin = ElectronToolsWebpackPlugin;
exports.default = ElectronToolsWebpackPlugin;
//# sourceMappingURL=index.js.map
