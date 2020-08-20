import { Pekka } from '@game/Pekka';

document.addEventListener('click', launch);

function launch() {
    document.removeEventListener('click', launch);
    
    window.pk2w = new Pekka();
    pk2w.main();
}