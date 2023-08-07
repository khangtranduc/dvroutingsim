export type DistanceElement = {
    dest: Node,
    next?: Node,
    cost: number,
}

export type Node = {
    id: number,
    x: number,
    y: number,
    radius: number,
    fillStyle: string,
    strokeStyle: string,
    selectedFill: string,
    highStroke: string,
    distanceVector?: DistanceElement[]
    selected?: boolean,
    highlighted?: boolean
}

export type Edge = {
    nodes: Node[],
    cost: number
}