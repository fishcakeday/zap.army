<script>
    import { zaps } from '$lib/store';
    import Zap from '$lib/components/Zap.svelte';

    export let initialDisplayCount = 50;
    export let cutoffTimeDuration = 1; // 1 hour

    let visibleZaps = [];
    let openedZap;

    // this is done to prevent loading a bunch of zaps before we
    // finished loading, so as to initially respect the limit of n
    // zaps, and disregard it as they continue to come in
    // setTimeout(() => { initialLoad = false; }, 1500);

    let processedZapLength = 0;

    $: if ($zaps.length > processedZapLength) {
        const cutoffTime = Math.floor(Date.now() / 1000) - (cutoffTimeDuration * 60 * 60);
        let sortedZaps = $zaps
        sortedZaps = sortedZaps.filter(post => post.created_at > cutoffTime)
        sortedZaps = sortedZaps.sort((a, b) => b.created_at - a.created_at);

        // under the initial load, we want to constrain the number of zaps we load
        // if (initialLoad) {
        //     visibleZaps = sortedZaps.slice(0, 100);
        // } else {
            sortedZaps.slice(0, initialDisplayCount).reverse().forEach((zap) => {
                if (!visibleZaps.find(z => z.event.id === zap.event.id)) {
                    visibleZaps.unshift(zap);
                }
            })
        // }

        processedZapLength = $zaps.length;

        visibleZaps = visibleZaps;
    }
</script>

{#each visibleZaps as zap}
    <Zap {zap} opened={openedZap === zap.id} on:open={(e) => { openedZap = e.detail } } />
{/each}