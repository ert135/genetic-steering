import Food from './Food';

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

    private dna: Array<number>;
    private goodSteeringForce: p5.Vector;
    private badSteeringForce: p5.Vector;

    constructor(
        initialPosition: p5.Vector,
        p5ref: p5,
        initialCanvasWidth: number,
        initialCanvasHeight: number
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
        this.maxSpeed = 8;

        this.health = 1;

        this.getDefaultDna();
    };

    public behaviours(goodBehaviour: Array<Food>, badBehaviour: Array<Food>) {
        this.goodSteeringForce = this.eat(goodBehaviour);
        this.badSteeringForce = this.eat(badBehaviour)
        this.goodSteeringForce.mult(this.dna[0]);
        this.badSteeringForce.mult(this.dna[1]);

        this.applyForce(this.goodSteeringForce);
        this.applyForce(this.badSteeringForce);
    };

    public update(): void {
        this.health -= 0.001;
        this.checkHealth()
        this.velocity.add(this.acceleration);
        this.velocity.limit(2);
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
            this.health += 0.5;
        } else if(!closest.poisoned()) {
            this.health += 0.5;
        }
    }

    public eat(food: Food[]): p5.Vector {
        const closest = food.reduce((closestFood: Food, currentValue: Food) => {
            const dist = this.sketch.dist(this.position.x, this.position.y, currentValue.getPosition().x, currentValue.getPosition().y);
            if (dist <= this.sketch.dist(this.position.x, this.position.y, closestFood.getPosition().x, closestFood.getPosition().y)) {
                return currentValue;
            } else return closestFood
        }, food[0]);

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
        this.sketch.push();
            this.sketch.translate(this.position.x, this.position.y);
            this.sketch.rotate(theta);
            this.sketch.beginShape();
                this.sketch.vertex(0, -this.radius * 2);
                this.sketch.vertex(-this.radius, this.radius);
                this.sketch.vertex(this.radius, this.radius);
            this.sketch.endShape(close);
        this.sketch.pop();
    };

    public applyForce(force: p5.Vector) {
        this.acceleration.add(force.copy());
    };

    public isDead(): Boolean {
        return (this.health <= 0);
    }

    private getDefaultDna(): any {
        this.dna=[];
        this.dna[0] = this.sketch.random(-0.05, 0.05);
        this.dna[1] = this.sketch.random(-0.05, 0.05);
    };

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