console.log("✅ script.js loaded");

window.addEventListener("DOMContentLoaded", () => {

  /* ================= SUPABASE ================= */
  const SUPABASE_URL = "https://akxtmyyffjltnrgzbjna.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreHRteXlmZmpsdG5yZ3piam5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODQzMDAsImV4cCI6MjA4NTM2MDMwMH0.0ZmNZ98me4tRw8UQu9nHbxaTZAYpV2BxdyHr_-sy0oE";

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  /* ================= HELPERS ================= */
  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];
  const show = el => el && el.classList.remove("d-none");
  const hide = el => el && el.classList.add("d-none");

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  /* ================= DOM ================= */
  const cardContainer = qs(".card-container");
  const entryInput = qs(".problem-code");
  const entryBtn = qs(".problem-code-submit-btn");
  const entryError = qs(".errorMsg");

  const problems = qsa(".problem");

  /* ================= STATE ================= */
  const selectedProblem = localStorage.getItem("selectedProblem");
  const progressKey = pid => `progress_${pid}`;

  const getProgress = pid =>
    Number(localStorage.getItem(progressKey(pid))) || 0;

  const setProgress = (pid, round) =>
    localStorage.setItem(progressKey(pid), round);

  const bound = new Set();

  /* ================= RESET ================= */
  function resetProblem(problemEl) {
    problemEl.querySelectorAll("[data-round]").forEach(hide);
    problemEl.querySelectorAll("[data-section]").forEach(hide);
    problemEl.querySelectorAll(".round-code-input-container").forEach(hide);
  }

function replayProblem(problemEl, progress) {

  // FIRST TIME ENTRY → SHOW ROUND 1
  if (progress === 0) {
    show(problemEl.querySelector('[data-round="1"]'));
    show(problemEl.querySelector('.round-form[data-round="1"]'));
    return;
  }

  // REPLAY COMPLETED ROUNDS
  for (let i = 1; i <= progress; i++) {
    show(problemEl.querySelector(`[data-section="${i}"]`));
    show(problemEl.querySelector(`[data-round="${i}"]`));
  }

  // SHOW NEXT ROUND FORM
  const nextForm = problemEl.querySelector(
    `.round-form[data-round="${progress + 1}"]`
  );
  if (nextForm) show(nextForm);
}


  /* ================= DB ================= */
  async function verifyEntryCode(code) {
    const { data } = await supabase
      .from("problem_codes")
      .select("problem_id")
      .eq("level", 0)
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();

    return data?.problem_id || null;
  }

  async function verifyUnlockCode(pid, level, code) {
    const { data } = await supabase
      .from("problem_codes")
      .select("id")
      .eq("problem_id", pid)
      .eq("level", level)
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();

    return !!data;
  }

  async function alreadySubmitted(teamId, pid, round) {
    const { data } = await supabase
      .from("submissions")
      .select("id")
      .eq("team_id", teamId)
      .eq("problem_id", pid)
      .eq("round", round)
      .maybeSingle();

    return !!data;
  }

  async function submitAnswer(payload) {
    const { error } = await supabase
      .from("submissions")
      .insert([payload]);

    return !error;
  }

  /* ================= ENTRY ================= */
  entryBtn.addEventListener("click", async () => {
    entryError.textContent = "";
    const code = entryInput.value.trim();

    if (!code) {
      entryError.textContent = "Enter problem code";
      return;
    }

    entryBtn.disabled = true;
    await sleep(1500);

    const pid = await verifyEntryCode(code);
    entryBtn.disabled = false;

    if (!pid || String(pid) !== selectedProblem) {
      entryError.textContent = "Invalid problem code";
      return;
    }

    hide(cardContainer);
    problems.forEach(hide);

    const problemEl = qs(`.problem[data-problem="${pid}"]`);
    if (!problemEl) {
      entryError.textContent = "Problem not found";
      return;
    }

    show(problemEl);
    resetProblem(problemEl);
    replayProblem(problemEl, getProgress(pid));
    bindProblem(problemEl);
  });

  /* ================= BIND ================= */
  function bindProblem(problemEl) {
    const pid = problemEl.dataset.problem;
    if (bound.has(pid)) return;
    bound.add(pid);

    /* ===== FORMS ===== */
    problemEl.querySelectorAll(".round-form").forEach(form => {
      form.addEventListener("submit", async e => {
        e.preventDefault();

        const round = Number(form.dataset.round);
        const teamId = form.querySelector(".teamId").value.trim();
        const teamName = form.querySelector(".teamName").value.trim();
        const leader = form.querySelector(".teamLeader").value.trim();
        const answer = form.querySelector("textarea").value.trim();

        if (!teamId || !teamName || !leader || !answer) return;

        if (await alreadySubmitted(teamId, pid, round)) {
          alert("Already submitted");
          return;
        }

        form.querySelector("button").disabled = true;
        await sleep(2000);

        const ok = await submitAnswer({
          team_id: teamId,
          team_name: teamName,
          team_leader: leader,
          problem_id: pid,
          round,
          answer
        });

        if (!ok) {
          alert("Submission failed");
          return;
        }

        hide(form);
        show(
          problemEl.querySelector(
            `.round-code-input-container[data-unlock="${round + 1}"]`
          )
        );
      });
    });

    /* ===== UNLOCK CODES ===== */
    problemEl.querySelectorAll(".round-code-input-container").forEach(box => {
      const btn = box.querySelector("button");
      const input = box.querySelector("input");
      const error = box.querySelector(".errorMsg");

      btn.addEventListener("click", async () => {
        error.textContent = "";
        const code = input.value.trim();
        const nextRound = Number(box.dataset.unlock);

        if (!code) {
          error.textContent = "Enter unlock code";
          return;
        }

        btn.disabled = true;
        await sleep(1500);

        const ok = await verifyUnlockCode(pid, nextRound, code);
        btn.disabled = false;

        if (!ok) {
          error.textContent = "Wrong code";
          return;
        }

        hide(box);
        show(problemEl.querySelector(`[data-section="${nextRound - 1}"]`));
        show(problemEl.querySelector(`[data-round="${nextRound}"]`));
        setProgress(pid, nextRound);
      });
    });
  }

});


