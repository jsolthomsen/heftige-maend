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

let currentSlide = 1; // Keep track of the current slide
const totalSlides = 10; // Update this to the total number of slides in your quiz

function getSelectedAnswer() {
  // Special case for the first slide (no answers)
  if (currentSlide === 1) {
    return "Start Quiz";
  }

  let radioButtons = document.getElementsByName("q" + (currentSlide - 2)); // Adjusted index
  for (let i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
      return radioButtons[i].value;
    }
  }
  return null;
}

function showNextSlide() {
  const selectedAnswer = getSelectedAnswer();

  if (currentSlide > 0 && selectedAnswer === null) {
    alert("Please select an answer before proceeding.");
    return;
  }

  const currentSlideElement = document.getElementById(`slide${currentSlide}`);
  if (currentSlideElement) {
    currentSlideElement.style.display = "none";
  }

  if (currentSlide < totalSlides) {
    currentSlide++;
    const nextSlideElement = document.getElementById(`slide${currentSlide}`);
    if (nextSlideElement) {
      nextSlideElement.style.display = "flex";
    }
  } else {
    const nextBtnElement = document.getElementById(`next-btn${currentSlide}`);
    if (nextBtnElement) {
      nextBtnElement.style.display = "none";
    }

    const prevBtnElement = document.getElementById(`prev-btn${currentSlide}`);
    if (prevBtnElement) {
      prevBtnElement.style.display = "inline-block";
    }

    const lastQuestionElement = document.getElementById("last-question");
    if (lastQuestionElement) {
      lastQuestionElement.style.display = "flex";
    }
  }

  const prevBtnElement = document.getElementById(`prev-btn${currentSlide}`);
  if (prevBtnElement) {
    prevBtnElement.style.display = currentSlide > 1 ? "inline-block" : "none";
  }
}
// Function to show the previous slide
function showPreviousSlide() {
  const currentSlideElement = document.getElementById(`slide${currentSlide}`);

  if (currentSlideElement) {
    // Hide the current slide
    currentSlideElement.style.display = "none";
  }

  currentSlide--;

  const prevSlideElement = document.getElementById(`slide${currentSlide}`);
  if (prevSlideElement) {
    // Show the previous slide
    prevSlideElement.style.display = "flex";

    // Show or hide the next and previous buttons accordingly
    const prevBtnElement = document.getElementById(`prev-btn${currentSlide}`);
    if (prevBtnElement) {
      prevBtnElement.style.display = currentSlide > 1 ? "inline-block" : "none";
    }

    const nextBtnElement = document.getElementById(`next-btn${currentSlide}`);
    if (nextBtnElement) {
      nextBtnElement.style.display =
        currentSlide < totalSlides ? "inline-block" : "none";
    }
  }
}

function resetQuiz() {
  // Hide all slides except the start slide
  document.querySelectorAll(".quiz-slide").forEach((slide, index) => {
    slide.style.display = index === 0 ? "flex" : "none";
  });

  // Reset the current slide variable
  currentSlide = 1;

  // Clear the selected radio buttons
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });

  // Show or hide the previous button accordingly
  const prevBtnElement = document.getElementById("prev-btn1");
  if (prevBtnElement) {
    prevBtnElement.style.display = "none";
  }

  const nextBtnElement = document.getElementById("next-btn");
  if (nextBtnElement) {
    nextBtnElement.style.display = "inline-block";
  }
}

// Function to calculate and display the result
function calculateResult() {
  const sharkVotes = {
    "Hammerhead Shark": 0,
    "Baby Shark": 0,
    "Tiger Shark": 0,
    "Great White Shark": 0,
  };

  // Loop through each question
  for (let i = 0; i < questions.length; i++) {
    // Get the selected answer for the current question
    const selectedAnswer = document.querySelector(
      `input[name="q${i}"]:checked`
    );

    // Add a vote to the corresponding shark based on the selected answer
    if (selectedAnswer) {
      const sharkName = selectedAnswer.value;
      sharkVotes[sharkName]++;
    }
  }

  // Determine the most voted shark
  let maxVotes = 0;
  let resultShark = "";

  for (const shark in sharkVotes) {
    if (sharkVotes[shark] > maxVotes) {
      maxVotes = sharkVotes[shark];
      resultShark = shark;
    }
  }

  // Display the result
  alert(`You are a ${resultShark}!`);
}

// Initialize the quiz by showing the first slide
document.getElementById("slide1").style.display = "block";
