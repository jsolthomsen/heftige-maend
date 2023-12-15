// Spørgsmål og svarmuligheder
const questions = [
  "What is your preferred holiday destination?",
  "What is your favorite human body part?",
  "How many pushups can you do?",
  "What is your preferred beverage?",
  "What is your preferred season?",
  "Choose your preferred weapon in a zombie apocalypse",
  "How many hours of sleep do you get per night?",
  "Choose your preferred weekend activity",
];

const answers = [
  [
    { actual: "Hammerhead Shark", display: "Skåne" },
    { actual: "Baby Shark", display: "Florida" },
    { actual: "Tiger Shark", display: "South Sudan" },
    { actual: "Great White Shark", display: "Iceland" },
  ],
  [
    { actual: "Great White Shark", display: "Foot" },
    { actual: "Tiger Shark", display: "Hand" },
    { actual: "Hammerhead Shark", display: "Belly button" },
    { actual: "Baby Shark", display: "Thigh" },
  ],
  [
    { actual: "Hammerhead Shark", display: "1" },
    { actual: "Baby Shark", display: "5" },
    { actual: "Tiger Shark", display: "10" },
    { actual: "Great White Shark", display: "20+" },
  ],
  [
    { actual: "Tiger Shark", display: "Coca-Cola" },
    { actual: "Hammerhead Shark", display: "Water" },
    { actual: "Great White Shark", display: "Blood" },
    { actual: "Baby Shark", display: "Milk" },
  ],
  [
    { actual: "Great White Shark", display: "Winter" },
    { actual: "Tiger Shark", display: "Spring" },
    { actual: "Hammerhead Shark", display: "Summer" },
    { actual: "Baby Shark", display: "Sixth season of Friends" },
  ],
  [
    { actual: "Hammerhead Shark", display: "Baseball bat" },
    { actual: "Baby Shark", display: "Katana" },
    { actual: "Tiger Shark", display: "Bow and arrow" },
    { actual: "Great White Shark", display: "Fists" },
  ],
  [
    { actual: "Hammerhead Shark", display: "0-4" },
    { actual: "Great White Shark", display: "5-7" },
    { actual: "Tiger Shark", display: "8-10" },
    { actual: "Baby Shark", display: "11+" },
  ],
  [
    { actual: "Baby Shark", display: "Netflix and chill" },
    { actual: "Tiger Shark", display: "Clubbing" },
    { actual: "Great White Shark", display: "Plundering the nearest village" },
    { actual: "Hammerhead Shark", display: "Reading" },
  ],
];

const totalSlides = 10;
let currentSlide = 1;

// Funktion for at få den valgte svarmulighed baseret på den aktuelle slide
function getSelectedAnswer() {
  // Hvis det er første slide, returner "Start Quiz"
  if (currentSlide === 1) {
    return "Start Quiz";
  }

  // Hent radio-knapperne for den foregående slide
  const radioButtons = document.getElementsByName("q" + (currentSlide - 2));
  let selectedAnswer = null;

  // Gennemgå radio-knapperne for at finde den valgte svarmulighed
  radioButtons.forEach((radio) => {
    if (radio.checked) {
      selectedAnswer = radio.value;
    }
  });

  // Returner den valgte svarmulighed
  return selectedAnswer;
}

// Funktion for at vise/skjule et HTML-element baseret på dets id og display-stil
function showHideButton(elementId, display) {
  // Find HTML-elementet baseret på id
  const element = document.getElementById(elementId);

  // Hvis elementet findes, indstil dets display-stil
  if (element) {
    element.style.display = display;
  }
}
const audio = new Audio("pic/baby_shark_sound.mp3");
const audioControls = document.getElementById("audio-controls");

// Funktion til at vise resultatet baseret på den valgte haj
function showResult(resultShark) {
  // Hent DOM-elementer for resultat-slide, billede og tekst
  const resultSlide = document.getElementById("result-slide");
  const resultImage = document.getElementById("result-image");
  const resultText = document.getElementById("result-text");

  // Indstil tekstindholdet baseret på den valgte haj
  resultText.textContent = `You are a ${resultShark}!`;

  // Vis det passende billede og konfigurér lyd afspilning
  if (resultShark === "Baby Shark") {
    // Hvis det er Baby Shark, vis gif og afspil lyd
    resultImage.src = "pic/baby_shark.gif";
    audio.play();
    audioControls.style.display = "block";
  } else {
    // Hvis det er en anden haj, vis billede og skjul lydstyring
    resultImage.src = `pic/${resultShark
      .toLowerCase()
      .replace(/\s/g, "_")}.jpg`;
    audioControls.style.display = "none";
  }

  // Skjul alle quizslides
  document.querySelectorAll(".quiz-slide").forEach((slide) => {
    slide.style.display = "none";
  });

  // Vis resultat-slide
  resultSlide.style.display = "flex";
}

// Funktion til at stoppe og nulstille lydafspilning
function stopAndResetAudio() {
  // Tjek om Audio-objektet eksisterer
  if (audio) {
    // Stop afspilning og nulstil afspilningstid til 0
    audio.pause();
    audio.currentTime = 0;
  }
}

function toggleAudio() {
  // Hvis lyden er sat på pause, start afspilning, ellers stop afspilning
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}
const volumeSlider = document.getElementById("volume-slider");

// Hvis lydstyrkeslideren findes, tilføj en eventlistener til input-ændringer
if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    // Opdater lydstyrken baseret på sliderens værdi
    audio.volume = volumeSlider.value;
  });
}
// Funktion for at vise næste slide i quizzen
function showNextSlide() {
  // Hent den valgte svarmulighed for den aktuelle slide
  const selectedAnswer = getSelectedAnswer();

  // Hvis det ikke er den første slide og der ikke er valgt et svar, vis en advarsel
  if (currentSlide > 0 && selectedAnswer === null) {
    alert("Please select an answer before proceeding.");
    return;
  }

  // Skjul den aktuelle slide
  showHideButton(`slide${currentSlide}`, "none");

  // Hvis der er flere slides, vis næste slide, ellers vis slutresultatet
  if (currentSlide < totalSlides) {
    currentSlide++;
    showHideButton(`slide${currentSlide}`, "flex");
  } else {
    // Skjul og vis knapper og slutresultatet
    showHideButton(`next-btn${currentSlide}`, "none");
    showHideButton(`prev-btn${currentSlide}`, "inline-block");
    showHideButton("last-question", "flex");
  }

  // Vis eller skjul forrige knap baseret på den aktuelle slide
  showHideButton(
    `prev-btn${currentSlide}`,
    currentSlide > 1 ? "inline-block" : "none"
  );
}

function showPreviousSlide() {
  // Skjul den aktuelle slide
  showHideButton(`slide${currentSlide}`, "none");

  // Gå til den forrige slide
  currentSlide--;

  // Vis den forrige slide
  const prevSlideId = `slide${currentSlide}`;
  showHideButton(prevSlideId, "flex");

  // Vis eller skjul forrige knap baseret på den aktuelle slide
  showHideButton(
    `prev-btn${currentSlide}`,
    currentSlide > 1 ? "inline-block" : "none"
  );

  // Vis eller skjul næste knap baseret på den aktuelle slide
  showHideButton(
    `next-btn${currentSlide}`,
    currentSlide < totalSlides ? "inline-block" : "none"
  );
}

// Funktion til at nulstille quizzen
function resetQuiz() {
  // Stop og nulstil lydafspilning
  stopAndResetAudio();

  // Skift visningsværdien for hvert quiz-slide baseret på index
  document.querySelectorAll(".quiz-slide").forEach((slide, index) => {
    const displayValue = index === 0 ? "flex" : "none";
    slide.style.display = displayValue;
  });

  // Nulstil aktuelle slide til den første
  currentSlide = 1;

  // Nulstil alle radio-knapper til ikke at være markerede
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });

  // Skjul lydstyringsknappen, hvis den eksisterer
  if (audioControls) {
    audioControls.style.display = "none";
  }

  // Skjul forrige knap på den første slide og vis næste knap
  showHideButton("prev-btn1", "none");
  showHideButton("next-btn", "inline-block");
}

function calculateResult() {
  // Initialiser antal stemmer til hver haj
  const sharkVotes = {
    "Hammerhead Shark": 0,
    "Baby Shark": 0,
    "Tiger Shark": 0,
    "Great White Shark": 0,
  };

  // Gennemgå alle spørgsmål for at tælle stemmerne
  for (let i = 0; i < questions.length; i++) {
    // Find det valgte svar for hvert spørgsmål
    const selectedAnswer = document.querySelector(
      `input[name="q${i}"]:checked`
    );

    // Hvis der er et valgt svar, øg antallet af stemmer til den pågældende haj
    if (selectedAnswer) {
      const sharkName = selectedAnswer.value;
      sharkVotes[sharkName]++;
    }
  }

  // Find hajen med flest stemmer
  let maxVotes = 0;
  let resultShark = "";

  for (const shark in sharkVotes) {
    if (sharkVotes[shark] > maxVotes) {
      maxVotes = sharkVotes[shark];
      resultShark = shark;
    }
  }

  // Vis resultatet baseret på haj med flest stemmer
  showResult(resultShark);
}

// Vis første slide i quizzen
document.getElementById("slide1").style.display = "flex";
