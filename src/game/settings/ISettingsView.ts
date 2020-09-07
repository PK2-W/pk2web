export interface ISettingsView {
    version: string;
    loaded: boolean; // if it was started here
    language: string; // language
    
    // video
    transparent_objects: boolean;
    transparent_menutexts: boolean;
    show_effects: boolean;
    show_goods: boolean;
    show_sprites_bg: boolean;
    
    double_speed: boolean
    
    // controls
    control_left: number;
    control_right: number;
    control_jump: number;
    control_down: number;
    control_walk_slow: number;
    control_attack1: number;
    control_attack2: number;
    control_open_gift: number;
    
    // audio
    music: boolean;
    sounds: boolean;
    
    // + version 1.1
    is_fullscreen: boolean;
    is_filtered: boolean;
    is_fit: boolean;
    
    is_wide: boolean;
    
    // + version 1.2
    music_max_volume: number;
    sfx_max_volume: number;
}