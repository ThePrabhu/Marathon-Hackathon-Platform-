/*************************************************
 * API BASE (LOCAL vs DEPLOYED)
 *************************************************/
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://marathon-hackathon-platform-1.onrender.com";

/*************************************************
 * GLOBAL STATE
 *************************************************/
let currentProblemId = null;
let currentRound = 1;

/*************************************************
 * LOAD SELECTED PROBLEM
 *************************************************/
currentProblemId = localStorage.getItem("selectedProblem");

/*************************************************
 * HELPERS
 *************************************************/
const show = el => el.classList.remove("d-none");
const hide = el => el.classList.add("d-none");

/*************************************************
 * PROBLEM CODE ENTRY
 *************************************************/
const problemCodeInput = document.querySelector(".code-input-container input");
const problemCodeBtn = document.querySelector(".problem-code-submit-btn");
const problemCodeError = document.querySelector(".code-input-container .errorMsg");
const cardContainer = document.querySelector(".card-container");

problemCodeInput.addEventListener("keydown", e => {
  if (e.key === "Enter") problemCodeBtn.click();
});

problemCodeBtn.addEventListener("click", () => {
  const code = problemCodeInput.value.trim();

  if (!currentProblemId) {
    problemCodeError.textContent = "Select a problem first.";
    return;
  }

  if (!code) {
    problemCodeError.textContent = "Enter the problem code.";
    return;
  }

  problemCodeBtn.classList.add("btn-loading");

  fetch(`${API_BASE}/verify-problem-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId: currentProblemId, code })
  })
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        problemCodeError.textContent = "Invalid code.";
        problemCodeBtn.classList.remove("btn-loading");
        return;
      }

      problemCodeError.textContent = "";
      cardContainer.classList.add("fade-slide-out");

      cardContainer.addEventListener("animationend", () => {
        hide(cardContainer);
        document.querySelectorAll(".problem").forEach(hide);
        show(document.querySelector(`.problem[data-problem="${currentProblemId}"]`));
      }, { once: true });
    })
    .catch(err => {
      console.error(err);
      problemCodeError.textContent = "Network error. Backend waking up.";
    })
    .finally(() => {
      problemCodeBtn.classList.remove("btn-loading");
    });
});

/*************************************************
 * ROUND FORM SUBMISSION
 *************************************************/
document.querySelectorAll(".round-form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input, textarea").forEach(el => {
      if (!el.value.trim()) {
        el.classList.add("border-danger");
        valid = false;
      } else {
        el.classList.remove("border-danger");
      }
    });

    if (!valid) return;

    form.classList.add("form-submit-anim");

    const round = Number(form.dataset.round);

    form.addEventListener("animationend", () => {
      hide(form);

      const codeBox = document.querySelector(
        `.problem[data-problem="${currentProblemId}"]
         .round-code-input-container[data-unlock="${round + 1}"]`
      );

      if (codeBox) show(codeBox);
    }, { once: true });
  });
});

/*************************************************
 * ROUND CODE UNLOCK
 *************************************************/
document.querySelectorAll(".round-code-input-container").forEach(box => {
  const input = box.querySelector("input");
  const btn = box.querySelector("button");
  const error = box.querySelector(".errorMsg");

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") btn.click();
  });

  btn.addEventListener("click", () => {
    const code = input.value.trim();
    const nextRound = Number(box.dataset.unlock);

    if (!code) {
      error.textContent = "Enter unlock code.";
      return;
    }

    btn.classList.add("btn-loading");

    fetch(`${API_BASE}/verify-round-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: currentProblemId,
        round: nextRound,
        code
      })
    })
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          error.textContent = "Incorrect code.";
          btn.classList.remove("btn-loading");
          return;
        }

        error.textContent = "";
        box.classList.add("fade-slide-out");

        box.addEventListener("animationend", () => {
          hide(box);

          show(document.querySelector(
            `.problem[data-problem="${currentProblemId}"]
             section[data-section="${nextRound}"]`
          ));

          const roundBlock = document.querySelector(
            `.problem[data-problem="${currentProblemId}"]
             section[data-round="${nextRound}"]`
          );

          show(roundBlock);
          show(roundBlock.querySelector(`.round-form[data-round="${nextRound}"]`));
        }, { once: true });
      })
      .catch(err => {
        console.error(err);
        error.textContent = "Server error.";
      })
      .finally(() => {
        btn.classList.remove("btn-loading");
      });
  });
});
