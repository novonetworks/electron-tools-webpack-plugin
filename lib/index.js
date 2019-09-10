'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electronBuilder = require('electron-builder');
var spawn = _interopDefault(require('cross-spawn'));

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
        this.buildElectron = async () => await electronBuilder.build();
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

exports.ElectronToolsWebpackPlugin = ElectronToolsWebpackPlugin;
exports.default = ElectronToolsWebpackPlugin;
//# sourceMappingURL=index.js.map
