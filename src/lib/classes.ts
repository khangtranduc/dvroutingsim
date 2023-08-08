import type { Node, DistanceElement, Edge } from "./types";

export class Router {
    id: number;
    distVec: DistanceElement[] = [];

    constructor(id: number){
        this.id = id;
        this.distVec[id] = {dest: id, next: id, cost: 0};
    }
    //TODO: refactor these to work for routers and links (make edges and nodes types for drawing only)
    static neighbours(s: Node, edges: Edge[]): DistanceElement[] {
        return edges
                .filter((edge) => edge.nodes.includes(s))
                .map((edge) => { return { dest: Router.other(s, edge.nodes).router.id, cost: edge.link.cost } });
    }

    static other(s: Node, nodes: Node[]){
        return nodes[0] == s? nodes[1] : nodes[0];
    }
}

export class Link {
    cost: number
    constructor(cost: number){
        this.cost = cost;
    }
}