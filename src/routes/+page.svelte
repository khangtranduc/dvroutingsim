<script lang="ts">
    import { onMount } from "svelte";
    import { neighbours, other } from "$lib/dv";
    import type { Node, Edge } from "$lib/types";
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let selection: any;
    let createEdge = false;
    let edgeCost: any;
    let fromNode: Node|null;
    let toNode: Node|null;
    const within = (x: number, y: number) => {
        return nodes.find(n => {
            return x > (n.x - n.radius) &&
                y > (n.y - n.radius) &&
                x < (n.x + n.radius) &&
                y < (n.y + n.radius);
        })
    }
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    const drawNode = (node: Node) => {
        ctx.beginPath();
        ctx.fillStyle = node.selected ? node.selectedFill : node.fillStyle;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
        ctx.strokeStyle = node.highlighted ? node.highStroke : node.strokeStyle;
        ctx.lineWidth = node.highlighted ? 3 : 1;
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign="center";
        ctx.fillText(node.id.toString(), node.x, node.y);
    }
    const draw = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        //Draw Nodes
        for (let i = 0; i < nodes.length; i++)
            drawNode(nodes[i]);
        //Draw Edges
        for (let i = 0; i < edges.length; i++) {
            let fromNode = edges[i].nodes[0];
            let toNode = edges[i].nodes[1];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.strokeStyle = fromNode.strokeStyle;
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
            ctx.fillStyle = '#000000'
            ctx.fillText(edges[i].cost.toString(), (toNode.x + fromNode.x)/2, (toNode.y + fromNode.y)/2)
        }
    }
    const addEdge = (from: Node, to: Node, cost: number) => {
        let nodes: Node[] = [from, to];
        let edge: Edge = { nodes, cost };
        if (!edges.find((e) => (e.nodes.includes(from) && e.nodes.includes(to)))) 
            edges = [...edges, edge];
        fromNode!.highlighted = undefined;
        fromNode = null;
        toNode = null;
        draw();
    }
    onMount(() => {
        let tmp = canvas.getContext("2d");
        if (tmp != null) ctx = tmp;
        ctx.fillStyle = "rgb(200, 0, 0)";
        resize();
    });
    $: console.log(neighbours(nodes[0], edges).map((x) => `${x.dest.id}, ${x.cost}`))
</script>

{#if createEdge}
<dialog open>
    <article>
        <header>
            <a class="close" href={'#'} on:click={() => {createEdge = false}}> </a>
            Create Edge
        </header>
        <label>
            Edge cost
            <input type="number" placeholder="Enter edge cost" bind:value={edgeCost} required/>
        </label>
        <button on:click={() => {
            if (edgeCost 
                && fromNode
                && toNode) addEdge(fromNode, toNode, edgeCost);
            createEdge = false;
            edgeCost = null;
        }}>
            Add Edge
        </button>
    </article>
</dialog>
{/if}

<svelte:window on:resize={resize}/>

<canvas bind:this={canvas}
    on:mousedown={(e) => {
        let target = within(e.x, e.y);
        if (selection && selection.selected){
            selection.selected = false;
        }
        if (target) {
            if (e.button == 1 && !fromNode) {
                fromNode = target;
                fromNode.highlighted = true;
            }
            else if (e.button == 1 && fromNode) {
                if (fromNode != target){
                    toNode = target;
                    if (!edges.find((e) => fromNode && 
                        toNode && 
                        e.nodes.includes(fromNode) && 
                        e.nodes.includes(toNode))){
                        createEdge = true;
                    }
                }
                else {
                    fromNode.highlighted = false;
                    fromNode = null;
                }
            }
            selection = target;
            selection.selected = true;
            draw();
        };
    }}
    on:mousemove={(e) => {
        if (selection && e.buttons){
            selection.x = e.x;
            selection.y = e.y;
            draw();
        }
    }}
    on:mouseup={(e) => {
        if (!selection) {
            let node = {
                id: nodes.length,
                x: e.x,
                y: e.y,
                radius: 10,
                fillStyle: '#22cccc',
                strokeStyle: '#009999',
                selectedFill: '#88aaaa',
                highStroke: '#ff0000'
            };
            nodes = [...nodes, node];
            drawNode(node);
        }
        if (selection && !selection.selected) {
            selection = undefined;
        }
        draw();
    }}
/>

<style lang="scss">
    header {
        margin-bottom: 1rem;
    }
    article {
        padding-bottom: 1rem;
    }
</style>