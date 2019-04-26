import Food from './Food';
import {IDNA} from './DNA';

export default class Boid {
    private initialPosition: p5.Vector;
    private sketch: p5;
    private size: number;
    private driftForce: p5.Vector;
    private acceleration: p5.Vector;
    private velocity: p5.Vector;
    private position: p5.Vector;
    private forces: p5.Vector[];
    private canvasWidth: number;
    private canvasHeight: number;
    private maxforce: number;
    private radius: number;
    private maxSpeed: number;
    private health: number;
    private color: any;
    public dead: boolean;
    private goodSteeringForce: p5.Vector;
    private badSteeringForce: p5.Vector;

    constructor(
        initialPosition: p5.Vector,
        p5ref: p5,
        initialCanvasWidth: number,
        initialCanvasHeight: number,
        private DNA: IDNA
    ) {
        this.initialPosition = initialPosition;
        this.sketch = p5ref;
        this.size = Math.floor(Math.floor(Math.random() * 7));
        this.driftForce = new p5.Vector(this.getRandomArbitrary(-1, 1), this.getRandomArbitrary(-1, 1));
        this.acceleration = this.driftForce;
        this.velocity = new p5.Vector();
        this.position = new p5.Vector(initialPosition.x, initialPosition.y);
        this.forces = [];
        this.canvasWidth = initialCanvasWidth;
        this.canvasHeight = initialCanvasHeight;
        this.maxforce = 0.05;
        this.radius = 4;
        this.maxSpeed = 6;
        this.health = 1;
    };

    public behaviours(goodBehaviour: Array<Food>, badBehaviour: Array<Food>) {
        this.goodSteeringForce = this.eat(goodBehaviour);
        this.badSteeringForce = this.eat(badBehaviour)
        this.goodSteeringForce.mult(this.DNA.foodAttraction);
        this.badSteeringForce.mult(this.DNA.poisonAttraction);

        this.applyForce(this.goodSteeringForce);
        this.applyForce(this.badSteeringForce);
    };

    public update(): void {
        this.health -= 0.005;
        this.checkHealth()
        this.velocity.add(this.acceleration);
        this.velocity.limit(1);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.checkEdges();
    };

    public seek(target: Food): p5.Vector {
        var desired = target.getPosition().sub(this.position);
        if(desired.mag() < 5){
            target.setEaten();
        }
        desired.setMag(this.maxSpeed);
        return desired.sub(this.velocity);
    };

    private getFoodDistance(food: Food) {
        return this.sketch.dist(
            this.position.x, 
            this.position.y, 
            food.getPosition().x, 
            food.getPosition().y
        )
    }

    private adjustHealth(closest: Food) {
        if (closest.poisoned()){
            this.health -= 0.7;
        } else if(!closest.poisoned()) {
            this.health += 0.4;
        }
    }

    private checkPerception(food: Food): boolean {
        if (!food.poisoned()) {
            return this.getFoodDistance(food) < this.DNA.foodSightRange ? true : false;
        } else {
            return this.getFoodDistance(food) < this.DNA.poisonSightRange ? true : false;
        }
    }

    public eat(food: Food[]): p5.Vector {
        // Gets the closest food that's within the boids perception range from DNA
        const closest = food.reduce((closestFood: Food, currentValue: Food) => {
            if (
                this.getFoodDistance(currentValue) <= 
                this.getFoodDistance(closestFood) &&
                this.checkPerception(currentValue)
            ) {
                return currentValue;
            } else return closestFood
        });

        if (this.getFoodDistance(closest) < 5) {
            this.adjustHealth(closest);
        }

        return this.seek(closest);
    };

    public draw() {
        var theta = this.velocity.heading() + this.sketch.PI / 2;
        this.sketch.fill(this.color);
        this.sketch.stroke(this.color);
        this.sketch.strokeWeight(1);
        this.sketch.push()
            this.sketch.translate(this.position.x, this.position.y);
            this.sketch.rotate(theta);
            this.sketch.beginShape();

        //UNCOMMENT BELOW to draw debug attraction radii

        // this.sketch.noFill();
        // this.sketch.stroke(0, 153, 51);
        // this.sketch.ellipse(0,0,this.DNA.foodSightRange* 2)
        // this.sketch.stroke(127, 63, 120);
        // this.sketch.ellipse(0,0,this.DNA.poisonSightRange* 2)

                this.sketch.vertex(0, -this.radius * 2);
                this.sketch.vertex(-this.radius, this.radius);
                this.sketch.vertex(this.radius, this.radius);
            this.sketch.endShape(close);
        this.sketch.pop();
        //this.sketch.ellipse()
    };

    public applyForce(force: p5.Vector) {
        this.acceleration.add(force.copy());
    };

    public isDead(): Boolean {
        return (this.health <= 0);
    }

    //disgusting hack
    private onePercent(): boolean {
        return this.sketch.random(0,1) <= 0.004 ? true : false;
    }

    private crossOver(): IDNA {
        return {
            foodAttraction: this.DNA.foodAttraction + 0.005,
            poisonAttraction: this.DNA.poisonAttraction - 0.005,
            foodSightRange: this.DNA.foodSightRange + 0.05,
            poisonSightRange: this.DNA.poisonSightRange + 0.05
        }
    }

    public reproduce(): Boid {
        if(this.onePercent()){
            return new Boid(
                new p5.Vector(Math.floor(Math.random() * this.canvasWidth), Math.floor(Math.random() * this.canvasWidth)),
                this.sketch,
                this.canvasWidth,
                window.innerHeight,
                this.crossOver()
            )
        }
    }

    private getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    };

    private checkEdges() {
        if (this.position.x > this.canvasWidth) {
            this.position.x = 0;
        }

        if (this.position.y > this.canvasHeight) {
            this.position.y = 0;
        }

        if (this.position.y < 0) {
            this.position.y = this.canvasHeight;
        }

        if (this.position.x < 0) {
            this.position.x = this.canvasWidth;
        }
    };

    private checkHealth() {
        var green = this.sketch.color(0, 255, 0);
        var red = this.sketch.color(255, 0, 0);

        this.color = this.sketch.lerpColor(red, green, this.health);

        if (this.health <= 0) {
            this.dead = true;
        }
    };
}