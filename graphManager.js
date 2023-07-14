import * as idHandler from './idHandler.js'
import { DEFAULT_COLOR } from './globalVariables.js'
import { createInfoSection } from "./infoSection.js";
import * as app from './app.js'
import { nodes, nodesMap, links, linksMap } from './app.js'

export function createNode(x, y) {
    // Crea nodo
    var node = setUpNode(x, y);
    // Assegna Id
    idHandler.assignNodeId(node)
    // Aggiungi il nuovo nodo all'array di nodi
    nodes.push(node);
    // Aggiungi il nuovo nodo alla mappa
    nodesMap.set(node.id, node);
    // Aggiorna la visualizzazione del grafo
    app.drawNodesElements();
    app.drawNodesLabels();
    /* console.log("Nuovo nodo creato: ");
    console.log(node);
    console.log("Array nodi: ");
    console.log(nodes);
    console.log("Mappa nodi: ");
    console.log(nodesMap);
    console.log("Array ID: ");
    console.log(nodesIds); */
    updateGraph();
}

export function deleteNode(id) {
    // Rimuovi il nodo dall'array nodes
    var nodeIndex = nodes.findIndex(function (node) {
        return node.id === id;
    });
    if (nodeIndex !== -1) {
        nodes.splice(nodeIndex, 1);
    }

    // Rimuovi il nodo dalla mappa nodesMap
    nodesMap.delete(id);

    // Cerca i link collegati al nodo eliminato
    var linksToDelete = [];
    links.forEach(function (link) {
        if (link.source.id === id || link.target.id === id) {
            linksToDelete.push(link);
        }
    });

    // Elimina i link dall'array links e dalla mappa linksMap
    linksToDelete.forEach(function (link) {
        deleteLink(link.id);
    });
    updateGraph();
}

export function createLink(nodeSource) {
    setUpLink(nodeSource)
        .then(function (link) {
            // Usa il link creato
            console.log(link);
            idHandler.assignLinkId(link)
            linksMap.set(link.id, link)
            links.push(link)
            console.log("Nuovo link:")
            console.log(link)
            app.drawLinkElements();
            app.drawLinkLabels();
            updateGraph();
        })
        .catch(function (error) {
            // Gestisci l'errore
            console.error(error);
        });
}

export function deleteLink(id) {
    // Rimuovi il link dall'array links
    var linkIndex = links.findIndex(function (l) {
        return l.id === id;
    });
    if (linkIndex !== -1) {
        links.splice(linkIndex, 1);
    }

    // Rimuovi il link dalla mappa linksMap
    linksMap.delete(id);
    updateGraph();
}

export function saveJson() {

}

function setUpNode(x, y) {
    console.log("Creo un nodo")

    var node = {
        id: null,
        nome: "New character",
        giocatore: "To edit",
        ruolo: "To edit",
        tipo: "To edit",
        background: "To edit",
        info: "To edit",
        tratti: "To edit",
        età: "To edit",
        movente: "To edit",
        x: x,
        y: y
    }
    return node;
}

function setUpLink(nodeSource) {
    return new Promise(function (resolve, reject) {
        var nodeTarget;
        var circles = d3.selectAll("circle");
        var clickListener = function (event, d) {
            // Rimuovi il listener di click aggiunto da esecuzioneAsincrona()
            circles.on("click", null);

            // Aggiorna il nodo di destinazione con l'id del node cliccato
            nodeTarget = nodesMap.get(d.id);

            // Creazione del link con il nodo di origine e di destinazione
            var link = {
                id: null,
                source: nodeSource,
                target: nodeTarget,
                color: DEFAULT_COLOR,
                label: "To edit",
                info: "To edit",
                type: 0
            };
            circles.on("click", null);
            circles.on("click", function (event, d) { createInfoSection(d.id) })
            // Risolvi la promessa con il link creato
            resolve(link);
        };
        // Aggiungi il listener di click ai circle
        circles.on("click", clickListener);
    });
}

function updateGraph() {
    app.restartSimulation();
}