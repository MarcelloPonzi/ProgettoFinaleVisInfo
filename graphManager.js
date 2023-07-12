import * as idHandler from './idHandler.js'
import { parentElement, parentWidth, parentHeight } from './globalVariables.js'
import * as app from './app.js'

export function createNode(nodes, nodeElements, nodesIds, nodesMap) {
    console.log("Creo un nodo")
    var node = {};
    // Assegna Id
    idHandler.assignNodeId(nodesIds, node)
    node.nome = "Nuovo nodo"
    // Aggiungi il nuovo nodo all'array di nodi
    nodes.push(node);
    // Aggiungi il nuovo nodo alla mappa
    nodesMap.set(node.id, node);
    // Aggiorna la visualizzazione del grafo
    app.drawNodesElements(nodes, nodesMap);
    app.drawNodesLabels(nodes);

    console.log("Nuovo nodo creato: " + node);
    console.log(node);
    console.log("Array nodi: " + nodes);
    console.log(nodes);
    console.log("Mappa nodi: ");
    console.log(nodesMap);
    console.log("Array ID: ");
    console.log(nodesIds);
}

export function deleteNode() {

}

export function createLink() {

}

export function deleteLink() {

}

export function saveJson() {

}

function updateGraph(nodes) {

}