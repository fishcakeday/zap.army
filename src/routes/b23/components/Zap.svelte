<script>
    import Avatar from '$lib/components/Avatar.svelte';
    import { profiles, nostrNotes } from '$lib/store';
    import { nostrPool } from '$lib/store';
    import { formatSatoshis } from '$lib/utils';
    import TimeAgo from 'javascript-time-ago'
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let zap;
    export let opened;

    let zappedNote;

    let ago;

    $: {
        try {
            const timeAgo = new TimeAgo('en-US')
            ago = timeAgo.format(new Date(zap.event.created_at * 1000))
        } catch (e) {
            console.log(e)
        }
    }

    $: zappedNote = zap.zappedNoteId ? $nostrNotes[zap.zappedNoteId] : null;

    let senderName, recipientName;

    $: senderName = $profiles[zap.sender]?.name || zap.sender;
    $: recipientName = $profiles[zap.recipient]?.name || zap.recipient;

    function open() {
        $nostrPool.reqEvent(zap.zappedNoteId, 0)
        dispatch('open', opened ? null : zap.id);
    }

    function zapContent(content) {
        // if it's an URL that ends with an image format
        if (content.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)/g)) {
            return `<img src="${content}" class="max-h-64" />`
            // else if url is youtube
        } else if (content.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:youtube)/g)) {
            return `<iframe width="560" height="315" src="${content}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            // else if url is vimeo
        } else if (content.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:vimeo)/g)) {
            return `<iframe src="${content}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
            // else if url is mp4
        } else if (content.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:mov)/g)) {
            return `<video controls class="max-h-64">
                <source src="${content}" type="video/mp4">
                Your browser does not support the video tag.`
        } else {
            return content;
        }
    }

    let index = [60, 50, 70, 80];
    index = index[Math.floor(Math.random() * index.length)];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="
    flex flex-col py-1  w-full
    bg-purple-800/{`${index}`}
    cursor-pointer md:mb-4 md:rounded md:shadow border-b-gray-800 border-b amax-h-24
    items-center
    justify-between
    text-gray-200
    px-4
" on:click={open}>
    <div class="flex flex-row gap-1 w-full py-1 items-center">
        <div class="w-1/3 flex flex-row items-center gap-2">
            <Avatar klass="m-2 w-8 h-8 ring-purple-1000" pubkey={zap.sender} />
            <div class="font-semibold text-base text-clip overflow-auto">
                <span class="w-16">{senderName}</span>
            </div>
        </div>

        <div class="w-1/3 flex flex-col items-center">
            <div class="text-2xl font-black text-center justify-center flex flex-row items-center">
                ⚡️
                <span class="flex flex-row items-center gap-2">
                    <span class="text-white">{formatSatoshis(zap.amount, { tryGrouping: true, justNumber: true })}</span>
                    <span class="text-lg text-gray-300 font-semibold tracking-tighter lowercase">{formatSatoshis(zap.amount, { tryGrouping: true, justUnit: true })}</span>
                </span>
            </div>
        </div>

        <div class="w-1/3 flex flex-row gap-2 justify-end items-center">
            <div class="font-semibold text-base text-clip overflow-hidden text-right">
                {recipientName}
            </div>
            <Avatar klass="m-2 w-8 h-8 ring-purple-1000" pubkey={zap.recipient} />

        </div>
    </div>

    {#if zap.content}
        <div class="
            border border-purple-900
            bg-purple-500
            text-white
            text-lg
            font-semibold
            p-3
            w-full
            text-center
            rounded-lg
            items-center
            justify-center
            overflow-clip
            flex flex-row
            m-3
        ">{zap.zappper}</div>
    {/if}
</div>

<div class="
    bg-purple-800/60
    bg-purple-800/50
    bg-purple-800/70
    bg-purple-800/80
    bg-purple-800/90
    hidden
"></div>

<!-- ">{#if zapContent(zap.content)}{@html zapContent(zap.content)}{/if}</div> -->