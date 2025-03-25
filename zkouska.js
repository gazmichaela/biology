
document.addEventListener("DOMContentLoaded", function () {
    const arrow = document.getElementById("arrow");
    const popup = document.getElementById("popup");

    arrow.addEventListener("click", function () {
        const rect = arrow.getBoundingClientRect();
        const offset = 20; // Odsazení popupu od šipky

        // Získání přesné výšky šipky
        const arrowHeight = rect.height || arrow.offsetHeight;

        // Umístění popupu pod šipku (přesně 20 px pod ní)
        popup.style.left = `${rect.left + window.scrollX - 200}px`;
        popup.style.top = `${rect.bottom + window.scrollY + offset}px`;

        // Zobrazení popupu
        popup.style.display = "block";
    });

    // Skrytí popupu při kliknutí mimo něj
    document.addEventListener("click", function (event) {
        if (!popup.contains(event.target) && event.target !== arrow) {
            popup.style.display = "none";
        }
    });
});
