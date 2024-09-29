<script>
    import { profiles, totalsPerNote, zapsPerNote } from '$lib/store';
    import Avatar from '$lib/components/Avatar.svelte';
    import NoteContent from '$lib/components/NoteContent.svelte';
    import TimeAgo from 'javascript-time-ago'
    import { nip19 } from 'nostr-tools';
	import { formatSatoshis } from '$lib/utils';
    import { pubkeyName } from '$lib/nostr/utils';

    const timeAgo = new TimeAgo('en-US')

    export let note;
    export let zapraise = null;

    let totalZaps;
    let zapraiseAmount, percentageZapped, raiseReached;
    let noteZaps;

    $: {
        totalZaps = $totalsPerNote[note.id]
        noteZaps = $zapsPerNote[note.id] || []

        const content = note.content;
        const zapraiseRegex = /#[t]*zapraiser\s+(\d+)([kKmM(btc|BTC)]*)/;

        const match = content.match(zapraiseRegex);
        if (match) {
            const amount = parseInt(match[1]);
            const multiplier = match[2];
            if (multiplier === 'k' || multiplier === 'K') {
                zapraiseAmount = amount * 1000;
            } else if (multiplier === 'm' || multiplier === 'M') {
                zapraiseAmount = amount * 1000000;
            } else if (multiplier === 'btc' || multiplier === 'BTC') {
                zapraiseAmount = amount * 100000000;
            } else {
                zapraiseAmount = amount;
            }
        } else {
            zapraiseAmount = 0;
        }

        const totalZapped = totalZaps?.amount || 0;

        if (zapraiseAmount === 0) {
            percentageZapped = 0;
        } else {
            percentageZapped = Math.round(totalZapped / zapraiseAmount * 100);
        }

        raiseReached = percentageZapped >= 100;
    }
</script>

<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-2.5 w-full text-gray-700 overflow-auto dark:text-gray-100 flex flex-row" style="max-height: 15rem !important;">
    <div class="flex flex-col overflow-auto text-ellipsis gap-2 w-full">
        <div class="flex flex-row items-center gap-2">
            <Avatar klass="ring-purple-900 w-12 h-12" pubkey={note.pubkey} />

            <div class="flex flex-col gap-1 whitespace-nowrap w-full">
                <div class="font-bold text-lg text-clip">
                    {pubkeyName(note.pubkey, $profiles)}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    {timeAgo.format(new Date(note.created_at * 1000))}
                </div>
            </div>

            <div class="flex flex-row items-center justify-between gap-4">
                <div class="flex flex-col items-center bg-slate-50 dark:bg-gray-900 dark:border dark:border-gray-700 w-full px-5 py-2 rounded-lg text-gray-500">
                    <div class="text-lg font-black text-black dark:text-gray-300">
                        {totalZaps?.count || 0}
                    </div>
                    <div class="text-sm">
                        zaps
                    </div>
                </div>

                <div class="flex flex-col items-center bg-slate-50 dark:bg-gray-900 dark:border dark:border-gray-700 w-full px-2 py-2 rounded-lg text-gray-500">
                    <div class="text-lg font-black text-black dark:text-gray-300">
                        {formatSatoshis(totalZaps?.amount||0, {tryGrouping: true, justNumber: true})}
                    </div>
                    <div class="text-sm">
                        {formatSatoshis(totalZaps?.amount||0, {tryGrouping: true, justUnit: true})}
                    </div>
                </div>
            </div>
        </div>

        <div class="overflow-auto text-ellipsis flex-1">
            <NoteContent content={note.content} tags={note.tags} />
        </div>

        <!-- <div class="flex flex-col justify-between w-3/12"> -->
            <!-- <div class="flex flex-col items-center justify-between w-full mt-5 gap-4">
                <div class="flex flex-col items-center bg-slate-50 dark:bg-gray-900 dark:border dark:border-gray-700 w-full px-5 py-2 rounded-lg text-gray-500">
                <div class="text-lg font-black text-black dark:text-gray-300">
                    {totalZaps?.count || 0}
                </div>
                <div class="text-sm opacity-80">
                    zaps
                </div>
                </div>

                <div class="flex flex-col items-center bg-slate-50 dark:bg-gray-900 dark:border dark:border-gray-700 w-full px-2 py-2 rounded-lg text-gray-500">
                    <div class="text-lg font-black text-black dark:text-gray-300">
                        {formatSatoshis(totalZaps?.amount||0, {tryGrouping: true, justNumber: true})}
                    </div>
                    <div class="text-sm opacity-80">
                        {formatSatoshis(totalZaps?.amount||0, {tryGrouping: true, justUnit: true})}
                    </div>
                </div>
            </div> -->
        <!-- </div> -->
    </div>
</div>