import * as idHandler from './idHandler.js'
import { DEFAULT_COLOR } from './globalVariables.js'
import { createInfoSection } from "./infoSection.js";
import * as app from './app.js'
import { simulation } from './app.js'

export function createNode(nodes, nodesIds, nodesMap, x, y) {
    // Crea nodo
    var node = setUpNode(x, y);
    // Assegna Id
    idHandler.assignNodeId(node, nodesIds)
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

export function deleteNode() {

}

export function createLink(nodeSource, nodesMap, links, linksIds, linksMap) {
    setUpLink(nodeSource, nodesMap)
        .then(function (link) {
            // Usa il link creato
            console.log(link);
            idHandler.assignLinkId(link, linksIds)
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

export function deleteLink() {

}

export function saveJson() {

}

function setUpNode(x, y) {
    console.log("Creo un nodo")
    var node = {}
    node.nome = "New character"
    node.vx = 1
    node.vy = 1
    node.x = x
    node.y = y
    node.tipo = "To edit"
    node.giocatore = "To edit"
    node.ruolo = "To edit"
    node.info = "To edit"
    node.tratti = "To edit"
    node.età = "To edit"
    node.movente = "To edit"
    node.background = "To edit"
    return node;
}

function setUpLink(nodeSource, nodesMap) {
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
                color: DEFAULT_COLOR,
                label: "To edit",
                type: 0,
                source: nodeSource,
                target: nodeTarget
            };
            circles.on("click", null);
            circles.on("click", function (event, d) { createInfoSection(nodesMap, d.id) })
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