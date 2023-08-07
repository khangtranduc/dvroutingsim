import type { Node, Edge, DistanceElement } from "$lib/types"

export function neighbours(s: Node, edges: Edge[]): DistanceElement[] {
    return edges
            .filter((edge) => edge.nodes.includes(s))
            .map((edge) => { return { dest: other(s, edge.nodes), cost: edge.cost } });
}

export function other(s: Node, nodes: Node[]){
    return nodes[0] == s? nodes[1] : nodes[0];
}