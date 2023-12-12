document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("button1").addEventListener("click", function () {
    // Find det element, du vil rulle til
    var targetElement = document.getElementById("div1");

    // Rul til elementet
    targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  document.getElementById("button2").addEventListener("click", function () {
    // Find det element, du vil rulle til
    var targetElement = document.getElementById("div2");

    // Rul til elementet
    targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  document.getElementById("button3").addEventListener("click", function () {
    // Find det element, du vil rulle til
    var targetElement = document.getElementById("div3");

    // Rul til elementet
    targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  document.getElementById("button4").addEventListener("click", function () {
    // Find det element, du vil rulle til
    var targetElement = document.getElementById("div4");

    // Rul til elementet
    targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  document.getElementById("button5").addEventListener("click", function () {
    // Find det element, du vil rulle til
    var targetElement = document.getElementById("div5");

    // Rul til elementet
    targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript file loaded");
  // Find hajelementerne
  const shark = document.querySelector(".shark");
  const littleshark = document.querySelectorAll(".littleshark");

  // Lyt efter scrollhændelser
  window.addEventListener("scroll", function () {
    // Check om brugeren er rullet ned til bunden af siden
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight
    ) {
      // Start hajanimationen, når brugeren er på bunden
      if (shark) {
        shark.classList.add("shark-delay");

        // Nulstil animationen for at genstarte den
        shark.style.animation = "none";
        void shark.offsetWidth; // Trigger reflow (repaint) for at annullere animationen
        shark.style.animation = null;

        setTimeout(function () {
          shark.classList.remove("shark-delay");
          shark.style.animation = "swim 19s linear"; // Start hajanimationen igen
        }, 0);
      } else {
        console.error("Couldn't find shark element.");
      }

      // Kør samme procedure for hajnr2
      littleshark.forEach(function (littleshark) {
        littleshark.classList.add("shark-delay");

        // Nulstil animationen for at genstarte den
        littleshark.style.animation = "none";
        void littleshark.offsetWidth; // Trigger reflow (repaint) for at annullere animationen
        littleshark.style.animation = null;

        setTimeout(function () {
          littleshark.classList.remove("shark-delay");
          littleshark.style.animation = "swim 30s linear"; // Start hajanimationen igen
        }, 0); // Nulstil med en lille forsinkelse for at sikre, at det sker umiddelbart efter
      });
    }
  });
});
