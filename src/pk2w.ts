import { PK2 } from './game/PK2';

document.addEventListener('click', launch);

function launch() {
    document.removeEventListener('click', launch);
    
    window.pk2w = new PK2();
    pk2w.main();
}
