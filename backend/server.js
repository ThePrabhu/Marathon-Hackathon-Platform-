const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 PRIVATE — BACKEND ONLY
const problemCodes = {
  P1: {
    entry: "P1-OPEN",
    rounds: {
      2: "P1-R2",
      3: "P1-R3",
      4: "P1-R4"
    }
  },
  P2: {
    entry: "P2-OPEN",
    rounds: {
      2: "P2-R2",
      3: "P2-R3",
      4: "P2-R4"
    }
  }
};

// ---------- VERIFY PROBLEM CODE ----------
app.post("/verify-problem-code", (req, res) => {
  const { problemId, code } = req.body;

  if (!problemCodes[problemId]) {
    return res.status(400).json({ success: false });
  }

  if (problemCodes[problemId].entry !== code) {
    return res.status(401).json({ success: false });
  }

  res.json({ success: true });
});

// ---------- VERIFY ROUND CODE ----------
app.post("/verify-round-code", (req, res) => {
  const { problemId, round, code } = req.body;

  const problem = problemCodes[problemId];

  if (!problem || !problem.rounds[round]) {
    return res.status(400).json({ success: false });
  }

  if (problem.rounds[round] !== code) {
    return res.status(401).json({ success: false });
  }

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
