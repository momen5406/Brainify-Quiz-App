// ============================== GLOBAL STATE ==============================
const categories = document.querySelectorAll(".category");
let chooseCategory;
let wholeScore;
let userScore = 0;

// ============================== DOM ELEMENTS ==============================
const numberOfQuestions = document.querySelector("#numberOfQuestions");
const questionDifficulty = document.querySelector("#difficulty");
const questionType = document.querySelector("#type");
const submitButton = document.querySelector("#submitBtn");
const nextQuestion = document.querySelector("#nextQuestion");
const viewScore = document.querySelector("#viewScore");
const mainSection = document.querySelector("main");
const questionSection = document.querySelector(".questions-section");
const scoreSection = document.querySelector(".score-section");
const startNewQuiz = document.querySelector("#startNewQuiz");
const checkQuestion = document.querySelector("#checkQuestion");
const correctMsg = document.querySelector("#correctMsg");
const wrongMsg = document.querySelector("#wrongMsg");
const questionNumberError = document.querySelector("#questionNumberError");
const questionDifficultyError = document.querySelector("#questionDifficultyError");
const questionTypeError = document.querySelector("#questionTypeError");
const categoryError = document.querySelector("#categoryError");

// ============================== EVENT BINDING ==============================

// Handle category selection with radio button logic
categories.forEach(category => {
  category.addEventListener("click", () => {
    categories.forEach(c => {
      c.classList.remove("selected");
      c.querySelector("input[type='radio']").checked = false;
    });
    category.classList.add("selected");
    category.querySelector("input[type='radio']").checked = true;
    chooseCategory = category.dataset.category;
  });
});

submitButton.addEventListener("click", e => {
  e.preventDefault();
  const amount = numberOfQuestions.value;
  const difficulty = questionDifficulty.value;
  const type = questionType.value;
  const category = chooseCategory;

  startQuiz(amount, difficulty, type, category);
  viewScore.classList.add("d-none");
});

viewScore.addEventListener("click", () => {
  questionSection.classList.add("d-none");
  scoreSection.classList.remove("d-none");
  getScore();
});

startNewQuiz.addEventListener("click", () => {
  location.reload();
});

// ============================== FORM UTILITIES ==============================

function clearInputs() {
  numberOfQuestions.value = '';
  questionDifficulty.selectedIndex = 0;
  questionType.selectedIndex = 0;
  categories.forEach(category => {
    category.classList.remove("selected");
    category.querySelector("input[type='radio']").checked = false;
  });
  chooseCategory = undefined;
}

function valuesAreGood() {
  const valueOfQuestions = Number(numberOfQuestions.value.trim());

  if (!numberOfQuestions.value.trim() || isNaN(valueOfQuestions) || valueOfQuestions < 1 || valueOfQuestions > 20) {
    questionNumberError.classList.remove("d-none");
    return false;
  }
  questionNumberError.classList.add("d-none");

  if (questionDifficulty.selectedIndex === 0) {
    questionDifficultyError.classList.remove("d-none");
    return false;
  }
  questionDifficultyError.classList.add("d-none");

  if (questionType.selectedIndex === 0) {
    questionTypeError.classList.remove("d-none");
    return false;
  }
  questionTypeError.classList.add("d-none");

  const isSelected = [...categories].some(category => category.classList.contains("selected"));
  if (!isSelected) {
    categoryError.classList.remove("d-none");
    return false;
  }
  categoryError.classList.add("d-none");

  return true;
}

// ============================== DATA HANDLING ==============================

async function getData(amount, difficulty, type, category) {
  const api = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`);
  const response = await api.json();
  return response;
}

function getAnswers(questionList, questionIndex) {
  let answersArray = [...questionList[questionIndex].incorrect_answers];
  answersArray.push(questionList[questionIndex].correct_answer);
  return shuffleArray(answersArray);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function correctAnswer(questionsList, questionIndex) {
  return questionsList[questionIndex].correct_answer;
}

// ============================== QUESTION DISPLAY ==============================

function addAnswers(questionsList, questionIndex) {
  const answerBox = document.querySelector("#answers-container");
  const answers = getAnswers(questionsList, questionIndex);

  let htmlAnswers = answers.map(answer => `
    <div class="col-md-6">
      <div id="question-box" class="inner d-flex align-items-center">
        <span class="checkbox"></span>
        <p>${answer}</p>
      </div>
    </div>`).join("");

  answerBox.innerHTML = htmlAnswers;
  checkboxTool();
}

function addQuestion(questionsList, questionIndex) {
  const questionName = document.querySelector("#question-name");
  questionName.innerHTML = questionsList[questionIndex].question;
  addAnswers(questionsList, questionIndex);

  checkQuestion.classList.remove("d-none");
  viewScore.classList.add("d-none")
}

function checkboxTool() {
  const questionsBox = document.querySelectorAll("#question-box");

  questionsBox.forEach(question => {
    question.addEventListener("click", () => {
      questionsBox.forEach(q => {
        q.querySelector(".checkbox").classList.remove("checkbox-selected");
        q.classList.remove("inner-box-shadow");
        q.setAttribute("data-selected", "false");
      });
      question.querySelector(".checkbox").classList.add("checkbox-selected");
      question.classList.add("inner-box-shadow");
      question.setAttribute("data-selected", "true");
    });
  });
}

// ============================== QUIZ LOGIC ==============================

async function startQuiz(amount, difficulty, type, category) {
  if (!valuesAreGood()) return;

  let questionCounter = 0;
  nextQuestion.classList.add("d-none");
  viewScore.classList.add("d-none");  

  const data = await getData(amount, difficulty, type, category);
  const questions = data.results;

  const wholeNumberOfQuestions = document.querySelector("#whole-number");
  const currentQuestionNumber = document.querySelector("#current-number");
  currentQuestionNumber.textContent = questionCounter + 1;
  wholeNumberOfQuestions.textContent = questions.length;
  wholeScore = questions.length;

  mainSection.classList.add("d-none");
  questionSection.classList.remove("d-none");
  addQuestion(questions, questionCounter);

  checkQuestion.addEventListener("click", () => handleAnswerCheck(questions, questionCounter));

  nextQuestion.addEventListener("click", () => {
    questionCounter++;
    if (questionCounter < questions.length) {
      addQuestion(questions, questionCounter);
      currentQuestionNumber.textContent = questionCounter + 1;
    }

    correctMsg.style.top = "-110%";
    wrongMsg.style.top = "-110%";

    checkQuestion.classList.remove("d-none");
    nextQuestion.classList.add("d-none");

    if (questionCounter === questions.length - 1) {
      nextQuestion.classList.add("d-none");
    }
  });
}

function handleAnswerCheck(questions, questionIndex) {
  const answers = getAnswers(questions, questionIndex);
  const correct = correctAnswer(questions, questionIndex);
  const allAnswersBox = document.querySelectorAll("#question-box");
  const allAnswers = document.querySelectorAll("#question-box p");

  let userAnswer = null;

  allAnswersBox.forEach((box, i) => {
    const answerText = allAnswers[i].innerHTML;
    if (box.dataset.selected === "true") {
      userAnswer = answerText;
    }
    if (answerText === correct) {
      box.classList.add("correct-answer");
    } else {
      box.classList.add("incorrect-answer");
    }
    box.style.pointerEvents = "none";
  });

  if (userAnswer === correct) {
    correctMsg.style.top = "50px";
    userScore++;
    setTimeout(() => correctMsg.style.top = "-110%", 3000);
  } else {
    wrongMsg.style.top = "50px";
    setTimeout(() => wrongMsg.style.top = "-110%", 3000);
  }

  checkQuestion.classList.add("d-none");
  nextQuestion.classList.remove("d-none");

  if (questionIndex === questions.length - 1) {
    nextQuestion.classList.add("d-none");
    viewScore.classList.remove("d-none");
  }
}

function getScore() {
  document.querySelector("#userScore").textContent = userScore;
  document.querySelector("#wholeScore").textContent = wholeScore;
}
