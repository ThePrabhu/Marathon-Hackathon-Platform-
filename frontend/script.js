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
 * HELPERS
 **************************************/
const show = el => el && el.classList.remove("d-none");
const hide = el => el && el.classList.add("d-none");


/**************************************
 * PROGRESS PERSISTENCE (LOCAL)
 **************************************/
function getProgress(problemId) {
  return Number(localStorage.getItem(`progress_${problemId}`)) || 0;
}

function setProgress(problemId, round) {
  localStorage.setItem(`progress_${problemId}`, round);
}



/**************************************
 * SUPABASE CODE VERIFICATION
 **************************************/

// ENTRY CODE (level = 0)
/***************************************supabase Verification********************** ****/
async function verifyEntryCode(problemId, code) {
  const { data, error } = await supabaseClient
    .from("problem_codes")
    .select("id")
    .eq("problem_id", problemId)
    .eq("level", 0)
    .eq("code", code)
    .eq("active", true);

  if (error) {
    console.error("Entry code error:", error);
    return false;
  }

  return data.length === 1;
}

// ROUND CODES (level = 2,3,4)
async function verifyRoundCode(problemId, level, code) {
  const { data, error } = await supabaseClient
    .from("problem_codes")
    .select("id")
    .eq("problem_id", problemId)
    .eq("level", level)
    .eq("code", code)
    .eq("active", true);

  if (error) {
    console.error("Round code error:", error);
    return false;
  }

  return data.length === 1;
}


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

entryBtn.addEventListener("click", async () => {
  const code = entryInput.value.trim();
  entryError.textContent = "";

  if (!code) {
    entryError.textContent = "Enter problem code.";
    return;
  }

  entryBtn.disabled = true;
  entryBtn.textContent = "Checking...";

  const isValid = await verifyProblemEntry(currentProblemId, code);

  entryBtn.disabled = false;
  entryBtn.textContent = "Enter";

  if (!isValid) {
    entryError.textContent = "Invalid problem code.";
    return; // ⛔ HARD STOP
  }

  // ✅ ONLY HERE UI IS UNLOCKED
  hide(cardContainer);
  document.querySelectorAll(".problem").forEach(hide);
  show(document.querySelector(`.problem[data-problem="${currentProblemId}"]`));
});




  /***************************************supabase Verification********************** ****/

  async function verifyProblemEntry(problemId, code) {
  const { data, error } = await supabaseClient
    .from("problem_codes")
    .select("id")
    .eq("problem_id", problemId)
    .eq("level", 0)
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Entry verification error:", error);
    return false;
  }

  return !!data;
}


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

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const round = Number(form.dataset.round);
  const teamId = form.querySelector(".teamId").value.trim();
  const teamName = form.querySelector(".teamName").value.trim();
  const teamLeader = form.querySelector(".teamLeader").value.trim();
  const answer = form.querySelector("textarea").value.trim();

  const { error } = await supabaseClient
    .from("submissions")
    .insert([{
      team_id: teamId,
      team_name: teamName,
      team_leader: teamLeader,
      problem_id: currentProblemId,
      round,
      answer
    }]);

  if (error) {
    // 🚫 UNIQUE constraint hit
    if (error.code === "23505") {
      alert("You have already submitted this round.");
    } else {
      alert("Submission failed.");
      console.error(error);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit!";
    return;
  }

  // ✅ Success flow
  setTimeout(() => {
    hide(form);

    const nextCodeBox = document.querySelector(
      `.round-code-input-container[data-unlock="${round + 1}"]`
    );
    if (nextCodeBox) show(nextCodeBox);
  }, 2000);
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

   /***************************************supabase Verification********************** ****/
  btn.disabled = true;

  verifyRoundCode(currentProblemId, nextRound, code).then(isValid => {
    if (!isValid) {
      error.textContent = "Incorrect unlock code.";
      btn.disabled = false;
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
    if (nextRoundSection) show(nextRoundSection);;

    /* 4️⃣ Show its form */
    const nextForm = nextRoundSection.querySelector(".round-form");
    if (nextForm) show(nextForm);

    currentRound = nextRound;
    setProgress(currentProblemId, nextRound);
  });
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

/**************************************
 * RESTORE STATE ON PAGE LOAD
 **************************************/
window.addEventListener("load", () => {
  const progress = getProgress(currentProblemId);
  if (!progress) return;

  // Hide entry gate
  hide(document.querySelector(".card-container"));

  // Show correct problem
  const problem = document.querySelector(
    `.problem[data-problem="${currentProblemId}"]`
  );
  if (!problem) return;

  show(problem);

  // Reset everything first
  problem.querySelectorAll("[data-round]").forEach(hide);
  problem.querySelectorAll("[data-section]").forEach(hide);
  problem.querySelectorAll(".round-code-input-container").forEach(hide);

  // Replay unlocked rounds
  for (let r = 1; r <= progress; r++) {
    const scenario = problem.querySelector(`[data-section="${r}"]`);
    if (scenario) show(scenario);

    const roundBlock = problem.querySelector(`[data-round="${r}"]`);
    if (roundBlock) show(roundBlock);
  }

  // Show next form if exists
  const nextRound = progress + 1;
  const nextForm = problem.querySelector(
    `.round-form[data-round="${nextRound}"]`
  );
  if (nextForm) show(nextForm);
});
