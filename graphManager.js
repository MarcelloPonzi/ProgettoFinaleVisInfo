import * as idHandler from './idHandler.js'
import { svg, DEFAULT_LINK_COLOR, DEFAULT_CHARACTER_COLOR, DEFAULT_OBJECT_COLOR } from './globalVariables.js'
import { createInfoSection } from "./infoSection.js";
import * as app from './app.js'
import { nodes, nodesMap, nodesIds, links, linksMap } from './app.js'

export function createNode(x, y, tipoNodo) {
    switch (tipoNodo) {
        case 'oggetto':
            node = setUpNodeObject(x, y);
            break;
        case 'personaggio':
            // Crea nodo personaggio
            var node = setUpNodeCharacter(x, y);
            break;
        default:
            console.error("Tipo non valido: " + tipoNodo);
            return;
    }

    // Assegna Id
    idHandler.assignNodeId(node)
    // Aggiungi il nuovo nodo all'array di nodi
    nodes.push(node);
    // Aggiungi il nuovo nodo alla mappa
    nodesMap.set(node.id, node);
    // Aggiorna la visualizzazione del grafo
    app.drawNodesElements();
    app.drawNodesLabels();
    console.log("Nuovo nodo creato: ");
    console.log(node);
    console.log("Array nodi: ");
    console.log(nodes);
    console.log("Mappa nodi: ");
    console.log(nodesMap);
    console.log("Array ID: ");
    console.log(nodesIds);
    updateGraph();
}

export function deleteNode(id) {
    deleteNodeDraw(id)
    // Rimuove il nodo dall'array nodes
    var nodeIndex = nodes.findIndex(function (node) {
        return node.id === id;
    });
    if (nodeIndex !== -1) {
        nodes.splice(nodeIndex, 1);
    }
    idHandler.releaseNodeId(id)
    // Rimuove il nodo dalla mappa nodesMap
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

    var messageDiv = d3.select("#svg-container")
        .insert("div", ":first-child")
        .attr("class", "select-target-node-message")
        .text("Clicca un altro nodo con cui creare la relazione");

    setUpLink(nodeSource)
        .then(function (link) {
            messageDiv.remove();
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
            // Gestisce l'errore
            console.error(error);
            messageDiv.remove();
        });


}

export function deleteLink(id) {
    deleteLinkDraw(id)
    // Rimuove il link dall'array links
    var linkIndex = links.findIndex(function (l) {
        return l.id === id;
    });
    if (linkIndex !== -1) {
        links.splice(linkIndex, 1);
    }
    idHandler.releaseLinkId(id)
    // Rimuove il link dalla mappa linksMap
    linksMap.delete(id);
    updateGraph();
}

function setUpNodeCharacter(x, y) {
    console.log("Creo un nodo personaggio")

    var node = {
        id: null,
        nome: "New character",
        giocatore: "To edit",
        ruolo: "To edit",
        tipo: "personaggio",
        background: "To edit",
        info: "To edit",
        tratti: "To edit",
        età: "To edit",
        movente: "To edit",
        color: DEFAULT_CHARACTER_COLOR,
        x: x,
        y: y
    }
    return node;
}

function setUpNodeObject(x, y) {
    console.log("Creo un nodo oggetto")

    var node = {
        id: null,
        nome: "New object",
        tipo: "oggetto",
        descrizione: "To edit",
        scopo: "To edit",
        color: DEFAULT_OBJECT_COLOR,
        immagine: "",
        x: x,
        y: y
    }
    return node;
}

function setUpLink(nodeSource) {
    return new Promise(function (resolve, reject) {
        var nodeTarget;
        var selectedNodes = d3.selectAll(".node");
        var clickListener = function (event, d) {
            selectedNodes.on("click", null);
            nodeTarget = nodesMap.get(d.id);
            var link = {
                id: null,
                source: nodeSource,
                target: nodeTarget,
                color: DEFAULT_LINK_COLOR,
                label: "To edit",
                info: "To edit",
                type: 0
            };
            selectedNodes.on("click", null);
            selectedNodes.on("click", function (event, d) { createInfoSection(d.id) })
            // Risolve la promessa con il link creato
            resolve(link);
        };
        // Aggiunge il listener di click ai circle
        selectedNodes.on("click", clickListener);
    });
}

export function saveJSONToFile() {
    // Crea un oggetto per il file JSON
    console.log("Provo a salvare")
    var data = {
        nodes: [],
        links: []
    };

    // Aggiunge i nodi al file JSON
    nodesMap.forEach(function (node) {
        switch (node.tipo) {
            case 'oggetto':
                var nodeData = {
                    id: node.id,
                    tipo: node.tipo,
                    nome: node.nome,
                    descrizione: node.descrizione,
                    scopo: node.scopo,
                    color: node.color,
                    immagine: node.immagine
                }
                data.nodes.push(nodeData);
                break;
            case 'personaggio':
                var nodeData = {
                    id: node.id,
                    tipo: node.tipo,
                    nome: node.nome,
                    giocatore: node.giocatore,
                    ruolo: node.ruolo,
                    background: node.background,
                    info: node.info,
                    tratti: node.tratti,
                    età: node.età,
                    movente: node.movente,
                    color: node.color
                };
                data.nodes.push(nodeData);
                break;
            default:
                console.error("Tipo non valido: " + tipoNodo + "non posso salvare il file");
                return;

        }


    });

    // Aggiunge i link al file JSON
    linksMap.forEach(function (link) {
        var linkData = {
            id: link.id,
            source: link.source.id,
            target: link.target.id,
            color: link.color,
            label: link.label,
            info: link.info,
            type: link.type
        };
        data.links.push(linkData);
    });

    // Converte l'oggetto in una stringa JSON
    var jsonString = JSON.stringify(data, null, 2);

    // Crea un oggetto Blob dal JSON
    var blob = new Blob([jsonString], { type: "application/json" });

    // Crea una finestra di dialogo del filesystem per scegliere il nome del file e la posizione di salvataggio
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "yourGraph.json";
    // Aggiungi il link al documento HTML
    document.body.appendChild(link);

    // Simula il click sul link per avviare il download
    link.click();

    // Rimuovi il link dal documento HTML
    document.body.removeChild(link);
    console.log("Salvataggio riuscito.")
}

// Cancella la grafica del nodo e della relativa label
export function deleteNodeDraw(id) {
    svg.selectAll(".node")
        .filter(function (d) { return d.id === id; })
        .remove();
    svg.selectAll(".node-label")
        .filter(function (d) { return d.id === id; })
        .remove();
}

// Cancella la grafica del link e della relativa label
export function deleteLinkDraw(id) {
    svg.selectAll(".link")
        .filter(function (d) { return d.id === id; })
        .remove();
    svg.selectAll(".link-label")
        .filter(function (d) { return d.id === id; })
        .remove();
}

export function updateGraph() {
    app.restartSimulation();
}