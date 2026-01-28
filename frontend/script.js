/*****************
 * API BASE (ONLY FOR CODE VERIFICATION – unchanged)
 *****************/
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://marathon-hackathon-platform-1.onrender.com";

/*****************
 * N8N PRODUCTION WEBHOOK (IMPORTANT)
 *****************/
const N8N_WEBHOOK_URL =
  "https://ujwalc54.app.n8n.cloud/webhook/submit-answer";

/*****************
 * GLOBAL STATE
 *****************/
let currentProblemId = null;
let currentRound = 1;

/*****************
 * LOAD SELECTED PROBLEM
 *****************/
currentProblemId = localStorage.getItem("selectedProblem");

/*****************
 * HELPERS
 *****************/
const show = el => el.classList.remove("d-none");
const hide = el => el.classList.add("d-none");

/*****************
 * PROBLEM CODE ENTRY (UNCHANGED)
 *****************/
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
        return;
      }

      problemCodeError.textContent = "";
      cardContainer.classList.add("fade-slide-out");

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
      problemCodeError.textContent = "Network error.";
    })
    .finally(() => {
      problemCodeBtn.classList.remove("btn-loading");
    });
});

/*****************
 * ROUND FORM SUBMISSION (N8N INTEGRATION ADDED)
 *****************/
document.querySelectorAll(".round-form").forEach(form => {
  form.addEventListener("submit", async e => {
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

    const round = Number(form.dataset.round);

    const teamName = form.querySelector(".teamName").value.trim();
    const teamId = form.querySelector(".teamId").value.trim();
    const answer = form.querySelector("textarea").value.trim();

    /* 🔥 SEND DATA TO N8N (PRODUCTION WEBHOOK) */
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_code: teamId,
          team_name: teamName,
          problem_id: currentProblemId,
          level: round,
          answer: answer
        })
      });
    } catch (err) {
      alert("Submission failed. Please try again.");
      return;
    }

    /* UI FLOW (UNCHANGED) */
    form.classList.add("form-submit-anim");

    form.addEventListener(
      "animationend",
      () => {
        hide(form);

        const codeBox = document.querySelector(
          `.problem[data-problem="${currentProblemId}"]
           .round-code-input-container[data-unlock="${round + 1}"]`
        );

        if (codeBox) show(codeBox);
      },
      { once: true }
    );
  });
});

/*****************
 * ROUND CODE UNLOCK (UNCHANGED)
 *****************/
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
          return;
        }

        error.textContent = "";
        box.classList.add("fade-slide-out");

        box.addEventListener(
          "animationend",
          () => {
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
            const roundForm = roundBlock?.querySelector(
              `.round-form[data-round="${nextRound}"]`
            );
            if (roundForm) show(roundForm);
          },
          { once: true }
        );
      })
      .catch(() => {
        error.textContent = "Server error.";
      })
      .finally(() => {
        btn.classList.remove("btn-loading");
      });
  });
});