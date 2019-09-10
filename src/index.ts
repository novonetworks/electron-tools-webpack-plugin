import webpack, { Plugin, Compiler } from 'webpack'
import { build } from 'electron-builder'
import spawn from 'cross-spawn'

interface Options {
    readonly main: string
    readonly args?: string[]
    readonly isDebug?: boolean
}

const isDevelopment = process.env.NODE_ENV === 'development'

// noinspection JSUnusedGlobalSymbols
export default class ElectronToolsWebpackPlugin implements Plugin {
    private compiler: Compiler
    private config: any
    private eProcess: any

    constructor(options: Options) {
        this.log(`constructor: ${{ options }}`)
        Object.assign(this.config, options)
    }

    public apply(compiler: Compiler): void {
        this.log(`apply: ${{ compiler }}`)
        this.compiler = compiler
        if (isDevelopment) {
            this.afterEmit()
        } else {
            this.done()
        }
    }
    private afterEmit(): void {
        this.log('afterEmit')
        this.compiler.hooks.afterEmit.tap(
            ElectronToolsWebpackPlugin.name,
            this.startElectron,
        )
    }
    private done(): void {
        this.log('done')
        this.compiler.hooks.afterEmit.tap(
            ElectronToolsWebpackPlugin.name,
            this.buildElectron,
        )
    }

    private startElectron = (compilation: webpack.compilation.Compilation) => {
        this.log('startElectron')
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
            this.log('SIGINT')
            process.exit(0)
        })
    }

    private buildElectron = async () => {
        this.log('buildElectron')
        await build()
    }

    private log = (message?: any, ...optionalParams: any[]): void => {
        this.config.isDebug && console.log(message, optionalParams)
    }
}
