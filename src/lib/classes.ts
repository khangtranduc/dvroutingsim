export class DistanceElement {
    dest: Router;
    next: Router;
    cost: number;

    constructor(de: DistanceElement);
    constructor(dest: Router, cost: number);
    constructor(dest: Router, cost: Router, next: number);
    constructor(...args: any[]){
        switch(args.length){
            case 1:
                this.dest = args[0].dest;
                this.next = args[0].next;
                this.cost = args[0].cost;
            case 2:
                this.dest = this.next = args[0];
                this.cost = args[1];
                break;
            case 3:
                this.dest = args[0];
                this.next = args[1];
                this.cost = args[2];
                break;
            default:
                throw Error("fuck you");
        }
    }

    clone(): DistanceElement {
        return new DistanceElement(this);
    }

    toString(): string {
        return `${this.dest} | ${this.next} | ${this.cost}`
    }
}

export class Vertex {
    x: number;
    y: number;
    radius = 10;
    fillStyle = "#22cccc";
    strokeStyle = "#009999";
    selectedFill = "#88aaaa";
    highStroke = "#ff0000";
    selected = false;
    highlighted = false;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
}

export class Router {
    id: number;
    distVec: DistanceElement[] = [];
    vertex: Vertex;
    dvQ: DistanceElement[][] = [];

    constructor(id: number, x:number, y:number){
        this.id = id;
        this.distVec[id] = new DistanceElement(this, this, 0);
        this.vertex = new Vertex(x, y);
    }
    discover(links: Link[]) {
        Router.neighbours(this, links).forEach((x) => {
            if (this.distVec[x.dest.id] && this.distVec[x.dest.id].dest != this.distVec[x.dest.id].next)
                this.distVec[x.dest.id] = this.distVec[x.dest.id].cost < x.cost ? this.distVec[x.dest.id] : x;
            else
                this.distVec[x.dest.id] = x;
        })
    }
    send(links: Link[]){
        Router.neighbours(this, links).forEach((x) => {x.dest.dvQ[this.id] = this.distVec; console.log(x.dest.dvQ)});
    }
    process(routers: Router[]){
        for (let i = 0; i < this.dvQ.length; i++){
            if (!this.dvQ[i]) continue;
            this.dvQ[i].forEach((x, i) => {
                this.distVec[i] = Router.min(this.distVec[i], x, routers[i]);
            });
        }
        this.dvQ = [];
    }
    static min(D: DistanceElement, c: DistanceElement, neighbour: Router): DistanceElement{
        if (!c) return D;
        let temp = c.clone();
        temp.next = neighbour;
        if (!D) return temp;
        return D.cost <= c.cost ? D : temp;
    }
    static neighbours(s: Router, links: Link[]): DistanceElement[] {
        return links
                .filter((link) => link.routers.includes(s))
                .map((link) => { return new DistanceElement(Router.other(s, link.routers), link.cost) });
    }
    static other(s: Router, routers: Router[]){
        return routers[0] == s? routers[1] : routers[0];
    }
}

export class Link {
    routers: Router[];
    cost: number
    constructor(u: Router, v: Router, cost: number){
        this.cost = cost;
        this.routers = [u, v];
    }
}