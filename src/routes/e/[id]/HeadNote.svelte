<script>
    import { profiles } from '$lib/store';
    import LodgingCard from './LodgingCard.svelte';
    import TimeAgo from 'javascript-time-ago'
    import { createEventDispatcher } from 'svelte';
    import MarkdownIt from 'markdown-it';
    import NoteContent from '$lib/components/NoteContent.svelte';
    import Avatar from '$lib/components/Avatar.svelte';

    let md = new MarkdownIt();

    const dispatch = createEventDispatcher()
    const timeAgo = new TimeAgo('en-US')

    export let note;
    let subject;

    $: subject = note?.tags.find(t => t[0] == 'subject')
    
</script>

<pre>{JSON.stringify(note)}</pre>

<div class="bg-purple-900 text-white border md:rounded-lg p-4 w-full my-4">
    <div class="flex flex-row overflow-clip text-ellipsis items-center">
        <Avatar klass="m-2 h-16 ring-8 ring-purple-1000" pubkey={note?.pubkey} />
        <div class="pl-4 flex flex-col text-ellipsis">
            <div class="font-bold text-xl text-clip">
                {$profiles[note?.pubkey]?.name}
            </div>
            <div class="text-xs text-gray-200 mt-1">
                {timeAgo.format(new Date(note?.created_at * 1000))}
            </div>

        </div>
    </div>

    {#if note.content?.type === 'lodging'}
        <LodgingCard note={note} />
    {/if}

    <h2 class="mt-4 md:mt-6 px-4 font-bold text-2xl">{subject}</h2>

    {#if note.content}
        <div class="mt-5 p-4 bg-white rounded text-gray-700 ">
            <NoteContent content={note.content} />
        </div>
    {:else}
        <div class="mt-2 p-2 rounded text-purple-200 text-sm">
            oh brother,
            <em>{$profiles[note.pubkey]?.name}</em>
            didn't write anything 🤷‍♂️
        </div>
    {/if}
    <div class="flex flex-col md:flex-row items-end mt-3 justify-end">
        <button class="bg-purple-600 text-white px-8 py-2 font-semibold flex-1 md:flex-0" on:click={() => {dispatch('interested')}}>
            INTERESTED?
        </button>
    </div>
</div>
