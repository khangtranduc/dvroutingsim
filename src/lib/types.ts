import type { Link, Router } from "./classes"

export type DistanceElement = {
    dest: number,
    next?: number,
    cost: number
}

export type Node = {
    x: number,
    y: number,
    radius: number,
    fillStyle: string,
    strokeStyle: string,
    selectedFill: string,
    highStroke: string,
    router: Router,
    selected?: boolean,
    highlighted?: boolean
}

export type Edge = {
    nodes: Node[],
    link: Link
}