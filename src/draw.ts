//import typescirpt types.
///<reference path='../p5-global-mode.d.ts'/>

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
};

function p5Wrapper( sketch: p5 ): any {
    let boids: Boid[] = [];
    let foods: Food[] = [];
    let poisioned: Food[] = [];
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    sketch.setup = function() {
        sketch.createCanvas(canvasWidth, canvasHeight);
        for (var i = 0; i<100; i++) {
            foods.push(
                new Food(
                    sketch,
                    new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)),
                    false
                )
            )
        }
        for (var i = 0; i<30; i++) {
            foods.push(
                new Food(
                    sketch,
                    new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)),
                    true
                )
            )
        }
        for (var i = 0; i<10; i++) {
            boids.push(
                new Boid(
                    new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)), 
                    sketch,
                    canvasWidth,
                    window.innerHeight
                )
            )
        }
    };

    const isNotEaten = (t: Food): boolean => !t.isEaten() && !t.poisoned();
    const isPoision = (t: Food): boolean => t.poisoned() && !t.isEaten();

    sketch.draw = function() {
        sketch.background(1);
        const remainingFood = R.filter(isNotEaten, foods);
        const poisionedFood = R.filter(isPoision, foods)
        boids.forEach((boid: Boid) => {
            boid.behaviours(remainingFood,poisionedFood);
            boid.update();
            boid.draw();
        });
        foods = remainingFood.concat(poisionedFood);
        foods.forEach((food: Food) => {
            food.draw();
        });
    };
};

(function(){
    new p5(p5Wrapper, document.getElementById('animated-background-canvas'));
})();
  

