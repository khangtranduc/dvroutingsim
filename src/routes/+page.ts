export const load = async ({ fetch }) => {
    let res = await fetch("/examples/Count to Infinity.json");
    const cti = await res.json();
    res = await fetch("/examples/The Fish.json")
    const tf = await res.json();

    return { 
        examples: [
            ["Count to Infinity", cti], 
            ["The Fish", tf]
        ]
    };
}