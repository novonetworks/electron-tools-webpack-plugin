import webpack, { Plugin, Compiler } from 'webpack'
import { build } from 'electron-builder'
import spawn from 'cross-spawn'

interface Options {
    readonly main: string
    readonly args?: string[]
}

const isDevelopment = process.env.NODE_ENV === 'development'

export class ElectronToolsWebpackPlugin implements Plugin {
    private compiler: Compiler
    private config: any
    private eProcess: any

    constructor(options: Options) {
        Object.assign(this.config, options)
    }

    public apply(compiler: Compiler): void {
        this.compiler = compiler
        if (isDevelopment) {
            this.afterEmit()
        } else {
            this.done()
        }
    }
    private afterEmit(): void {
        this.compiler.hooks.afterEmit.tap(
            ElectronToolsWebpackPlugin.name,
            this.startElectron,
        )
    }
    private done(): void {
        this.compiler.hooks.afterEmit.tap(
            ElectronToolsWebpackPlugin.name,
            this.buildElectron,
        )
    }

    private startElectron = (compilation: webpack.compilation.Compilation) => {
        if (!this.config.main || this.eProcess) {
            return
        }
        const existsAt = compilation.assets[this.config.main].existsAt
        const args = [existsAt].concat(this.config.args)
        this.eProcess = spawn('electron', args, {
            env: process.env,
            stdio: 'inherit',
        })

        this.eProcess.on('SIGINT', () => {
            process.exit(0)
        })
    }

    private buildElectron = async () => await build()
}

// noinspection JSUnusedGlobalSymbols
export default ElectronToolsWebpackPlugin
