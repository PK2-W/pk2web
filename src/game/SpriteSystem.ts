import { int } from '../support/types';

export class SpriteSystem{
         	private int next_free_prototype = 0;
    //
    //
    //
    // 	public:
    //
    // 	SpriteSystem();
    // 	~SpriteSystem();
    //
    // 	PK2Sprite* player;
    //
    // 	PK2Sprite_Prototyyppi protot[MAX_PROTOTYYPPEJA];
    // 	PK2Sprite spritet[MAX_SPRITEJA];
    // 	int taustaspritet[MAX_SPRITEJA];
    //
    //
    // 	int  protot_get_all();
    // 	void protot_clear_all();
    //
    // 	void clear();
    // 	void add(int protoype_id, int pelaaja, double x, double y, int emo, bool isbonus);
    // 	void add_ammo(int protoype_id, int pelaaja, double x, double y, int emo);
    // 	void sort_bg();
    // 	void start_directions();
    
    private protot_get(/*char *polku, char *tiedosto*/): int {
        // char aanipolku[255];
        // char testipolku[255];
        // strcpy(aanipolku,polku);
        //
        // //Check if have space
        // if(this.next_free_prototype >= MAX_PROTOTYYPPEJA)
        //     return 2;
        //
        // //Check if it can be loaded
        // if (protot[next_free_prototype].Lataa(polku, tiedosto) == 1)
        //     return 1;
        //
        // protot[next_free_prototype].indeksi = next_free_prototype;
        //
        // //Load sounds
        // for (int i=0;i<MAX_AANIA;i++){
        //
        //     if (strcmp(protot[next_free_prototype].aanitiedostot[i],"")!=0){
        //
        //         strcpy(testipolku,aanipolku);
        //         strcat(testipolku,"/");
        //         strcat(testipolku,protot[next_free_prototype].aanitiedostot[i]);
        //
        //         if (PK_Check_File(testipolku))
        //             protot[next_free_prototype].aanet[i] = protot_get_sound(aanipolku,protot[next_free_prototype].aanitiedostot[i]);
        //         else{
        //             getcwd(aanipolku, PE_PATH_SIZE);
        //             strcat(aanipolku,"/sprites/");
        //
        //             strcpy(testipolku,aanipolku);
        //             strcat(testipolku,"/");
        //             strcat(testipolku,protot[next_free_prototype].aanitiedostot[i]);
        //
        //             if (PK_Check_File(testipolku))
        //                 protot[next_free_prototype].aanet[i] = protot_get_sound(aanipolku,protot[next_free_prototype].aanitiedostot[i]);
        //         }
        //     }
        // }
        //
        // next_free_prototype++;
        //
        // return 0;
    };

    	  private protot_get_sound(char *polku, char *tiedosto):int{};
    	 private protot_get_transformation:void(int i){};
    	 private protot_get_bonus:void(int i){};
    	 private protot_get_ammo1:void(int i){};
    	 private protot_get_ammo2:void(int i){};

    	 private add_bg:void(int index){};
    
}
