<script lang="ts">
    import { onMount } from "svelte";
    import { Link, Router } from "$lib/classes";
    import Layout from "./+layout.svelte";
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let routers: Router[] = [];
    let links: Link[] = [];
    let selection: Router|null;
    let createEdge = false;
    let editEdge = false;
    let edgeCost: number|null;
    let fromNode: Router|null;
    let toNode: Router|null;
    const within = (x: number, y: number) => {
        return routers.find(n => {
            return x > (n.vertex.x - n.vertex.radius) &&
                y > (n.vertex.y - n.vertex.radius) &&
                x < (n.vertex.x + n.vertex.radius) &&
                y < (n.vertex.y + n.vertex.radius);
        })
    }
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    const drawNode = (router: Router) => {
        ctx.beginPath();
        ctx.fillStyle = router.vertex.selected ? router.vertex.selectedFill : router.vertex.fillStyle;
        ctx.arc(router.vertex.x, router.vertex.y, router.vertex.radius, 0, Math.PI * 2, true);
        ctx.strokeStyle = router.vertex.highlighted ? router.vertex.highStroke : router.vertex.strokeStyle;
        ctx.lineWidth = router.vertex.highlighted ? 3 : 1;
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign="center";
        ctx.fillText(`${router.id}`, router.vertex.x, router.vertex.y);
    }
    const draw = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        //Draw Nodes
        for (let i = 0; i < routers.length; i++)
            drawNode(routers[i]);
        //Draw Edges
        for (let i = 0; i < links.length; i++) {
            let fromNode = links[i].routers[0];
            let toNode = links[i].routers[1];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.strokeStyle = fromNode.vertex.strokeStyle;
            ctx.moveTo(fromNode.vertex.x, fromNode.vertex.y);
            ctx.lineTo(toNode.vertex.x, toNode.vertex.y);
            ctx.stroke();
            ctx.fillStyle = '#000000'
            ctx.fillText(links[i].cost.toString(), (toNode.vertex.x + fromNode.vertex.x)/2, (toNode.vertex.y + fromNode.vertex.y)/2)
        }
    }
    const addEdge = (from: Router, to: Router, cost: number) => {
        let link = new Link(from, to, cost);
        if (!links.find((e) => (e.routers.includes(from) && e.routers.includes(to)))) 
            links = [...links, link];
        fromNode!.vertex.highlighted = false;
        fromNode?.discover(links);
        toNode?.discover(links);
        fromNode = null;
        toNode = null;
        console.log(routers[0].distVec);
        draw();
    }
    onMount(() => {
        ctx = canvas.getContext("2d")!;
        resize();
    });
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

<svelte:window 
    on:resize={resize}
    />

<canvas bind:this={canvas}
    on:contextmenu={(e) => {
        let target = within(e.x, e.y);
        if (target) {
            e.preventDefault();
            console.log(`show dv of ${target.id}`);
        }
    }}
    on:mousedown={(e) => {
        let target = within(e.x, e.y);
        if (selection && selection.vertex.selected){
            selection.vertex.selected = false;
        }
        if (target) {
            switch(e.button){
                case 0:
                    selection = target;
                    selection.vertex.selected = true;
                    break;
                case 1:
                    if (e.button == 1 && !fromNode) {
                        fromNode = target;
                        fromNode.vertex.highlighted = true;
                    }
                    else if (e.button == 1 && fromNode) {
                        if (fromNode != target){
                            toNode = target;
                            if (!links.find((e) => fromNode && 
                                toNode && 
                                e.routers.includes(fromNode) && 
                                e.routers.includes(toNode))){
                                createEdge = true;
                            }
                            else {
                                editEdge = true;
                            }
                        }
                        else {
                            fromNode.vertex.highlighted = false;
                            fromNode = null;
                        }
                    }
                    break;
            }
            draw();
        };
    }}
    on:mousemove={(e) => {
        if (selection && e.buttons){
            selection.vertex.x = e.x;
            selection.vertex.y = e.y;
            draw();
        }
    }}
    on:mouseup={(e) => {
        switch(e.button){
            case 0:
                if (!selection) {
                    let router = new Router(routers.length, e.x, e.y)
                    routers = [...routers, router];
                }
                break;
        }
        if (selection && !selection.vertex.selected) {
            selection = null;
        }
        draw();
    }}
/>

<a role="button" href={"#"}>Cum</a>

<style lang="scss">
    header {
        margin-bottom: 1rem;
    }
    article {
        padding-bottom: 1rem;
    }
    a {
        position: absolute;
        left: 0.1rem;
        top: 0.1rem;
    }
</style>