/**************
 * SUPABASE CLIENT SETUP
 **************/
const SUPABASE_URL = "https://ypcuimvcgjbnzohhaqlg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY3VpbXZjZ2pibnpvaGhhcWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzAwNTcsImV4cCI6MjA4NTI0NjA1N30.ELS9gx8qH6BRpY365Uh6HQyf9R5n22Aa-iJ-QcRQmKg";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/**************************************
 * GLOBAL STATE
 **************************************/
const currentProblemId = localStorage.getItem("selectedProblem") || "P1";
let currentRound = 1;

/**************************************
 * HARD CODED CODES
 **************************************/
const CODES = {
  P1: {
    entry: "P1-OPEN",
    rounds: {
      2: "P1-R2",
      3: "P1-R3",
      4: "P1-R4"
    }
  }
};

/**************************************
 * HELPERS
 **************************************/
const show = el => el && el.classList.remove("d-none");
const hide = el => el && el.classList.add("d-none");

/**************************************
 * ENTRY CODE LOGIC
 **************************************/
const entryInput = document.querySelector(".problem-code");
const entryBtn = document.querySelector(".problem-code-submit-btn");
const entryError = document.querySelector(".code-input-container .errorMsg");
const cardContainer = document.querySelector(".card-container");

entryInput.addEventListener("keydown", e => {
  if (e.key === "Enter") entryBtn.click();
});

entryBtn.addEventListener("click", () => {
  const code = entryInput.value.trim();

  if (!code) {
    entryError.textContent = "Enter problem code.";
    return;
  }

  if (code !== CODES[currentProblemId].entry) {
    entryError.textContent = "Invalid problem code.";
    return;
  }

  entryError.textContent = "";
  hide(cardContainer);

  document.querySelectorAll(".problem").forEach(hide);
  show(document.querySelector(`.problem[data-problem="${currentProblemId}"]`));
});

/**************************************
 * ROUND FORM SUBMISSION
 **************************************/
document.querySelectorAll(".round-form").forEach(form => {
  const submitBtn = form.querySelector("button");

  form.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitBtn.click();
    }
  });

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

    submitBtn.disabled = true;
    hide(form);

    const round = Number(form.dataset.round);
    const nextCodeBox = document.querySelector(
      `.round-code-input-container[data-unlock="${round + 1}"]`
    );

    if (nextCodeBox) show(nextCodeBox);
  });
});

/**************************************
 * ROUND UNLOCK LOGIC 
 **************************************/
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

    if (code !== CODES[currentProblemId].rounds[nextRound]) {
      error.textContent = "Incorrect unlock code.";
      return;
    }

    // ✅ Correct code
    error.textContent = "";
    hide(box);

    /* 1️⃣ Hide previous round */
    hide(document.querySelector(`section[data-round="${nextRound - 1}"]`));

    /* 2️⃣ Show scenario */
    const scenario = document.querySelector(
      `section[data-section="${nextRound - 1}"]`
    );
    if (scenario) show(scenario);

    /* 3️⃣ Show next round section */
    const nextRoundSection = document.querySelector(
      `section[data-round="${nextRound}"]`
    );
    show(nextRoundSection);

    /* 4️⃣ VERY IMPORTANT: show its form */
    const nextForm = nextRoundSection.querySelector(".round-form");
    if (nextForm) show(nextForm);

    currentRound = nextRound;
  });
});

/**************************************
 * ROUND FORM SUBMISSION (WITH DELAY)
 **************************************/
document.querySelectorAll(".round-form").forEach(form => {
  const submitBtn = form.querySelector("button");

  form.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitBtn.click();
    }
  });

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

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    /* ⏳ 2.5 second delay */
    setTimeout(() => {
      hide(form);

      const round = Number(form.dataset.round);
      const nextCodeBox = document.querySelector(
        `.round-code-input-container[data-unlock="${round + 1}"]`
      );

      if (nextCodeBox) show(nextCodeBox);

      submitBtn.textContent = "Submitted";
    }, 2500);
  });
});