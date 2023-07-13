import * as idHandler from './idHandler.js'
import { DEFAULT_COLOR } from './globalVariables.js'
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
    var link;

    setUpLink(nodeSource, nodesMap)
        .then(function (link) {
            // Usa il link creato
            console.log(link);

            idHandler.assignLinkId(link, linksIds)
            linksMap.set(link.id, link)
            links.push(link)
            app.drawLinkElements();
            app.drawLinkLabels();
            console.log("Nuovo link creato: ");
            console.log(link);
            console.log("Array link: ");
            console.log(links);
            console.log("Mappa link: ");
            console.log(linksMap);
            console.log("Array ID: ");
            console.log(linksIds);
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
        console.log("Creo un nuovo link");

        esecuzioneAsincrona().then(function (circleId) {
            console.log("Circle cliccato:", circleId);

            // Continua l'esecuzione normale del codice
            console.log("Esecuzione ripresa");

            // Aggiorna il nodo di destinazione con l'id del circle cliccato
            nodeTarget = nodesMap.get(circleId);

            // Creazione del link con il nodo di origine e di destinazione
            var link = {
                id: null,
                color: DEFAULT_COLOR,
                label: "To edit",
                type: 0,
                source: nodeSource,
                target: nodeTarget
            };

            // Risolvi la promessa con il link creato
            resolve(link);
        }).catch(function (error) {
            console.error("Errore:", error);
            reject(error);
        });
    });
}

function esecuzioneAsincrona() {
    console.log("Inizio esecuzione");

    return new Promise(function (resolve, reject) {
        var circles = d3.selectAll("circle");

        circles.on("click", function (event, d) {
            var circleId = d.id;

            circles.on("click", null);

            resolve(circleId);
        });
    });
}

function updateGraph() {
    app.restartSimulation();
}