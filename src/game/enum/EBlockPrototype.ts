export enum EBlockPrototype {
    /** Platform only traversable upwards. */
    BLOCK_ESTO_ALAS = 40,
    /**
     * Horizontal elevator.<br>
     * SRC: BLOCK_HISSI_HORI */
    BLOCK_ELEVATOR_H = 41,
    /** Vertical elevator.<br>
     * SRC: BLOCK_HISSI_VERT */
    BLOCK_ELEVATOR_V = 42,
    /**
     * Block driven up when switch 2 ({@link BLOCK_SWITCH2}) is actuated.<br>
     * SRC: BLOCK_KYTKIN2_YLOS */
    BLOCK_SWITCH2_GATE_U = 43,
    /**
     * Block driven down when switch 2 ({@link BLOCK_SWITCH2}) is actuated.<br>
     * SRC: BLOCK_KYTKIN2_ALAS */
    BLOCK_SWITCH2_GATE_D = 45,
    /**
     * Block driven to the left when switch 3 ({@link BLOCK_SWITCH3}) is actuated.<br>
     * SRC: BLOCK_KYTKIN3_OIKEALLE */
    BLOCK_SWITCH3_GATE_L = 44,
    /**
     * Block driven to the right when switch 3 ({@link BLOCK_SWITCH3}) is actuated.<br>
     * SRC: BLOCK_KYTKIN3_VASEMMALLE */
    BLOCK_SWITCH3_GATE_R = 46,
    /** Lock. */
    BLOCK_LUKKO = 47,
    /**
     * Foreground skull block.
     * SRC: BLOCK_KALLOSEINA */
    BLOCK_KALLOSEINA = 48,
    /**
     * Background skull block.
     * SRC: BLOCK_KALLOTAUSTA */
    BLOCK_KALLOTAUSTA = 49,
    /** Animated block 1 (60..64). */
    BLOCK_ANIM1 = 60,
    /** Animated block 2 (65..69). */
    BLOCK_ANIM2 = 65,
    /** Animated block 3 (70..74). */
    BLOCK_ANIM3 = 70,
    /** Animated block 4 (75..79). */
    BLOCK_ANIM4 = 75,
    BLOCK_WATER_SURFACE = 130,
    BLOCK_WATERFALL = 131,
    BLOCK_VIRTA_VASEMMALLE = 140,
    BLOCK_VIRTA_OIKEALLE = 141,
    BLOCK_VIRTA_YLOS = 142,
    /** Hideout. */
    BLOCK_PIILO = 143,
    /** Fire. */
    BLOCK_TULI = 144,
    /**
     * Switch button 1.<br>
     * SRC: BLOCK_KYTKIN1 */
    BLOCK_SWITCH1 = 145,
    /**
     * Switch button 2.<br>
     * SRC: BLOCK_KYTKIN2 */
    BLOCK_SWITCH2 = 146,
    /**
     * Switch button 3.<br>
     * SRC: BLOCK_KYTKIN3 */
    BLOCK_SWITCH3 = 147,
    BLOCK_ALOITUS = 148,
    BLOCK_LOPETUS = 149
}