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
        q.setAttribute("data-selected", "false");
      });

      checkbox.classList.toggle("checkbox-selected");
      question.classList.toggle("inner-box-shadow");
      question.setAttribute("data-selected", "true");
      
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
const checkQuestion = document.querySelector("#checkQuestion");
const correctMsg = document.querySelector("#correctMsg");
const wrongMsg = document.querySelector("#wrongMsg");

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = numberOfQuestions.value;
  const difficulty = questionDifficulty.value;
  const type = questionType.value;
  const category= chooseCategory;
  
  startQuiz(amount, difficulty, type, category);
  viewScore.classList.add("d-none");
})

function clearInputs() {
  numberOfQuestions.value = '';
  questionDifficulty.selectedIndex = 0;
  questionType.selectedIndex = 0;
  document.querySelectorAll(".category").forEach((e) => {
    e.classList.remove("selected");
  }) 
}

const questionNumberError = document.querySelector("#questionNumberError");
const questionDifficultyError = document.querySelector("#questionDifficultyError");
const questionTypeError = document.querySelector("#questionTypeError");
const categoryError = document.querySelector("#categoryError");

function valuesAreGood() {
  const valueOfQuestions = Number(numberOfQuestions.value.trim());

  if (numberOfQuestions.value.trim() === '') {
    questionNumberError.classList.remove("d-none");
    console.log("error 1");
    return false;
  } else if (isNaN(valueOfQuestions) || valueOfQuestions < 1 || valueOfQuestions > 20) {
    questionNumberError.classList.remove("d-none");
    console.log("error 2");
    return false;
  }
  questionNumberError.classList.add("d-none");

  if ( questionDifficulty.selectedIndex === 0 ) {
    questionDifficultyError.classList.remove("d-none");
    return false;
  }
  questionDifficultyError.classList.add("d-none");

  if ( questionType.selectedIndex === 0 ) {
    questionTypeError.classList.remove("d-none");
    return false;
  }
  questionTypeError.classList.add("d-none");

  const isSelected = [...categories].some(category =>
    category.classList.contains("selected")
  );

  if (!isSelected) {
    categoryError.classList.remove("d-none");
    return false;
  }
  categoryError.classList.add("d-none");

  return true;
}


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

function correctAnswer(questionsList, questionIndex) {
  const correctAnswer = questionsList[questionIndex].correct_answer;

  return correctAnswer;
}

let wholeScore;
let userScore = 0;

async function startQuiz(amount, difficulty, type, category) {
  console.log(numberOfQuestions.value);
  
  if ( valuesAreGood() ) {
    let questionCounter = 0;
    nextQuestion.classList.remove("d-none");
    viewScore.classList.add("d-none");

    let data = await getData(amount, difficulty, type, category);
    let questions = data.results;
    console.log(questions);
    console.log(questions.length);

    let wholeNumberOfQuestions = document.querySelector("#whole-number");
    let currentQuestionNumber = document.querySelector("#current-number");
    
    currentQuestionNumber.innerHTML = questionCounter + 1;
    wholeNumberOfQuestions.innerHTML = questions.length;
    wholeScore = questions.length;


    mainSection.classList.add("d-none");
    questionSection.classList.remove("d-none");

    addQuestion(questions, questionCounter);

    nextQuestion.classList.add("d-none");
    
    nextQuestion.addEventListener("click", () => {
      questionCounter++;

      if ( questionCounter < questions.length ) {
        addQuestion(questions, questionCounter);
        currentQuestionNumber.innerHTML = questionCounter + 1;
      } 

      correctMsg.style.top = "-110%";
      wrongMsg.style.top = "-110%";

      checkQuestion.classList.remove("d-none");checkQuestion.classList.remove("d-none");
      nextQuestion.classList.add("d-none");

      if (questionCounter == questions.length - 1) {
        nextQuestion.classList.add("d-none");
      }
    })

    checkQuestion.addEventListener("click", () => {
      const answers = getAnswers(questions, questionCounter);
      const correct = correctAnswer(questions, questionCounter);
      const allAnswersBox = document.querySelectorAll("#question-box");
      const allAnswers = document.querySelectorAll("#question-box p");
      let userAnswer;
      let answerIndex;

      for ( var i = 0; i< allAnswers.length; i++ ) {
        if ( allAnswersBox[i].dataset.selected == "true" ) {
          userAnswer = allAnswersBox[i].querySelector("p").innerHTML;
          answerIndex = i;
        } 
      }

      for ( var i = 0; i< allAnswers.length; i++ ) {
        if ( allAnswers[i].innerHTML == correct ) {
          allAnswersBox[i].classList.add("correct-answer");
        } else {
          allAnswersBox[i].classList.add("incorrect-answer");
        }
      }

      console.log(answers);
      console.log(correct);
      console.log(userAnswer, answerIndex);
      
      if ( userAnswer == correct ) {
        correctMsg.style.top = "50px";
        setTimeout(() => {
          correctMsg.style.top = "-110%";
        }, 3000);
        userScore++
      } else {
        wrongMsg.style.top = "50px";
        setTimeout(() => {
          wrongMsg.style.top = "-110%";
        }, 3000);
      }

      checkQuestion.classList.add("d-none");
      nextQuestion.classList.remove("d-none");

      if (questionCounter == questions.length - 1) {
        nextQuestion.classList.add("d-none");
        viewScore.classList.remove("d-none");
      }

      for ( var i = 0; i< allAnswers.length; i++ ) {
        allAnswersBox[i].style.pointerEvents = "none";
      }
    })
  }
}

function getScore() {
  document.querySelector("#userScore").innerHTML = userScore;
  document.querySelector("#wholeScore").innerHTML = wholeScore;
}

viewScore.addEventListener("click", () => {
  questionSection.classList.add("d-none");
  scoreSection.classList.remove("d-none");
  getScore();
})

startNewQuiz.addEventListener("click", () => {
  scoreSection.classList.add("d-none");
  mainSection.classList.remove("d-none");

  clearInputs();
})

