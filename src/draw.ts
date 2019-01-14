//import typescirpt types.
///<reference path='../p5-global-mode.d.ts'/>

//import grid
import Boid from './Boid';
import Food from './Food';
import * as R from 'ramda';
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
    let foods: Food[] = [];
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    sketch.setup = function() {
        sketch.createCanvas(canvasWidth, canvasHeight);
        for (var i = 0; i<100; i++) {
            boids.push(
                new Boid(
                    new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)), 
                    sketch,
                    canvasWidth,
                    window.innerHeight
                )
            )
            foods.push(
                new Food(
                    sketch,
                    new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight))
                )
            )
        }
    };

    const isEaten = (t: Food): boolean => {return !t.isEaten()}

    sketch.draw = function() {
        sketch.background(1);
        boids.forEach((boid: Boid) => {
            boid.eat(foods);
            boid.update();
            boid.draw();
        });
        foods.forEach((food: Food) => {
            food.draw();
        });
        foods = R.filter(isEaten, foods);
    };
};

(function(){
    new p5(p5Wrapper, document.getElementById('animated-background-canvas'));
})();
  

