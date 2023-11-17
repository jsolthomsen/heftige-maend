document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("button1").addEventListener("click", function() {
        // Find det element, du vil rulle til
        var targetElement = document.getElementById("div4");

        // Rul til elementet
        targetElement.scrollIntoView({ behavior: "smooth" });
    });
});