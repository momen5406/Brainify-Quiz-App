// Some General Code
const categories = document.querySelectorAll(".category");
let chooseCategory;
categories.forEach((category) => {
  category.addEventListener("click", () => {
    // Unselect all first
    categories.forEach((c) => {
      c.classList.remove("selected");
      c.querySelector("input[type='radio']").checked = false;
    });

    // Select clicked one
    category.classList.add("selected");
    category.querySelector("input[type='radio']").checked = true;
    chooseCategory = category.dataset.category;
  });
});

function checkboxTool() {
  const questionsBox = document.querySelectorAll("#question-box");

  questionsBox.forEach((question) => {
    question.addEventListener("click", (event) => {
      const checkbox = question.querySelector(".checkbox");

      questionsBox.forEach((q) => {
        q.querySelector(".checkbox").classList.remove("checkbox-selected");
        q.classList.remove("inner-box-shadow");
      });

      checkbox.classList.toggle("checkbox-selected");
      question.classList.toggle("inner-box-shadow");

      
    })
  })
}

// Start Quiz

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

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = numberOfQuestions.value;
  const difficulty = questionDifficulty.value;
  const type = questionType.value;
  const category= chooseCategory;
  
  startQuiz(amount, difficulty, type, category);
})

async function getData(amount, difficulty, type, category) {
  const api = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`);
  
  const response = await api.json();

  return response;
}

function getAnswers(questionList, questionIndex) {
  let answersArray = Array.from(questionList[questionIndex].incorrect_answers);
  answersArray.push(questionList[questionIndex].correct_answer);
  
  return answersArray;
}

function addAnswers(questionsList, questionIndex) {
  let answerBox = document.querySelector("#answers-container");
  const answers = getAnswers(questionsList, questionIndex);

  // Shuffle answers
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  let htmlAnswers = '';

  for ( var i = 0; i < answers.length; i++ ) {
    htmlAnswers += 
    `
    <div class="col-md-6">
      <div
        id="question-box"
        class="inner d-flex align-items-center"
      >
        <span class="checkbox"></span>
        <p>${answers[i]}</p>
      </div>
    </div>
    `;
  }

  answerBox.innerHTML = htmlAnswers;

  checkboxTool();
}

function addQuestion(questionsList, questionIndex) {
  let questionName = document.querySelector("#question-name");
  questionName.innerHTML = questionsList[questionIndex].question;

  addAnswers(questionsList, questionIndex);
}

let questionCounter = 0;



async function startQuiz(amount, difficulty, type, category) {
  let data = await getData(amount, difficulty, type, category);
  let questions = data.results;
  console.log(questions);
  console.log(questions.length);

  let wholeNumberOfQuestions = document.querySelector("#whole-number");
  let currentQuestionNumber = document.querySelector("#current-number");
  
  wholeNumberOfQuestions.innerHTML = questions.length;

  mainSection.classList.add("d-none");
  questionSection.classList.remove("d-none");

  addQuestion(questions, questionCounter);
  
  nextQuestion.addEventListener("click", () => {
    questionCounter++;

    if ( questionCounter < questions.length ) {
      addQuestion(questions, questionCounter);
      currentQuestionNumber.innerHTML = questionCounter + 1;
    } 

    if (questionCounter == questions.length - 1) {
      nextQuestion.classList.add("d-none");
      viewScore.classList.remove("d-none");
    }
  })
}

viewScore.addEventListener("click", () => {
  questionSection.classList.add("d-none");
  scoreSection.classList.remove("d-none");
})

startNewQuiz.addEventListener("click", () => {
  scoreSection.classList.add("d-none");
  mainSection.classList.remove("d-none")
})