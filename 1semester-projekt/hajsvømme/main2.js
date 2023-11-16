function swim() {
    const shark = document.querySelector(".shark");
    const water = document.querySelector(".water");

    if (shark && water) {
        shark.classList.add("shark-delay");

        // Nulstil vandanimationen
        water.style.animation = "none";
        void water.offsetWidth; // Trigger reflow (repaint) for at annullere animationen
        water.style.animation = null;

        setTimeout(function () {
            shark.classList.remove("shark-delay");
            water.style.animation = "riseAndFall 20s linear"; // Start vandanimationen igen
        }, 0); // Nulstil med en lille forsinkelse for at sikre, at det sker umiddelbart efter

        generateBubbles();

        setTimeout(function () {
            water.style.animationPlayState = "paused"; // Stop vandanimationen
        }, 20000); // Fjern .shark-delay efter yderligere 20 sekunder
    } else {
        console.error("Couldn't find shark or water element.");
    }
}

function generateBubbles() {
    const numBubbles = 20; // Antallet af bobler
    const water = document.querySelector(".water");

    for (let i = 0; i < numBubbles; i++) {
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        bubble.style.left = Math.random() * 100 + "%";
        bubble.style.animationDuration = Math.random() * 3 + 2 + "s";
        water.appendChild(bubble);
    }
}

swim(); // Start svømmeanimationen ved indlæsning

setInterval(swim, 120000); // Gentag svømmeanimationen hvert andet minut