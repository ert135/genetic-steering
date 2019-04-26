//import typescirpt types.
///<reference path='../p5-global-mode.d.ts'/>

import Boid from './Boid';
import Food from './Food';
import {IDNA} from './DNA'
import * as R from 'ramda';
declare const p5: any;

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

    const generateInitialDNA = (): IDNA => {
        return {
            foodAttraction: sketch.random(-0.005, 0.005),
            poisonAttraction: sketch.random(-0.01, 0.008),
            foodSightRange: sketch.random(8, 100),
            poisonSightRange: sketch.random(8, 100)
        }
    }

    sketch.setup = function() {
        sketch.createCanvas(canvasWidth, canvasHeight);
        //create food
        for (var i = 0; i<80; i++) {
            foods.push(
                createNewFood(sketch, false)
            )
        }
        //create poison
        for (var i = 0; i<40; i++) {
            foods.push(
                createNewFood(sketch, true)
            )
        }
        //create boids
        for (var i = 0; i<30; i++) {
            boids.push(
                new Boid(
                    new p5.Vector(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight)), 
                    sketch,
                    canvasWidth,
                    window.innerHeight,
                    generateInitialDNA()
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
        [R.equals(true), (a: boolean[]) => {return createNewFood(sketch, true)}],
        [R.equals(false), R.always(null)]
    ]);

    sketch.draw = function() {
        sketch.background(1);
        //trying to be functional
        const remainingFood = R.filter(isNotNull, R.append(createFoodConditional(onPercent(0.08)), R.filter(isNotEaten, foods)));
        const poisionedFood = R.filter(isNotNull, R.append(createPoisionConditional(onPercent(0.04)), R.filter(isPoision, foods)));

        boids.forEach((boid: Boid) => {
            boid.behaviours(remainingFood,poisionedFood);
            boid.update();
            let child = boid.reproduce();
            if(child){
                boids.push(child)
            }
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
  

