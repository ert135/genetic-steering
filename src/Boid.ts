import Food from './Food';

export default class Boid {
    private initialPosition: p5.Vector
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
    private goodSteeringForce: p5.Vector;;
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
        this.radius = 6;
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
        this.velocity.limit(1);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.checkEdges();
    };

    private checkHealth() {
        var green = this.sketch.color(0, 255, 0);
        var red = this.sketch.color(255, 0, 0);

        this.color = this.sketch.lerpColor(red, green, this.health);

        if (this.health <= 0) {
            this.dead = true;
        }
    };

    public seek(target: p5.Vector): p5.Vector {
        var desired = target.sub(this.position);
        desired.setMag(this.maxSpeed);
        return desired.sub(this.velocity);
    };

    public eat(food: Food[]): p5.Vector {
        let record = Infinity;
        let closest: Food = null;

        //Could refactor to use reduce
        food.forEach((item: Food) => {
            let dist = this.sketch.dist(this.position.x, this.position.y, item.getPosition().x, item.getPosition().y);
            if (dist < record) {
                record = dist;
                closest = item;
            }
            if (record < 10) {
                // if(closest.poisoned){
                //     this.health -= 0.05;
                // } else if(!closest.poisoned) {
                //     this.health += 0.5;
                // }
                closest.setEaten();
            }
        });

        if (closest !== null) {
            return this.seek(closest.getPosition());
        };

        return this.sketch.createVector(0, 0);
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

    private getDefaultDna(): any {
        this.dna=[];
        this.dna[0] = this.sketch.random(0.01, 0.01);
        this.dna[1] = this.sketch.random(0, 0);
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

    private buildAvoidSteeringForce(target: p5.Vector) {
        var desired = target.sub(this.position).mult(-1);
        desired.setMag(this.maxSpeed);
    
        var steer = desired.sub(this.velocity);

        steer.limit(this.maxforce); // Limit to maximum steering force
    
        this.applyForce(steer);
    };
}