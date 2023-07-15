import { nodes, nodesMap, links, linksMap } from './app.js'
import * as graphManager from './graphManager.js'
import { svg } from './globalVariables.js'

export function createInfoSection(id) {
    var node = nodesMap.get(id);
    // Controlla che non esista già la info section
    var existingInfoSection = d3.select(".info-section");
    if (!existingInfoSection.empty()) {
        existingInfoSection.remove();
    }

    // Crea un elemento div per la sezione delle informazioni
    var infoSection = d3.select("body")
        .append("div")
        .attr("class", "info-section");

    var h2 = infoSection.append("h2")
        .text(node.nome);

    // Aggiungi un pulsante per chiudere la sezione delle informazioni
    infoSection.append("button")
        .attr("class", "close-button")
        .text("X")
        .on("click", function () {
            infoSection.remove();
        });

    // Aggiungi un pulsante per cancellare il node
    infoSection.append("button")
        .attr("class", "delete-button")
        .text("Cancella personaggio")
        .on("click", function () {
            graphManager.deleteNodeDraw(id)
            graphManager.deleteNode(id)
            infoSection.remove();
        });
    infoSection.append("br")
    // Aggiungi le informazioni del node alla sezione delle informazioni
    infoSection.append("label")
        .text("Nome:");

    infoSection.append("input")
        .attr("type", "text")
        .attr("value", node.nome)
        .on("change", function () {
            node.nome = d3.select(this).property("value");
            h2.text(node.nome);
            svg.selectAll(".node-label")
                .filter(function (d) { return d.id === node.id; })
                .text(node.nome);
            console.log(nodesMap)
            console.log("Ho cambiato il nome del nodo di id ", node.id, " in ", "\"" + node.nome + "\"")
        });

    infoSection.append("label")
        .text("Giocatore:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", node.giocatore)
        .on("change", function () {
            node.giocatore = d3.select(this).property("value")
            console.log(nodesMap)
            console.log("Ho cambiato il giocatore del nodo di id ", node.id, " in ", "\"" + node.giocatore + "\"")
        });
    infoSection.append("label")
        .text("Colore:");
    infoSection.append("br")
    infoSection.append("input")
        .attr("type", "color")
        .attr("value", node.color)
        .on("input", function () {
            node.color = d3.select(this).property("value");
            svg.selectAll(".node")
                .filter(function (d) { return d.id === id; })
                .attr("fill", node.color);
            console.log("Ho cambiato il colore del nodo di id ", node.id, " in ", node.color)
        });

    infoSection.append("br")
    infoSection.append("label")
        .text("Ruolo:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", node.ruolo)
        .on("change", function () {
            node.ruolo = d3.select(this).property("value")
            console.log(nodesMap)
            console.log("Ho cambiato il ruolo del nodo di id ", node.id, " in ", "\"" + node.ruolo + "\"")
        });

    infoSection.append("label")
        .text("Tratti:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", node.tratti)
        .on("change", function () {
            node.tratti = d3.select(this).property("value")
            console.log(nodesMap)
            console.log("Ho cambiato i tratti del nodo di id ", node.id, " in ", "\"" + node.tratti + "\"")
        });

    infoSection.append("label")
        .text("Movente:");
    infoSection.append("textarea")
        .text(node.movente)
        .on("change", function () {
            node.movente = d3.select(this).property("value");
            console.log(nodesMap)
            console.log("Ho cambiato il movente del nodo di id ", node.id, " in ", "\"" + node.movente + "\"")
        });

    infoSection.append("label")
        .text("Info:");
    infoSection.append("textarea")
        .text(node.info)
        .on("change", function () {
            node.info = d3.select(this).property("value");
            console.log(nodesMap)
            console.log("Ho cambiato le info del nodo di id ", node.id, " in ", "\"" + node.info + "\"")
        });

    infoSection.append("label")
        .text("Background:");
    infoSection.append("textarea")
        .text(node.background)
        .on("change", function () {
            node.background = d3.select(this).property("value");
            console.log(nodesMap)
            console.log("Ho cambiato il background del nodo di id ", node.id, " in ", "\"" + node.background + "\"")
        });

}

export function createLinkInfoSection(id) {

    var link = linksMap.get(id);
    // Controlla che non esista già la info section
    var existingInfoSection = d3.select(".info-section");
    if (!existingInfoSection.empty()) {
        existingInfoSection.remove();
    }

    // Crea un elemento div per la sezione delle informazioni
    var infoSection = d3.select("body")
        .append("div")
        .attr("class", "info-section");

    var h2 = infoSection.append("h2")
        .text(link.source.nome + " " + link.label + " " + link.target.nome)


    // Aggiungi un pulsante per chiudere la sezione delle informazioni
    infoSection.append("button")
        .attr("class", "close-button")
        .text("X")
        .on("click", function () {
            infoSection.remove();
        });

    // Aggiungi un pulsante per cancellare il link
    infoSection.append("button")
        .attr("class", "delete-button")
        .text("Cancella link")
        .on("click", function () {
            graphManager.deleteLink(id)
            infoSection.remove();
        });

    // Aggiungi le informazioni del link alla sezione delle informazioni
    infoSection.append("br");
    infoSection.append("label")
        .text("Label:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", link.label)
        .on("change", function () {
            link.label = d3.select(this).property("value");
            h2.text(link.source.nome + " " + link.label + " " + link.target.nome);
            svg.selectAll(".link-label")
                .filter(function (d) { return d.id === link.id; })
                .text(link.label);
            console.log(link)
            console.log(linksMap)
            console.log("Ho cambiato la label del link di id ", link.id, " in ", "\"" + link.label + "\"")
        });
    infoSection.append("label")
        .text("Colore:");
    infoSection.append("input")
        .attr("type", "color")
        .attr("value", link.color)
        .on("input", function () {
            var newColor = d3.select(this).property("value");
            link.color = newColor;
            svg.selectAll(".link")
                .filter(function (d) { return d.id === id; })
                .attr("stroke", newColor);
            console.log("Ho cambiato il colore del link di id ", link.id, " in ", link.color)
        });

    infoSection.append("br");
    infoSection.append("label")
        .text("Tipo relazione: ");

    var tipoLabel = infoSection.append("span")
        .attr("class", "tipo-label")
        .text(link.tipo === 1 ? "univoca" : "biunivoca");

    var tipoSwitch = infoSection.append("label")
        .attr("class", "switch");

    tipoSwitch.append("input")
        .attr("type", "checkbox")
        .attr("class", "tipo-switch")
        .property("checked", link.tipo === 1)
        .on("change", function () {
            link.tipo = this.checked ? 1 : 0;
            tipoLabel.text(link.tipo === 1 ? "univoca" : "biunivoca");
        });

    tipoSwitch.append("span")
        .style("margin-left", "8px")
        .attr("class", "slider round");

    infoSection.append("br");
    infoSection.append("label")
        .text("Info relazione:");
    infoSection.append("textarea")
        .text(link.info)
        .on("change", function () {
            link.info = d3.select(this).property("value");
            console.log(linksMap)
            console.log("Ho cambiato le info del link di id ", link.id, " in ", "\"" + link.info + "\"")
        });
}