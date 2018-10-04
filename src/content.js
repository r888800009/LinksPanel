(function contentScript(){
"use strict";

/**
 * Get relevant details out of an <a> node
 * @param a node
 * @returns Link detail strings {title, text, href, style}
 */
function processAnchor(a){
    let computedStyle;
    try{
        computedStyle = window.getComputedStyle(a);
    } catch (e) {
        return {fail:true};
    }
    let propString = "";
    propString += SETTINGS.color ? "color " : "";
    propString += SETTINGS.ff ? "font-family " : "";
    propString += SETTINGS.fw ? "font-weight " : "";
    propString += SETTINGS.fs ? "font-style" : "";
    const properties = propString.split(" ");
    let styleString = "";
    properties.forEach(prop => {
        styleString += `${prop}: ${computedStyle.getPropertyValue(prop)};`;
    });
    return {
        title: a.title,
        text: a.innerText.split("\n")[0].trim() === "" ? a.href : a.innerText.split("\n")[0].trim(),
        href: a.href,
        style: styleString
    };
}

/**
 * Send message with link details
 * @param links to send
 */
function sendLinks(links){
    chrome.runtime.sendMessage(links);
}

/**
 * Get list of link details
 */
function getAllAnchors(){
    const listOfAnchors = [];
    const allLinks = document.links;
    for(let i = 0; i < SETTINGS.max; i++){
        const link = processAnchor(allLinks[i]);
        if(!link.fail){
            listOfAnchors.push(link);
        }
    }
    sendLinks({someLinks: listOfAnchors});
}

/**
 * Receieve a message - will probably be a request to get links
 * @param message
 * @param sender
 * @param callback
 */
function onMessage(message, sender, callback){
    if(message.panelWantsLinks){
        callback(true);
        getAllAnchors();
    }
}

let SETTINGS;
chrome.storage.sync.get({
    color: false,
    ff: true,
    fw: true,
    fs: true,
    max: 5000
}, items => {
    SETTINGS = items;
    chrome.runtime.onMessage.addListener(onMessage);
});

})();
