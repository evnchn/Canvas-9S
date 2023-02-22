//CSS
document.head.insertAdjacentHTML("beforeend", 
`<style>
#doc_preview > div {
    overflow: hidden !important;
    resize: none !important;
    height: 400px !important;
}
#doc_preview > div > iframe {
    min-height: auto !important;
}
.ic-app-header__logomark-container {
    display: none;
}
#logoDiv {
    display: none;
}
</style>`);