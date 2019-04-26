export default class Food {
    private position: p5.Vector;
    private sketch: p5;
    private radius: number;
    private isPoision: boolean;
    private eaten: boolean;

    constructor(p5Ref: p5, position: p5.Vector, isPoision: boolean) {
        this.sketch = p5Ref;
        this.position = position;
        this.radius = 4;
        this.isPoision = isPoision
    };

    public draw() {
        if (!this.isPoision) {
            this.sketch.fill(0, 153, 51);
            this.sketch.stroke(0, 153, 51);
            this.sketch.ellipse(this.position.x, this.position.y, this.radius, this.radius);
            return;
        }
        this.sketch.fill(204, 101, 192, 127);
        this.sketch.stroke(127, 63, 120);
        this.sketch.ellipse(this.position.x, this.position.y, this.radius, this.radius);
    };

    public getPosition(): p5.Vector {
        return this.position.copy();
    };

    public setEaten(): void {
        this.eaten = true;
    };

    public isEaten() {
        return this.eaten;
    };

    public poisoned(): boolean {
        return this.isPoision;
    };
}