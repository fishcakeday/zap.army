<script>
	import { loggedUser } from './../../../lib/store.js';
	import { nostrNotes, profiles, nostrPool } from '$lib/store';
    import Note from './Note.svelte';
	import { page } from "$app/stores";
    import NavBar from '$lib/components/NavBar.svelte';
    import { v4 as uuidv4 } from 'uuid';
    import {RelayPool, Relay} from 'nostr';
    import { nip19 } from 'nostr-tools'
	import { onMount } from "svelte";
    import { eventToZap } from '$lib/nostr/utils';
	import Avatar from '$lib/components/Avatar.svelte';
	import Zap from '$lib/components/Zap.svelte';

    const npub = $page.params.npub;
    const pubkey = nip19.decode(npub).data;
    let pool;
    let eventIds = [];
    let events = {};
    let openedZap;

    onMount(() => {
        pool = new RelayPool([
            'wss://nos.lol',
            'wss://relay.f7z.io',
            'wss://nostr-pub.wellorder.net',
            'wss://nostr-relay.nokotaro.com',
            'wss://nostr.21crypto.ch',
            'wss://nostr.jatm.link',
            'wss://nostr1.tunnelsats.com',
            'wss://relay.damus.io/',
            'wss://relay.nostr.band/trusted',
            "wss://relay.snort.social",
            "wss://nostr.wine",
            "wss://offchain.pub",
        ]);

        pool.on('event', (relay, subId, event) => {
            // don't add duplicate events
            if (events[event.id]) return;
            events[event.id] = event;

            if (!event.tags.find(t => t[0] === 'p' && t[1] === pubkey)) {
                return;
            }

            // filter out events with more than 5 tags
            if (event.tags && event.tags.length > 5) {
                console.log(event.tags.length);
                return;
            }

            // filter out events without an event tag
            if (!event.tags || !event.tags.find(t => t[0] === 'e')) {
                return;
            }

            $nostrPool.reqProfile(event.pubkey)

            // add event to events, sorted by created_at
            if (event.kind === 9735) {
                event.zap = eventToZap(event);
                if (!event.zap) return;
            }

            if (event.kind === 7) {
                // go through event.tags and find the last tag that starts with 'e'
                const eTags = event.tags.filter(t => t[0] === 'e');
                if (!eTags.length) return;
                event.taggedEvent = eTags[eTags.length - 1][1];
                $nostrPool.reqEvent(event.taggedEvent);
                events[event.id] = event;
            }

            eventIds.push(event.id);
            eventIds = eventIds.sort((a, b) => {
                return new Date(events[b].created_at) - new Date(events[a].created_at);
            });
        });
        pool.on('open', (relay) => {
            const subId = uuidv4()
            let hoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).getTime();
            hoursAgo = Math.floor(hoursAgo / 1000);
            pool.subscribe(subId, [
                {kinds:[1], '#p': pubkey, since: hoursAgo},
                {kinds:[7, 9735], '#p': pubkey, since: hoursAgo},
            ], relay);
        })
    });
</script>

<svelte:head>
    <title>ZAPLIFE.LOL</title>
</svelte:head>

<NavBar />

{#if !pubkey}
    <div class="text-5xl text-white text-center">
        Enter your npub
    </div>
{:else}
    <div class="flex flex-col gap-4 mt-5 max-w-screen w-full">
        {#each eventIds as id}
            <div class="w-full">
                {#if events[id]}
                    {#if events[id].kind === 1}
                        <Note note={events[id]} />
                    {:else if events[id].kind === 9735}
                        <Zap zap={events[id].zap} opened={openedZap === events[id].zap.id} on:open={(e) => { openedZap = e.detail } } />
                    {:else if events[id].kind === 7}
                        <div class="flex flex-row gap-4 h-fit py-4 w-full overflow-auto">
                            <Avatar pubkey={events[id].pubkey} klass="h-12 w-12" />
                            <span class="text-xl text-black dark:text-white font-black">
                                {$profiles[events[id].pubkey]?.display_name || $profiles[events[id].pubkey]?.name || $profiles[events[id].pubkey]?.displayName || `[${events[id].pubkey.slice(0, 6)}]`}
                            </span>
                            <span class="text-3xl">
                                {events[id].content}
                            </span>
                            {$nostrNotes[events[id].taggedEvent]?.content}
                        </div>
                    {:else}
                        <div>{events[id].kind}</div>
                    {/if}
                {/if}
            </div>
        {/each}
    </div>
{/if}