<script lang="ts">
    import { onMount } from "svelte";
    let canvas: HTMLCanvasElement;
    let m =  { x: 0, y: 0 }
    let ctx: CanvasRenderingContext2D;
    let draw = false;
    onMount(() => {
        let tmp = canvas.getContext("2d");
        if (tmp != null) ctx = tmp;
        ctx.fillStyle = "rgb(200, 0, 0)";
    });
</script>


<canvas bind:this={canvas} on:mousemove={(e) => {
    m.x = e.clientX;
    m.y = e.clientY;
    if (draw) ctx.fillRect(m.x, m.y, 5, 5)
}} on:mousedown={() => draw = true} on:mouseup={() => draw = false}/>
<a href={"#"} role="button" on:click={() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}}>Reset</a>


<style lang="scss">
    canvas {
        border: solid;
        margin: 0;
    }
</style>