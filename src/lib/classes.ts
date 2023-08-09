export class DistanceElement {
    dest: number;
    next: number;
    cost: number;

    constructor(dest: number, cost: number);
    constructor(dest: number, cost: number, next: number);
    constructor(...args: any[]){
        switch(args.length){
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
    vertex: Vertex

    constructor(id: number, x:number, y:number){
        this.id = id;
        this.distVec[id] = new DistanceElement(id, id, 0);
        this.vertex = new Vertex(x, y);
    }
    discover(links: Link[]) {
        Router.neighbours(this, links).forEach((x) => {
            if (this.distVec[x.dest] && this.distVec[x.dest].dest != this.distVec[x.dest].next)
                this.distVec[x.dest] = this.distVec[x.dest].cost < x.cost ? this.distVec[x.dest] : x;
            else
                this.distVec[x.dest] = x;
        })
    }
    static neighbours(s: Router, links: Link[]): DistanceElement[] {
        return links
                .filter((link) => link.routers.includes(s))
                .map((link) => { return new DistanceElement(Router.other(s, link.routers).id, link.cost) });
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