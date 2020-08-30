/**
 * Tanto en el servidor como en el cliente, el logger debe implementar esta interfaz.
 *
 * @version 2.1-stable
 */
export interface Logger {
    
    /**
     * Muestra en consola el contenido especificado con el nivel "very verbose".
     */
    vv(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "verbose".
     */
    v(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "network verbose".<br>
     * Reservado para eventos de red.
     */
    nv(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "events verbose".<br>
     * Solo aplicable al servidor. Reservado para eventos del sistema (EventManager).
     */
    ev(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "debug".
     */
    d(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "log" (estándar).
     */
    l(...args): void
    
    /**
     * Muestra en consola el contenido especificado con el nivel "success".
     */
    s(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "warning".
     */
    w(...args): void;
    
    /**
     * Muestra en consola el contenido especificado con el nivel "error".
     */
    e(...args): void;
    
    /**
     * Muestra en consola un listado de líneas agrupadas con el nivel "debug".<br>
     * El grupo se encontrará colapsado por defecto.<br>
     * La primera de las líneas será la cabecera del grupo.
     *
     * @param lines
     */
    dg(...lines: any[][]): void;
    
    fast(key: string, msg: string | number): void;
    
    /**
     * Determina si el nivel establecido en el logger es DEBUG o inferior.
     */
    isDebug(): boolean;
}

/**
 * Niveles de log disponibles.
 */
export type TLogLevel = 't' | 'e' | 'w' | 's' | 'l' | 'd' | 'v' | 'vv' | 'nv' | 'ev';
