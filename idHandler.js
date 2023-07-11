const MAX_LINKS = 10; // rimetti a 300
const MAX_NODES = 10; // rimetti a 30


export function usedIdChecker(idsArray, map) {
    return idsArray.filter(function (id) {
        return !map.has(id)
    });
}

// Gestione ID per i nodi
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

export function releaseNodeId(node) {
    nodesIds.push(node.id);
    delete node.id;
}


// Gestione ID per i link

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

export function releaseLinkId(link) {
    linksIds.push(link.id);
    delete link.id;
}


