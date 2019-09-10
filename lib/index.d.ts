import { Plugin, Compiler } from 'webpack'
interface Options {
    readonly main: string
    readonly args?: string[]
    readonly isDebug?: boolean
}
export default class ElectronToolsWebpackPlugin implements Plugin {
    private compiler
    private config
    private eProcess
    constructor(options: Options)
    apply(compiler: Compiler): void
    private afterEmit
    private done
    private startElectron
    private buildElectron
    private log
}
export {}
