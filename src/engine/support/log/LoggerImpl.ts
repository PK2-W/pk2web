/**
 * Forma común en la que el sistema mostrará información sobre la ejecución en terminal.
 *
 * @version 2.3-stable
 */
import { Logger, TLogLevel } from '@ng/support/log/Logger';

class LoggerImpl implements Logger {
    // Instancia
    public static readonly instance: Logger = new LoggerImpl();
    
    public static VERBOSE = false;
    
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
            return { c: '#f1c40f', m: 'log' };
        case 's':
            return { c: '#2ecc71', m: 'log' };
        case 'v':
        case 'vv':
            return { c: '#95a5a6', m: 'debug' };
        case 'nv':
            return { c: '#9b59b6', m: 'debug' };
        case 'ev':
            return { c: '#3498db', m: 'debug' };
        case 'd':
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
    private static apply(args: any[], level: TLogLevel): void {
        const style = LoggerImpl.color(level);
        
        // Aplicar color
        if (style.c != null && typeof args[0] === 'string') {
            args[0] = '%c' + args[0];
            args.splice(1, 0, 'color: ' + style.c);
        }
        
        // Mostrar
        window.console[style.m].apply(window.console, args);
    }
    
    /**
     * Motor interno del logger; procesa los argumentos de la llamada realizada para mostrarlos en consola con el
     * formato adecuado y el nivel correspondiente.
     *
     * @param args  - Argumentos originales de la llamada al logger.
     * @param level - Nivel de la información a mostrar.
     */
    private static log(args: any[], level: TLogLevel): void {
        let currArgs = [];
        let currStrLike: boolean;
        let prevStrLike: boolean = null;
        
        // Si no se pasan argumentos o se pasa uno vacío, mostrar salto de línea
        if (args.length === 0 || args.length === 1 && LoggerImpl.trim(String(args[0])).length === 0) {
            LoggerImpl.apply([''], level);
            return;
        }
        
        // Para cada uno de los argumentos
        for (const arg of args) {
            currStrLike = (typeof arg !== 'object');
            
            // Si el actual es ~string
            if (currStrLike) {
                // Si el previo es ~string
                if (prevStrLike) {
                    currArgs[0] = currArgs[0] + ' ' + String(arg);
                }
                // Si el previo es nulo o ~object
                else {
                    if (prevStrLike != null && currArgs.length > 0) {
                        LoggerImpl.apply(currArgs, level);
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
        LoggerImpl.apply(currArgs, level);
    }
    
    /** @inheritDoc */
    public vv(...args): void {
        if (!LoggerImpl.VERBOSE)
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
        if (!LoggerImpl.VERBOSE)
            return;
        
        LoggerImpl.log(args, 'ev');
    }
    
    /** @inheritDoc */
    public v(...args): void {
        if (!LoggerImpl.VERBOSE)
            return;
        
        LoggerImpl.log(args, 'v');
    }
    
    /** @inheritDoc */
    public d(...args): void {
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
}

// Exportar la instancia
export const Log = LoggerImpl.instance;
