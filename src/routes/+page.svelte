<script lang="ts">
    import { onMount } from "svelte";
    import type { Node } from "$lib/types";
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let nodes: Node[] = [];
    let selection: any;
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
        ctx.fillStyle = node.fillStyle;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
        ctx.strokeStyle = node.strokeStyle;
        ctx.stroke();
        ctx.fill();
    }
    const draw = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            ctx.beginPath();
            ctx.fillStyle = node.selected ? node.selectedFill : node.fillStyle;;
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
            ctx.strokeStyle = node.strokeStyle;
            ctx.fill();
            ctx.stroke();
    }
    }
    onMount(() => {
        let tmp = canvas.getContext("2d");
        if (tmp != null) ctx = tmp;
        ctx.fillStyle = "rgb(200, 0, 0)";
        resize();
    });
</script>

<svelte:window 
    on:resize={resize} 
    on:mousedown={(e) => {
        let target = within(e.x, e.y);
        if (target) {
            selection = target
            selection.selected = true;
        };
    }}
    on:mousemove={(e) => {
        if (selection){
            selection.x = e.x;
            selection.y = e.y;
            selection.moving = true;
            draw();
        }
    }}
    on:mouseup={(e) => {
        if (!selection || !selection.moving) {
            let node = {
                x: e.x,
                y: e.y,
                radius: 10,
                fillStyle: '#22cccc',
                strokeStyle: '#009999',
                selectedFill: '#88aaaa'
            };
            nodes.push(node);
            draw();
        }
        if (selection) {
            delete selection.moving;
            delete selection.selected;
        }
        selection = undefined;
        draw();
    }}
/>

<canvas bind:this={canvas}/>