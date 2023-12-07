// Define your questions and possible answers
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

function getSelectedAnswer() {
  if (currentSlide === 1) {
    return "Start Quiz";
  }

  const radioButtons = document.getElementsByName("q" + (currentSlide - 2)); // Adjusted index
  let selectedAnswer = null;

  radioButtons.forEach((radio) => {
    if (radio.checked) {
      selectedAnswer = radio.value;
    }
  });

  return selectedAnswer;
}

function showHideButton(elementId, display) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = display;
  }
}

const audio = new Audio("pic/baby_shark_sound.mp3");
const audioControls = document.getElementById("audio-controls");

function showResult(resultShark) {
  const resultSlide = document.getElementById("result-slide");
  const resultImage = document.getElementById("result-image");
  const resultText = document.getElementById("result-text");

  resultText.textContent = `You are a ${resultShark}!`;

  if (resultShark === "Baby Shark") {
    resultImage.src = "pic/baby_shark.gif";
    audio.play();
    audioControls.style.display = "block";
  } else {
    resultImage.src = `pic/${resultShark
      .toLowerCase()
      .replace(/\s/g, "_")}.jpg`;
    audioControls.style.display = "none";
  }

  document.querySelectorAll(".quiz-slide").forEach((slide) => {
    slide.style.display = "none";
  });

  resultSlide.style.display = "flex";
}

function toggleAudio() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

const volumeSlider = document.getElementById("volume-slider");
if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });
}

function showNextSlide() {
  const selectedAnswer = getSelectedAnswer();

  if (currentSlide > 0 && selectedAnswer === null) {
    alert("Please select an answer before proceeding.");
    return;
  }

  showHideButton(`slide${currentSlide}`, "none");

  if (currentSlide < totalSlides) {
    currentSlide++;
    showHideButton(`slide${currentSlide}`, "flex");
  } else {
    showHideButton(`next-btn${currentSlide}`, "none");
    showHideButton(`prev-btn${currentSlide}`, "inline-block");
    showHideButton("last-question", "flex");
  }

  showHideButton(
    `prev-btn${currentSlide}`,
    currentSlide > 1 ? "inline-block" : "none"
  );
}

function showPreviousSlide() {
  showHideButton(`slide${currentSlide}`, "none");
  currentSlide--;

  const prevSlideId = `slide${currentSlide}`;
  showHideButton(prevSlideId, "flex");
  showHideButton(
    `prev-btn${currentSlide}`,
    currentSlide > 1 ? "inline-block" : "none"
  );
  showHideButton(
    `next-btn${currentSlide}`,
    currentSlide < totalSlides ? "inline-block" : "none"
  );
}

function resetQuiz() {
  document.querySelectorAll(".quiz-slide").forEach((slide, index) => {
    const displayValue = index === 0 ? "flex" : "none";
    slide.style.display = displayValue;
  });

  currentSlide = 1;

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });

  if (audioControls) {
    audioControls.style.display = "none";
  }

  showHideButton("prev-btn1", "none");
  showHideButton("next-btn", "inline-block");
}

function calculateResult() {
  const sharkVotes = {
    "Hammerhead Shark": 0,
    "Baby Shark": 0,
    "Tiger Shark": 0,
    "Great White Shark": 0,
  };

  for (let i = 0; i < questions.length; i++) {
    const selectedAnswer = document.querySelector(
      `input[name="q${i}"]:checked`
    );
    if (selectedAnswer) {
      const sharkName = selectedAnswer.value;
      sharkVotes[sharkName]++;
    }
  }

  let maxVotes = 0;
  let resultShark = "";

  for (const shark in sharkVotes) {
    if (sharkVotes[shark] > maxVotes) {
      maxVotes = sharkVotes[shark];
      resultShark = shark;
    }
  }

  showResult(resultShark);
}

// Initialize the quiz by showing the first slide
document.getElementById("slide1").style.display = "block";
