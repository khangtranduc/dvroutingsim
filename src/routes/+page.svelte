<script lang="ts">
    import { onMount } from "svelte";
    import { DistanceElement, Link, Network, Router } from "$lib/classes";
    import Layout from "./+layout.svelte";
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let routers: Router[] = [];
    let links: Link[] = [];
    let selectedNetwork: Network;
    let savedNetworks: Network[] = [new Network("New Network", [], [])];
    let selection: Router|null;
    let createEdge = false;
    let editEdge = false; //TODO: add edge editing
    let saving = false;
    let edgeCost: number|null;
    let fromNode: Router|null;
    let toNode: Router|null;
    let inspect: Router|null;
    let networkName: string;
    let files: FileList;
    let input: HTMLInputElement;
    let nForward = 0;
    let routerJSON: Router[]|null;
    let linkJSON: Link[]|null;
    let nf: number|null;
    let select: HTMLSelectElement;
    export let data;
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
        draw();
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
        //Draw Nodes
        for (let i = 0; i < routers.length; i++)
            drawNode(routers[i]);
        }
    }
    const addEdge = (from: Router, to: Router, cost: number) => {
        let link = new Link(from, to, cost);
        if (!links.find((e) => (e.routers.includes(from) && e.routers.includes(to)))) 
            links = [...links, link];
        fromNode!.vertex.highlighted = false;
        // fromNode?.discover(links);
        // toNode?.discover(links);
        fromNode = null;
        toNode = null;
        draw();
    }
    const changeEdge = (from: Router, to: Router, cost: number) => {
        let link = links.find(e => e.routers.includes(from) && e.routers.includes(to))
        link!.cost = cost;
        fromNode!.vertex.highlighted = false;
        // fromNode?.discover(links);
        // toNode?.discover(links);
        fromNode = null;
        toNode = null;
        editEdge = false;
        draw();
    }
    const fforward = () => {
        reset();
        forward(); //Discovery step;
        routers.forEach(x => {
            for (let i = 0; i < routers.length - 1; i++){
                links.forEach(l => {
                    for (let j = 0; j < 2; j++){
                        let u = l.routers[j^0];
                        let v = l.routers[j^1];
                        if (x.distVec[u.id] && x.distVec[v.id] && (x.distVec[u.id].cost + l.cost < x.distVec[v.id].cost)){
                            x.distVec[v.id].next = u;
                            x.distVec[v.id].cost = x.distVec[u.id].cost + l.cost;
                        }
                        else if (x.distVec[u.id] && !x.distVec[v.id]){
                            x.distVec[v.id] = new DistanceElement(v, u, x.distVec[u.id].cost + l.cost);
                        }
                    }
                })
            }
        });
        nForward = -1;
    }
    const save = () => {
        let network = new Network(networkName, routers, links)
        savedNetworks = [...savedNetworks, network];
        selectedNetwork = network;
        saving = false;
    }
    const load = () => {
        routers = selectedNetwork.routers ?? [];
        links = selectedNetwork.links ?? [];
        draw();
    }
    const forward = () => {
        // console.log("sending...");
        routers.forEach((x) => x.send(links));
        nForward += 1;
        // routers.forEach((x) => console.log(x.distVec));
    }
    const download = () => {
        downloadJSON([routers.map(x => x.pojo()), 
                links.map(x => x.pojo()),
                nForward], 
                `${selectedNetwork.name ?? "Untitled Network"}.json`);
    }
    const downloadJSON = (pojo: Object, name: string) => {
        let json = JSON.stringify(pojo);
        let blob = new Blob([json], { type: "text/plain;charset=utf-8"});
        let url = window.URL || window.webkitURL;
        let link = url.createObjectURL(blob);
        let a = document.createElement("a");
        a.download = name;
        a.href = link;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    const clear = () => {
        routers = [];
        links = [];
        selectedNetwork = savedNetworks[0];
        draw();
    }
    const reset = () => {
        routers.forEach((x) => x.reset());
    }
    const loadNetwork = (routerJSON: Router[]|null, linkJSON: Link[]|null, nForward: number, networkName: string) => {
        clear();
        routerJSON!.forEach(x => {
            routers = [...routers, new Router(x.id, x.vertex.x, x.vertex.y)]
        })
        linkJSON!.forEach(x => {
            links = [...links, new Link(routers[x.routers[0].id], routers[x.routers[1].id], x.cost)]
        })
        selectedNetwork = new Network(networkName, routers, links);
        savedNetworks = [...savedNetworks, selectedNetwork];
        if (nForward == -1) fforward();
        else for (let i = 0; i < nForward; i++) forward();
        linkJSON = null;
        routerJSON = null;
        nf = null;
        draw();
    }
    const loadJSON = () => {
        const reader = new FileReader();
        reader.readAsText(files[0]);
        networkName = files[0].name.split('.')[0];
        reader.onload = e => {
            [routerJSON, linkJSON, nf] = JSON.parse(<string> e.target?.result);
        }
    }
    onMount(() => {
        ctx = canvas.getContext("2d")!;
        resize();
        Object.values(data).forEach(example => {
            let [networkName, [routerJSON, linkJSON, nf]] = example;
            loadNetwork(routerJSON, linkJSON, nf, networkName);
        });
        clear();
    });
    $: selectedNetwork && load();
    $: files && loadJSON();
    $: routerJSON && linkJSON && nf && networkName && loadNetwork(routerJSON, linkJSON, nf, networkName);
</script>

<input style="display:none" type="file" accept=".json" bind:files bind:this={input}/>

{#if saving}
<dialog open>
    <article>
        <header>
            <a class="close" href={'#'} on:click={() => {saving = false}}> </a>
            Save Network
        </header>
        <label>
            Network name
            <input placeholder="Enter network name" bind:value={networkName} required/>
        </label>
        <button on:click={save}>
            Save Graph
        </button>
    </article>
</dialog>
{/if}

{#if createEdge}
<dialog open>
    <article>
        <header>
            <a class="close" href={'#'} on:click={() => {
                createEdge = false; 
                console.log(fromNode);
                if (fromNode) fromNode.vertex.highlighted = false;
                fromNode = null;
                draw();
                }}> </a>
            {#if editEdge}Edit{:else}Create{/if} Edge
        </header>
        <label>
            Edge cost
            <input type="number" placeholder="Enter edge cost" bind:value={edgeCost} required/>
        </label>
        <button on:click={() => {
            if (edgeCost 
                && fromNode
                && toNode) {
                    if (edgeCost < 0) edgeCost = 1;
                    if (editEdge) changeEdge(fromNode, toNode, edgeCost)
                    else addEdge(fromNode, toNode, edgeCost)
                }
            createEdge = false;
            edgeCost = null;
        }}>
            {#if editEdge}Edit{:else}Add{/if} Edge
        </button>
    </article>
</dialog>
{/if}

{#if inspect}
<table style="top: {inspect.vertex.y}px; left: {inspect.vertex.x}px">
    <tr>
        <td>dest</td>
        <td>next</td>
        <td>cost</td>
    </tr>
    {#each inspect.distVec as v, i}
        <tr>
            <td>{v?.dest.id ?? i}</td>
            <td>{v?.next.id ?? "–"}</td>
            <td>{v?.cost ?? "∞"}</td>
        </tr>
    {/each}
</table>
{/if}

<svelte:window on:resize={resize}/>

<canvas bind:this={canvas}
    on:contextmenu={(e) => {
        let target = within(e.x, e.y);
        if (target) {
            e.preventDefault();
            inspect = target;
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
                                }
                            else {
                                editEdge = true;
                            }
                            createEdge = true;
                        }
                        else {
                            fromNode.vertex.highlighted = false;
                            fromNode = null;
                        }
                    }
                    break;
            }
            draw();
        }
        else {
            switch(e.button){
                case 1:
                    if (fromNode) fromNode.vertex.highlighted = false;
                    fromNode = null;
                    break;
            }
        }
    }}
    on:mousemove={(e) => {
        inspect = null;
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

<div>
    <select bind:value={selectedNetwork} bind:this={select}>
        {#each savedNetworks as network}
            <option value={network}>
                {network.name}
            </option>
        {/each}
    </select>
</div>

<buttongroup>
    <!-- <button on:click={back}><iconify-icon icon="lucide:step-back"/></button> -->
    <button on:click={() => { input.click() }}>
        <iconify-icon icon="lucide:upload"/>
        Upload
    </button>
    <button on:click={download}>
        <iconify-icon icon="lucide:download"/>
        Download
    </button>
    <button on:click={() => saving = true}>
        <iconify-icon icon="lucide:save"/>
        Save
    </button>
    <button on:click={reset}>
        <iconify-icon icon="lucide:list-restart"/>
        Reset
    </button>
    <button on:click={clear}>
        <iconify-icon icon="lucide:circle-slash-2"/>
        Clear
    </button>
    <button on:click={forward}>
        <iconify-icon icon="lucide:step-forward"/>
        Forward
    </button>
    <button on:click={fforward}>
        <iconify-icon icon="lucide:fast-forward"/>
        FForward
    </button>
</buttongroup>

<style lang="scss">
    div {
        position: absolute;
        top: .1rem;
        right: .3rem;
        left: .3rem;
    }
    buttongroup {
        display: flex;
        justify-content: center;
        position: absolute;
        gap: .2rem;
        bottom: .1rem;
        left: .3rem;
        right: .3rem;
    }
    button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .3rem;
        margin: 0;
    }
    header {
        margin-bottom: 1rem;
    }
    article {
        padding-bottom: 1rem;
    }
    table {
        position: absolute;
        width: fit-content;
        border: solid 2px;
        margin: 0;
    }
</style>