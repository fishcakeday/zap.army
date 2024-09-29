import lightningPayReq from 'light-bolt11-decoder';
import * as nostrTools from 'nostr-tools';

const { verifySignature } = nostrTools;

export function getSinceTime(durationInHours) {
    return Math.floor(Date.now() / 1000) - durationInHours * 60 * 60;
}

export function subscribeMainFilter(pool, durationInHours, extraFilters = {}) {
    let cond = { kinds:[9735] }

    if (durationInHours !== 'all' && durationInHours < 168000) {
        cond.since = getSinceTime(durationInHours);
        cond.limit = 100000;
        cond = {...cond, ...extraFilters};
        pool.subscribe([
            cond,
            {kinds: [1], '#t': ['zapraiser']}
        ], false);
    } else {
        pool.subscribe([
            cond,
            {kinds: [1], '#t': ['zapraiser']}
        ], false);

        // setTimeout(() => {
            let until = parseInt(new Date().getTime() / 1000);
            for (let i = 90; i >= 0; i--) {
                setTimeout(({until, i}) => {
                    until -= 8 * 60 * 60 * i;
                    const subId = pool.subscribe([ { kinds:[9735], until, limit: 10000, ...extraFilters } ], false);
                    console.log(`starting sub with time ${new Date(until*1000).toLocaleDateString()} and ${i} and subId ${subId}`);
                    setTimeout(() => {
                        console.log(`unsubscribing from ${subId}`);
                        pool.unsubscribe(subId);
                    }, i * 15000);
                }, i * 15000, {until, i});
            }
        // }, 5000)
    }
}


export function pubkeyName(pubkey, profiles) {
    if (profiles[pubkey]) {
        return profiles[pubkey].display_name || `@${profiles[pubkey]?.name}`;
    }

    return `«${pubkey.slice(0, 6)}»`;
}

const cheaterList = [
    'dd077ad7d7c6d15851fa95ef0f7e571696704eed17c7a92734635f179e142f8c',
    'a9786646d7f9ff4a9e5d16f7e8f4891eba574e476390c328187448e3b07f3983',
    '738ea36ef74b2ac80bfb3887b40637c7dcdf74ea6eed73c718b7193313b90f9b',
];

const semiGFY = [
    'be1d89794bf92de5dd64c1e60f6a2c70c140abac9932418fee30c5c637fe9479',
    '79f00d3f5a19ec806189fcab03c1be4ff81d18ee4f653c88fac41fe03570f432',
    'fcd720c38d9ee337188f47aac845dcd8f590ccdb4a928b76dde18187b4c9d37d',
    '00009483d5e84e8850e5430654e61802fd2838cdf0ffa8fe774b4e9a63f52428',
    '6a69b9a70c28857e14fd429efabea77cb65ab6dfee3ec79b32ab1c4e7c02a232',
    '1743bcc6d80fc182ced1971853769ff9373a2707aad744b24e8577c6dae83fd0',
];

export function eventToZap(event) {
    // if (!semiGFY.includes(event.pubkey)) {
    //     return null;
    // }

    if (!verifySignature(event)) {
        console.log('invalid sig', event);
        return null;
    }

    let zap;
    let description = event.tags.find((t) => t[0] === 'description');
    let bolt11 = event.tags.find((t) => t[0] === 'bolt11');
    if (!description || !bolt11 || !bolt11[1]) {
        return null;
    }

    try {
        description = description[1];
        if (description.startsWith("%")) {
            description = decodeURIComponent(description);
        }
        if (description === "") { return null; }

        description = JSON.parse(description);
        bolt11 = lightningPayReq.decode(bolt11[1])
    } catch (e) {
        // console.log(e, {description, event});
        return null;
    }

    const amountSection = bolt11.sections.find((s) => s.name === 'amount')
    if (!amountSection) { return null; }

    const amount = parseInt(amountSection.value) / 1000;
    if (!amount) { return null; }

    const sender = description.pubkey;
    const recipient = event.tags.find((t) => t[0] === 'p')[1];

    // ignore self-zaps
    if (sender === recipient) {
        return null;
    }

    const content = description.content || bolt11.description;
    const zapper = event.pubkey;
    const zappedNote = event.tags.find((t) => t[0] === 'e');
    const zappedNoteId = zappedNote ? zappedNote[1] : null;

    zap = {
        id: event.id,
        created_at: event.created_at,
        zappedNoteId,
        zapper,
        sender,
        recipient,
        content,
        event,
        amount,
        bolt11
    }

    if (amount > 20000000) {
        return;
    }

    if (cheaterList.includes(sender)) {
        return null;
    }

    return zap;
}