document.querySelectorAll(".tex").forEach(function (el) {
    temml.render(el.textContent, el);
});
document.querySelectorAll(".tex-block").forEach(function (el) {
    temml.render(el.textContent, el, { displayMode: true });
});
