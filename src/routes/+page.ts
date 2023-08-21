export const load = async ({ fetch }) => {
    let res = await fetch("/examples/Count to Infinity.json");
    const cti = await res.json();
    res = await fetch("/examples/The Fish.json")
    const tf = await res.json();

    return { cti: ["Count to Infinity", cti], 
             tf: ["The Fish", tf]};
}