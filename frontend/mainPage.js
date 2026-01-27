// SPLASH LOGIC
const splash = document.querySelector(".Imgcontainer");
const list = document.querySelector(".statementContainer");

// LOCK SCROLL DURING SPLASH
document.documentElement.style.overflow = "hidden";
document.body.style.overflow = "hidden";

// show list after 2 seconds
setTimeout(() => {

  splash.classList.add("d-none");
  list.classList.remove("d-none");

  // RESTORE SCROLL (ONLY VERTICAL)
  document.documentElement.style.overflowX = "hidden";
  document.documentElement.style.overflowY = "auto";

   document.body.style.overflowX = "hidden";
  document.body.style.overflowY = "auto";

}, 2000);


// CARD CLICK LOGIC
document.querySelectorAll(".statement").forEach(card => {
  card.addEventListener("click", () => {
    const problemId = card.dataset.problem;

    // store selected problem
    localStorage.setItem("selectedProblem", problemId);
  });
});