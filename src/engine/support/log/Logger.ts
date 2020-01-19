/**
 * Tanto en el servidor como en el cliente, el logger debe implementar esta interfaz.
 *
 * @version 1.2-stable
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
     * Muestra en consola el contenido especificado con el nivel "debug" (estándar).
     */
    d(...args): void;
    
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
    
}

/**
 * Niveles de log disponibles.
 */
export type TLogLevel = 't' | 'e' | 'w' | 's' | 'd' | 'v' | 'vv' | 'nv' | 'ev';
