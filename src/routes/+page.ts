export const load = async ({ fetch }) => {
    const res = await fetch("/examples/Count to Infinity.json");
    const cti = await res.json();

    return { cti: ["Count to Infinity", cti] };
}