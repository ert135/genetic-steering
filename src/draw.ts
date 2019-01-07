//import typescirpt types.
///<reference path='../p5-global-mode.d.ts'/>

//import grid
import Boid from './Boid';

//extend existing window property, we have to put the draw and setup functinos of the global window object for p5 to work in global mode
declare global {
    interface Window {
        setup: any;
        draw: any;
        mousePressed: any;
        mouseReleased: any;
        preload: any;
        mouseClicked: any;
        started: boolean;
    }
}

let setup = function() {
    let boid = new Boid();
}

let draw = function() {

}

window.setup = setup;
window.draw = draw;