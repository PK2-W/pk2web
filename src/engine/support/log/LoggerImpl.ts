/**
 * Forma común en la que el sistema mostrará información sobre la ejecución en terminal.
 *
 * @version 3.2-stable
 */
import { Logger, TLogLevel } from '@ng/support/log/Logger';

class LoggerImpl implements Logger {
    // Instancia
    public static readonly instance: Logger = new LoggerImpl();
    
    //public static DEBUG = true;
    public static VERBOSE = false;
    public static VVERBOSE = false;
    
    // Fast logs
    private readonly _$fastLogs: HTMLDivElement;
    
    /**
     * Devuelve el color y el método nativo para cada nivel de log.
     *
     * @param level - Nivel propio de log.
     */
    private static color(level: TLogLevel): { c: string; m: string } {
        switch (level) {
            case 'e':
                return { c: '#e74c3c', m: 'log' };
            case 'w':
                return { c: '#eeb31e', m: 'log' };
            case 's':
                return { c: '#2ecc71', m: 'log' };
            case 'v':
            case 'vv':
                return { c: '#444444', m: 'log' };
            case 'nv':
                return { c: '#9b59b6', m: 'debug' };
            case 'ev':
                return { c: '#3498db', m: 'debug' };
            case 'd':
                return { c: '#777777', m: 'log' };
            case 'l':
            default:
                return { c: null, m: 'log' };
        }
    }
    
    /**
     * Elimina los espacios, tabulaciones y saltos de línea del principio y el final de una cadena.<br>
     * Devuelve una nueva cadena con el resultado.
     *
     * @param str - Cadena a tratar.
     */
    private static trim(str: string): string {
        return str.replace(/(^\s+|\s+$)/g, '');
    }
    
    /**
     * Aplica el color a la salida formateada que va a mostrarse por el terminal.
     *
     * @param args  - Argumentos originales de la llamada al logger.
     * @param level - Nivel de la información a mostrar.
     */
    private static apply(args: any[], level: TLogLevel, group: boolean): void {
        const style = LoggerImpl.color(level);
        
        // Aplicar color
        if (style.c != null && (typeof args[0] === 'string')) {
            args[0] = '%c' + args[0];
            args.splice(1, 0, 'color: ' + style.c);
        }
        
        // Mostrar
        window.console[group ? 'groupCollapsed' : style.m].apply(window.console, args);
    }
    
    /**
     * Motor interno del logger; procesa los argumentos de la llamada realizada para mostrarlos en consola con el
     * formato adecuado y el nivel correspondiente.
     *
     * @param args  - Argumentos originales de la llamada al logger.
     * @param level - Nivel de la información a mostrar.
     */
    private static log(args: any[], level: TLogLevel, group: boolean = false): void {
        let currArgs = [];
        let currStrLike: boolean;
        let prevStrLike: boolean = null;
        
        // Si no se pasan argumentos o se pasa uno vacío, mostrar salto de línea
        if (args.length === 0 || args.length === 1 && LoggerImpl.trim(String(args[0])).length === 0) {
            LoggerImpl.apply([''], level, group);
            return;
        }
        
        // Si alguno de los argumentos es una excepción, pintar la pila solo cuando W o E
        if (!(level === 'e' || level === 'w')) {
            args = args.map((arg) => {
                if (arg instanceof Error) {
                    arg = ' ' + arg.constructor.name + ': ' + arg.message;
                }
                return arg;
            });
        }
        
        /* // Si hay un solo argumento, es error, y el nivel es W o E
         if (args.length === 1 && (level === 'e' || level === 'w') && args[0] instanceof Error) {
         if (Log.isDebug()) {
         LoggerImpl.apply(['[Logger] Logged error:', args[0]], level, false);
         } else {
         LoggerImpl.apply([args[0].message], level, false);
         }
         return;
         }
         
         // Si hay dos argumentos, el segundo es error, y el nivel es W o E
         if (args.length === 2 && (level === 'e' || level === 'w') && args[1] instanceof Error) {
         if (Log.isDebug()) {
         LoggerImpl.apply([args[0] + ' Logged error:', args[1]], level, false);
         } else {
         LoggerImpl.apply([args[0], '\n', args[1].message], level, false);
         }
         return;
         }*/
        
        // Para cada uno de los argumentos
        for (const arg of args) {
            currStrLike = (typeof arg !== 'object');
            
            // Si el actual es ~string
            if (currStrLike) {
                // Si el previo es ~string
                if (prevStrLike) {
                    currArgs[0] = currArgs[0] + String(arg);
                }
                // Si el previo es nulo o ~object
                else {
                    if (prevStrLike != null && currArgs.length > 0) {
                        LoggerImpl.apply(currArgs, level, group);
                        prevStrLike = null;
                        currArgs = [];
                    }
                    
                    currArgs.push(String(arg));
                }
            }
            // Si el actual es ~object
            else {
                currArgs.push(arg);
            }
            
            prevStrLike = currStrLike;
        }
        
        // Finalizar
        LoggerImpl.apply(currArgs, level, group);
    }
    
    public constructor() {
        this._$fastLogs = document.createElement('div');
        this._$fastLogs.id = '__logger_fastlogs__';
        this._$fastLogs.setAttribute('style', `
            font-family: monospace;
            font-size: 10px;
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255,255,255,0.4);
            padding: 3px 6px;
            border-radius: 1px;
            display: none;
            backdrop-filter: blur(5px);`);
        document.body.appendChild(this._$fastLogs);
    }
    
    
    /** @inheritDoc */
    public vv(...args): void {
        if (!LoggerImpl.VVERBOSE)
            return;
        
        LoggerImpl.log(args, 'vv');
    }
    
    /** @inheritDoc */
    public nv(...args): void {
        if (!LoggerImpl.VERBOSE)
            return;
        
        LoggerImpl.log(args, 'nv');
    }
    
    /** @inheritDoc */
    public ev(...args): void {
        if (!LoggerImpl.VERBOSE && !LoggerImpl.VVERBOSE)
            return;
        
        LoggerImpl.log(args, 'ev');
    }
    
    /** @inheritDoc */
    public v(...args): void {
        if (!LoggerImpl.VERBOSE && !LoggerImpl.VVERBOSE)
            return;
        
        LoggerImpl.log(args, 'v');
    }
    
    /** @inheritDoc */
    public l(...args): void {
        LoggerImpl.log(args, 'l');
    }
    
    /** @inheritDoc */
    public d(...args): void {
        if (!LoggerImpl.DEBUG && !LoggerImpl.VERBOSE && !LoggerImpl.VVERBOSE)
            return;
        
        LoggerImpl.log(args, 'd');
    }
    
    /** @inheritDoc */
    public s(...args): void {
        LoggerImpl.log(args, 's');
    }
    
    /** @inheritDoc */
    public w(...args): void {
        LoggerImpl.log(args, 'w');
    }
    
    /** @inheritDoc */
    public e(...args): void {
        LoggerImpl.log(args, 'e');
    }
    
    public dg(...lines: any[][]): void {
        if (!LoggerImpl.DEBUG)
            return;
        
        let i = 0;
        for (let line of lines) {
            if (i++ == 0) {
                LoggerImpl.log(line, 'd', true);
            } else {
                LoggerImpl.log(line, 'd');
            }
        }
        console.groupEnd();
    }
    
    public fast(key: string, msg: string | number): void {
        const xkey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        let fld: HTMLDivElement = this._$fastLogs.querySelector('#__log_fl__' + xkey);
        if (fld == null) {
            fld = document.createElement('div');
            fld.id = '__log_fl__' + xkey;
            this._$fastLogs.appendChild(fld);
            this._$fastLogs.style.display = 'block';
        }
        fld.innerHTML = `<b>${ key }:</b> ${ msg }`;
    }
    
    public isDebug(): boolean {
        return LoggerImpl.DEBUG || LoggerImpl.VERBOSE || LoggerImpl.VVERBOSE;
    }
}

// Exportar la instancia
export const Log: Logger = LoggerImpl.instance;
