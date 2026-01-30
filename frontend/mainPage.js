document.addEventListener("DOMContentLoaded", () => {
  // SPLASH LOGIC
const splash = document.querySelector(".Imgcontainer");
const list = document.querySelector(".statementContainer");
const videoSection = document.querySelector(".videoSection");
const enterBtn = document.querySelector(".enterBtn");

// LOCK SCROLL
document.documentElement.style.overflow = "hidden";
document.body.style.overflow = "hidden";

// AFTER SPLASH
setTimeout(() => {
  splash.classList.add("d-none");
  videoSection.classList.remove("d-none");

  // SHOW BUTTON AFTER 3s
  setTimeout(() => {
    enterBtn.classList.add("show");
  }, 3000);
}, 2000);

// ENTER BUTTON CLICK
enterBtn.addEventListener("click", () => {
  videoSection.style.opacity = "0";

  setTimeout(() => {
    videoSection.classList.add("d-none");
    list.classList.remove("d-none");

    // RESTORE SCROLL
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
  }, 600);
});

// CARD CLICK LOGIC
document.querySelectorAll(".statement").forEach(card => {
  card.addEventListener("click", () => {
    const problemId = card.dataset.problem;

    // store selected problem
    localStorage.setItem("selectedProblem", problemId);

    window.location.href="attempt.html"
  });
});

});
