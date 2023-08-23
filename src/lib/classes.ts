export class Network {
    name: string;
    routers: Router[];
    links: Link[];

    constructor(name: string, routers: Router[], links: Link[]){
        this.name = name;
        this.routers = routers;
        this.links = links;
    }
}

export class DistanceElement {
    dest: Router;
    next: Router;
    cost: number;

    constructor(de: DistanceElement);
    constructor(dest: Router, cost: number);
    constructor(dest: Router, next: Router, cost: number);
    constructor(...args: any[]){
        switch(args.length){
            case 1:
                this.dest = args[0].dest;
                this.next = args[0].next;
                this.cost = args[0].cost;
                break;
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

    compare(other: DistanceElement): boolean {
        if (!other) return false;
        return this.dest == other.dest && 
            this.next == other.next &&
            this.cost == other.cost
    }

    pojo() {
        return {
            dest: this.dest.id,
            next: this.next.id,
            cost: this.cost
        }
    }

    toString(): string {
        return `[${this.dest.id} | ${this.next.id} | ${this.cost}]`
    }
}

export class Vertex {
    x: number;
    y: number;
    wx: number;
    wy: number;
    radius = 20;
    fillStyle = "#22cccc";
    strokeStyle = "#009999";
    selectedFill = "#88aaaa";
    highStroke = "#ff0000";
    selected = false;
    highlighted = false;

    constructor(x: number, y: number, wx: number, wy: number){
        this.x = x;
        this.y = y;
        this.wx = wx;
        this.wy = wy;
    }
}

export class Router {
    id: number;
    distVec: DistanceElement[] = [];
    vertex: Vertex;
    dvQ: DistanceElement[][] = [];
    C: DistanceElement[] = [];

    constructor(id: number, x:number, y:number, wx: number, wy:number){
        this.id = id;
        this.distVec[id] = new DistanceElement(this, this, 0);
        this.C[id] = this.distVec[id];
        this.dvQ[id] = this.distVec;
        this.vertex = new Vertex(x, y, wx, wy);
    }
    getX(wx: number){
        return this.vertex.x * wx/this.vertex.wx
    }
    getY(wy: number){
        return this.vertex.y * wy/this.vertex.wy
    }
    setX(x: number, wx: number){
        this.vertex.x = x * this.vertex.wx / wx;
    }
    setY(y: number, wy: number){
        this.vertex.y = y * this.vertex.wy / wy;
    }
    reset() {
        this.distVec = [];
        this.distVec[this.id] = new DistanceElement(this, this, 0);
        this.C[this.id] = this.distVec[this.id];
        this.dvQ = [];
        this.dvQ[this.id] = this.distVec;
    }
    discover(links: Link[]) {
        Router.neighbours(this, links).forEach((x) => {
            // console.log(`${x} ${this.C[x.dest.id]}`);
            // console.log(!x.compare(this.C[x.dest.id]));
            let flag = false;
            if (!x.compare(this.C[x.dest.id])) flag = true;
            this.C[x.dest.id] = x;
            if (flag) {
                delete this.distVec[x.dest.id];
                delete this.dvQ[x.dest.id];
            }
        })
    }
    send(links: Link[]){
        // this.discover(links);
        Router.neighbours(this, links).forEach((x) => {
            // let flag = false;
            // if (Router.distVecDiff(x.dest.dvQ[this.id], this.distVec)){
            //     x.dest.discover(links);
            //     flag = true;
            // }
            x.dest.discover(links);
            x.dest.dvQ[this.id] = [];
            for (let i = 0; i < this.distVec.length; i++)
                if (this.distVec[i])
                    x.dest.dvQ[this.id][i] = this.distVec[i].clone();
            x.dest.recalc(this.id);
            // if (flag) {
            //     x.dest.recalc(this.id);
            // }
        });
    }
    pojo() {
        return {
            id: this.id,
            vertex: this.vertex
        }
    }
    recalc(from: number){
        let N = Math.max(this.C.length, this.distVec.length, this.dvQ[from].length)
        // console.log(`${this.id} ${from} ${N}`);
        // console.log(this.dvQ);
        for (let i = 0; i < N; i++)
            this.distVec[i] = Router.min(this.distVec[i], this.C[from], this.dvQ[from][i])
    }
    static dvPojo(dv: DistanceElement[]){
        return dv.map(x => x.pojo());
    }
    static min(Dxy: DistanceElement, Cxv: DistanceElement, Dvy: DistanceElement): DistanceElement{
        if (!Dvy) return Dxy;
        let alt = new DistanceElement(Dvy.dest, Cxv.dest, Cxv.cost + Dvy.cost);
        if (!Dxy || Dxy.next == Cxv.dest) return alt;
        return alt.cost < Dxy.cost ? alt : Dxy;
    }
    static distVecDiff(dv1: DistanceElement[], dv2: DistanceElement[]): boolean {
        if (!dv1 || !dv2) return true;
        if (dv1.length != dv2.length) return true;
        for (let i = 0; i < dv1.length; i++){
            if (dv1[i] && dv2[i] && !dv1[i].compare(dv2[i])) return true;
        }
        return false;
    }
    static neighbours(s: Router, links: Link[]): DistanceElement[] {
        return links
                .filter((link) => link.routers.includes(s))
                .map((link) => { return new DistanceElement(Router.other(s, link.routers), link.cost) });
    }
    static other(s: Router, routers: Router[]): Router{
        return routers[0] == s? routers[1] : routers[0];
    }
    static diff(dv1: DistanceElement[], dv2: DistanceElement[]){
        for (let i = 0; i < dv1.length; i++){
            if (dv1[i].dest != dv2[i].dest ||
                dv1[i].next != dv2[i].next ||
                dv1[i].cost != dv2[i].cost)
                return true;
        }
        return false;
    }
}

export class Link {
    routers: Router[];
    cost: number
    constructor(u: Router, v: Router, cost: number){
        this.cost = cost;
        this.routers = [u, v];
    }
    pojo() {
        return {
            routers: this.routers.map(x => x.pojo()),
            cost: this.cost
        }
    }
}