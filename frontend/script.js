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

  if (!currentProblemId) {
    problemCodeError.textContent =
      "Please select a problem first.";
    return;
  }

  if (!enteredCode) {
    problemCodeError.textContent =
      "Please enter the problem code.";
    return;
  }

  fetch("http://localhost:3000/verify-problem-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problemId: currentProblemId,
      code: enteredCode
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        problemCodeError.textContent =
          "Invalid code.";
        return;
      }

      problemCodeError.textContent = "";
      currentRound = 1;

      // 🔥 animation
      cardContainer.classList.add("skew-exit");

      cardContainer.addEventListener(
        "animationend",
        () => {
          hide(cardContainer);
          document.querySelectorAll(".problem").forEach(hide);

          show(
            document.querySelector(
              `.problem[data-problem="${currentProblemId}"]`
            )
          );
        },
        { once: true }
      );
    })
    .catch(() => {
      problemCodeError.textContent =
        "Server error. Try again.";
    });
});

/*************************************************
 * ROUND FORM SUBMISSION
 *************************************************/
document.querySelectorAll(".round-form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input, textarea").forEach(input => {
      if (!input.value.trim()) {
        input.classList.add("border-danger");
        valid = false;
      } else {
        input.classList.remove("border-danger");
      }
    });

    if (!valid) return;

    const round = Number(form.dataset.round);
    hide(form);

    const codeBox = document.querySelector(
      `.problem[data-problem="${currentProblemId}"]
       .round-code-input-container[data-unlock="${round + 1}"]`
    );

    if (codeBox) show(codeBox);
  });
});

/*************************************************
 * ROUND CODE UNLOCK
 *************************************************/
document
  .querySelectorAll(".round-code-input-container")
  .forEach(box => {
    const input = box.querySelector("input");
    const btn = box.querySelector("button");
    const error = box.querySelector(".errorMsg");

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") btn.click();
    });

    btn.addEventListener("click", () => {
      const enteredCode = input.value.trim();
      const nextRound = Number(box.dataset.unlock);

      if (!enteredCode) {
        error.textContent = "Enter code.";
        return;
      }

      fetch("http://localhost:3000/verify-round-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: currentProblemId,
          round: nextRound,
          code: enteredCode
        })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            error.textContent = "Incorrect code.";
            return;
          }

          error.textContent = "";
          hide(box);

          show(
            document.querySelector(
              `.problem[data-problem="${currentProblemId}"]
               section[data-section="${nextRound}"]`
            )
          );

          const roundBlock = document.querySelector(
            `.problem[data-problem="${currentProblemId}"]
             section[data-round="${nextRound}"]`
          );

          show(roundBlock);
          show(
            roundBlock.querySelector(
              `.round-form[data-round="${nextRound}"]`
            )
          );

          currentRound = nextRound;
        })
        .catch(() => {
          error.textContent =
            "Server error.";
        });
    });
  });
