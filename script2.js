// SPLASH LOGIC
const splash = document.querySelector(".Imgcontainer");
const list = document.querySelector(".statementContainer");

// show list after 2 seconds
setTimeout(() => {
  splash.classList.add("d-none");
  list.classList.remove("d-none");
}, 2000);


// CARD CLICK LOGIC
document.querySelectorAll(".statement").forEach(card => {
  card.addEventListener("click", () => {
    const problemId = card.dataset.problem;

    // store selected problem
    localStorage.setItem("selectedProblem", problemId);
  });
});