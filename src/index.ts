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
    private config: any = {}
    private eProcess: any

    constructor(options: Options) {
        Object.assign(this.config, options)
        this.log(`constructor: ${{ options }}`)
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
        const args = this.config.args
            ? [existsAt].concat(this.config.args)
            : [existsAt]
        this.eProcess = spawn('electron', args, {
            env: process.env,
            stdio: 'inherit',
        })

        this.eProcess.on('close', (code: number, signal: string): void => {
            this.log(`close code: ${code}, signal: ${signal}`)
            process.kill(process.pid, signal)
        })

        this.eProcess.on('disconnect', (): void => {
            this.log('disconnect')
        })

        this.eProcess.on('error', (): void => {
            this.log('error')
        })

        this.eProcess.on('exit', (): void => {
            this.log('exit')
        })

        this.eProcess.on('message', (): void => {
            this.log('message')
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
