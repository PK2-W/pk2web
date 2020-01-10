import { BYTE, bool, int } from '../../support/types';

export type TPK2Block = {
    koodi?: BYTE;
    tausta?: bool;
    vasemmalle?: BYTE;
    oikealle?: BYTE;
    ylos?: BYTE;
    alas?: BYTE;
    vasen?: int;
    oikea?: int;
    yla?: int;
    ala?: int;
    vesi?: bool;
    reuna?: bool;
};

export enum EBlocks {
    BLOCK_TAUSTA,          //BLOCK_BACKGROUND
    BLOCK_SEINA,           //BLOCK_WALL
    BLOCK_MAKI_OIKEA_YLOS, //BLOCK_MAX
    BLOCK_MAKI_VASEN_YLOS, //BLOCK_MAX_
    BLOCK_MAKI_OIKEA_ALAS, //BLOCK_MAX_
    BLOCK_MAKI_VASEN_ALAS, //BLOCK_MAX_
    BLOCK_MAKI_YLOS,       //BLOCK_MAX_UP
    BLOCK_MAKI_ALAS        //BLOCK_MAX_DOWN
}
