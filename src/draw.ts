//import typescirpt types.
///<reference path='../p5-global-mode.d.ts'/>

import Boid from './Boid';
import Food from './Food';
import * as R from 'ramda';
declare const p5: any;

// extend existing window property, we have to put the draw and setup 
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
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    const createNewFood = (sketchRef: p5, isBad: boolean) => (
        new Food(
            sketchRef,
            new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)),
            isBad
        )
    );

    sketch.setup = function() {
        sketch.createCanvas(canvasWidth, canvasHeight);
        //create food
        for (var i = 0; i<100; i++) {
            foods.push(
                createNewFood(sketch, false)
            )
        }
        //create poison
        for (var i = 0; i<30; i++) {
            foods.push(
                createNewFood(sketch, true)
            )
        }
        //create boids
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

    const isNotEaten = (food: Food): boolean => !food.isEaten() && !food.poisoned();
    const isPoision = (food: Food): boolean => food.poisoned() && !food.isEaten();
    const isNotDead = (boid: Boid): boolean => !boid.isDead();
    const isNotNull = (item: any): boolean => item != null;
    const onPercent = (percent: Number): boolean => sketch.random(0,1) <= percent;

    const createFoodConditional = R.cond([
        [R.equals(true), (a: boolean[]) => {return createNewFood(sketch, false)}],
        [R.equals(false), R.always(null)]
    ]);

    const createPoisionConditional = R.cond([
        [R.equals(true), (a: boolean[]) => {return createNewFood(sketch, false)}],
        [R.equals(false), R.always(null)]
    ]);

    sketch.draw = function() {
        sketch.background(1);
        const remainingFood = R.filter(isNotNull, R.append(createFoodConditional(onPercent(0.04)), R.filter(isNotEaten, foods)));
        const poisionedFood = R.filter(isNotNull, R.append(createPoisionConditional(onPercent(0.01)), R.filter(isPoision, foods)));

        boids.forEach((boid: Boid) => {
            boid.behaviours(remainingFood,poisionedFood);
            boid.update();
            boid.draw();
        });
        boids = R.filter(isNotDead, boids);
        foods = remainingFood.concat(poisionedFood);
        foods.forEach((food: Food) => {
            food.draw();
        });
    };
};

(function(){
    new p5(p5Wrapper, document.getElementById('animated-background-canvas'));
})();
  

