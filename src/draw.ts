//import typescirpt types.
///<reference path='../p5-global-mode.d.ts'/>

//import grid
import Boid from './Boid';
declare const p5: any;

//extend existing window property, we have to put the draw and setup 
// functinos of the global window object for p5 to work in global mode
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

function p5Wrapper( sketch: p5 ): any {
    let boids: Boid[] = [];
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    sketch.setup = function() {
        console.log('Setup called here');
        sketch.createCanvas(canvasWidth - 30, canvasHeight-40);
        for (var i = 0; i<10; i++) {
            boids.push(
                new Boid(
                    new p5.Vector(Math.floor(Math.random() * canvasWidth-1), 
                    Math.floor(Math.random() * 799)), 
                    sketch,
                    canvasWidth,
                    window.innerHeight
                )
            )
        }
    };

    sketch.draw = function() {
        sketch.background(1);
        boids.forEach((boid: Boid) => {
            boid.draw()
        })
    };
};

(function(){
    new p5(p5Wrapper, document.getElementById('animated-background-canvas'));
})();
  

