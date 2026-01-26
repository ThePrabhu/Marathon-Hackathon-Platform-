/*************************************************
 * TEMP FRONTEND CODE STORE
 * (Move this to Node.js later)
 *************************************************/
const problemCodes = {
  P1: {
    entry: "P1-OPEN",
    rounds: { 2: "P1-R2", 3: "P1-R3", 4: "P1-R4" }
  },
  P2: {
    entry: "P2-OPEN",
    rounds: { 2: "P2-R2", 3: "P2-R3", 4: "P2-R4" }
  }
  // ... up to P20
};

/*************************************************
 * GLOBAL STATE
 *************************************************/
let currentProblemId = null;
let currentRound = 1;

/*************************************************
 * READ SELECTED PROBLEM FROM CARD PAGE
 *************************************************/
const selectedProblemFromCard =
  localStorage.getItem("selectedProblem");

if (selectedProblemFromCard) {
  currentProblemId = selectedProblemFromCard;
}

/*************************************************
 * HELPERS
 *************************************************/
const show = el => el.classList.remove("d-none");
const hide = el => el.classList.add("d-none");

/*************************************************
 * PROBLEM CODE ENTRY + ANIMATION
 *************************************************/
const problemCodeInput =
  document.querySelector(".code-input-container input");
const problemCodeBtn =
  document.querySelector(".problem-code-submit-btn");
const problemCodeError =
  document.querySelector(".code-input-container .errorMsg");
const cardContainer =
  document.querySelector(".card-container");

// Enter key support
problemCodeInput.addEventListener("keydown", e => {
  if (e.key === "Enter") problemCodeBtn.click();
});

problemCodeBtn.addEventListener("click", () => {
  const enteredCode = problemCodeInput.value.trim();

  // No card selected
  if (!currentProblemId) {
    problemCodeError.textContent =
      "Please select a problem from the list first.";
    return;
  }

  // Empty code
  if (!enteredCode) {
    problemCodeError.textContent =
      "Please enter a problem statement code.";
    return;
  }

  // STRICT MATCHING
  if (
    !problemCodes[currentProblemId] ||
    problemCodes[currentProblemId].entry !== enteredCode
  ) {
    problemCodeError.textContent =
      "Code does not match the selected problem.";
    return;
  }

  // SUCCESS
  problemCodeError.textContent = "";
  currentRound = 1;

  // 🔥 START EXIT ANIMATION
  cardContainer.classList.add("skew-exit");

  // ⏳ WAIT FOR ANIMATION END
  cardContainer.addEventListener(
    "animationend",
    () => {
      hide(cardContainer);

      // Hide all problems
      document.querySelectorAll(".problem").forEach(hide);

      // Show selected problem
      show(
        document.querySelector(
          `.problem[data-problem="${currentProblemId}"]`
        )
      );
    },
    { once: true }
  );
});

/*************************************************
 * ROUND FORM VALIDATION & SUBMIT
 *************************************************/
document.querySelectorAll(".round-form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();

    let valid = true;
    const inputs = form.querySelectorAll("input, textarea");

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add("border-danger");
        valid = false;
      } else {
        input.classList.remove("border-danger");
      }
    });

    let error = form.querySelector(".form-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error text-danger";
      form.appendChild(error);
    }

    if (!valid) {
      error.textContent =
        "Please fill all fields before submitting.";
      return;
    }

    error.textContent = "";

    const round = Number(form.dataset.round);

    // Hide form
    hide(form);

    // Show unlock code for next round
    const codeBox = document.querySelector(
      `.problem[data-problem="${currentProblemId}"]
       .round-code-input-container[data-unlock="${round + 1}"]`
    );

    if (codeBox) show(codeBox);
  });
});

/*************************************************
 * ROUND CODE UNLOCK LOGIC
 *************************************************/
document
  .querySelectorAll(".round-code-input-container")
  .forEach(box => {
    const input = box.querySelector("input");
    const btn = box.querySelector("button");
    const error = box.querySelector(".errorMsg");

    // Enter key support
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") btn.click();
    });

    btn.addEventListener("click", () => {
      const enteredCode = input.value.trim();

      if (!enteredCode) {
        error.textContent =
          "Please enter the round unlock code.";
        return;
      }

      const nextRound = Number(box.dataset.unlock);
      const expectedCode =
        problemCodes[currentProblemId].rounds[nextRound];

      if (enteredCode !== expectedCode) {
        error.textContent = "Incorrect round code.";
        return;
      }

      error.textContent = "";
      hide(box);

      // Show next scenario
      show(
        document.querySelector(
          `.problem[data-problem="${currentProblemId}"]
           section[data-section="${nextRound}"]`
        )
      );

      // Show round block
      const roundBlock = document.querySelector(
        `.problem[data-problem="${currentProblemId}"]
         section[data-round="${nextRound}"]`
      );

      show(roundBlock);

      // Show its form
      show(
        roundBlock.querySelector(
          `.round-form[data-round="${nextRound}"]`
        )
      );

      currentRound = nextRound;
    });
  });
