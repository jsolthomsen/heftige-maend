document.addEventListener("DOMContentLoaded", function () {
  function scrollToElement(elementId) {
    var targetElement = document.getElementById(elementId);
    targetElement.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  document.getElementById("button1").addEventListener("click", function () {
    scrollToElement("div1");
  });

  document.getElementById("button2").addEventListener("click", function () {
    scrollToElement("div2");
  });

  document.getElementById("button3").addEventListener("click", function () {
    scrollToElement("div3");
  });

  document.getElementById("button4").addEventListener("click", function () {
    scrollToElement("div4");
  });

  document.getElementById("button5").addEventListener("click", function () {
    scrollToElement("div5");
  });
});

document.addEventListener("DOMContentLoaded", function () {
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

document.addEventListener("DOMContentLoaded", function () {
  const fins = document.querySelectorAll(".fin");
  const textbox = document.getElementById("textbox");
  const closeButton = document.getElementById("closeButton");

  fins.forEach((fin) => {
    fin.addEventListener("click", function () {
      // Display the textbox
      textbox.style.display = "block";
    });
  });

  closeButton.addEventListener("click", function () {
    // Hide the textbox when the close button is clicked
    textbox.style.display = "none";
  });
});
