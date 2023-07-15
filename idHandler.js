import { nodesIds, linksIds } from './app.js'
const MAX_LINKS = 300; // rimetti a 300
const MAX_NODES = 30; // rimetti a 30


export function usedIdChecker(idsArray, map) {
    return idsArray.filter(function (id) {
        return !map.has(id)
    });
}

/* Gestione ID per i nodi */
export function createNodesIds() {
    let arr = [];
    for (let i = 1; i <= MAX_NODES; i++) {
        arr.push(i);
    }
    return arr;
}

export function assignNodeId(node) {
    if (nodesIds.length === 0) {
        throw new Error("No more IDs available for nodes");
    }
    node.id = nodesIds.shift();
}

export function releaseNodeId(id) {
    nodesIds.push(id);
    console.log("Rilasciato id", id)
    console.log(nodesIds);
}


/* Gestione ID per i link */
export function createLinksIds() {
    let arr = [];
    for (let i = 1; i <= MAX_LINKS; i++) {
        arr.push(i);
    }
    return arr;
}


export function assignLinkId(link) {
    if (linksIds.length === 0) {
        throw new Error("No more IDs available for links");
    }
    link.id = linksIds.shift();
}

export function releaseLinkId(id) {
    linksIds.push(id);
    console.log("Rilasciato id", id)
    console.log(linksIds);
}


