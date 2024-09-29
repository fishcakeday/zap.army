<script>
    import { selectedDuration } from '$lib/store';
	import { onMount } from 'svelte';
    import Hero from './components/Hero.svelte';
    import NoteRanking from './components/NoteRanking.svelte';
    import ZapFeed from './components/ZapFeed.svelte';

    let sortMode = 'amount';

    onMount(() => {
        $selectedDuration = 24;
    });
</script>

<div class="bg-black w-full">
    <Hero />

    <!-- <div class="fixed bottom-0 w-full">
    </div> -->

    <div class="flex flex-col w-full rounded">
        <ZapFeed />
        <!-- <NoteRanking {sortMode} /> -->
    </div>
</div>