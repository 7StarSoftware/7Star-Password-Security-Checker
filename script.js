(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const input = $("password");
  const toggle = $("toggle");
  const clear = $("clear");

  const rules = [
    ["length", "At least 12 characters"],
    ["upper", "Contains uppercase letters (A–Z)"],
    ["lower", "Contains lowercase letters (a–z)"],
    ["digit", "Contains numbers (0–9)"],
    ["symbol", "Contains symbols (!@#$…)"],
    ["unique", "Avoids long repeated-character runs"],
    ["common", "Avoids common words and predictable sequences"],
    ["long", "16 or more characters for extra protection"]
  ];

  const commonPasswords = new Set([
    "password", "password123", "123456789", "12345678", "qwerty123",
    "qwertyuiop", "admin123", "letmein", "welcome123", "iloveyou",
    "abc123456", "pakistan123", "1234567890", "00000000"
  ]);

  function analyze(password) {
    const variety = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;

    const lower = password.toLowerCase();
    const repeated = /(.)\1{2,}/.test(password);
    const sequential = /(?:1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf)/i.test(password);
    const common = commonPasswords.has(lower) ||
      /^(password|qwerty|admin|letmein|welcome|iloveyou)/i.test(password);

    const checks = {
      length: password.length >= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
      unique: password.length > 0 && !repeated,
      common: !common && !sequential,
      long: password.length >= 16
    };

    let score = 0;
    if (password.length) {
      // Heuristic educational score, not a real crack-time calculation.
      score = Math.min(40, Math.round(Math.min(password.length, 16) / 16 * 40));
      score += variety * 10;
      if (checks.unique) score += 10;
      if (checks.common) score += 10;
      if (checks.length) score += 5;
      if (checks.long) score += 5;
      if (common) score = Math.min(score, 15);
      if (repeated || sequential) score = Math.min(score, 45);
      score = Math.min(100, score);
    }
    return { score, variety, checks, common, repeated, sequential };
  }

  function render() {
    const password = input.value;
    const result = analyze(password);
    const score = result.score;

    let label = "Enter a password";
    let color = "#8794a9";
    let icon = "🛡️";
    let summary = "Your estimated strength will appear here.";

    if (password) {
      if (score < 25) { label = "Very weak"; color = "#f06470"; icon = "🚨"; summary = "This password may be easy to guess. Try making it much longer."; }
      else if (score < 45) { label = "Weak"; color = "#f08a52"; icon = "⚠️"; summary = "This password needs improvement before you rely on it."; }
      else if (score < 65) { label = "Fair"; color = "#e5bd59"; icon = "🔐"; summary = "A start, but more length and unpredictability would help."; }
      else if (score < 80) { label = "Strong"; color = "#4dc99b"; icon = "🛡️"; summary = "Good progress. Consider a longer, unique password."; }
      else { label = "Very strong"; color = "#4de0a7"; icon = "🔒"; summary = "Good estimated strength. Keep it unique for this account."; }
    }

    $("score").textContent = String(score);
    $("strength").textContent = label;
    $("strength").style.color = color;
    $("summary").textContent = summary;
    $("shield").textContent = icon;
    $("progress-fill").style.width = `${score}%`;
    $("progress-fill").style.backgroundColor = color;
    $("progress").setAttribute("aria-valuenow", String(score));
    $("length").textContent = `${password.length} character${password.length === 1 ? "" : "s"}`;
    $("variety").textContent = `${result.variety} of 4 types`;

    const checks = $("checks");
    checks.replaceChildren();
    let passed = 0;
    rules.forEach(([key, title]) => {
      const row = document.createElement("div");
      row.className = "check-row";
      const iconEl = document.createElement("span");
      iconEl.className = "check-icon";
      const ok = result.checks[key];
      if (password && ok) {
        passed += 1;
        row.classList.add("pass");
        iconEl.textContent = "✓";
      } else {
        iconEl.textContent = password ? "×" : "·";
      }
      const text = document.createElement("span");
      text.textContent = title;
      row.append(iconEl, text);
      checks.appendChild(row);
    });
    $("passed-count").textContent = `${passed} / ${rules.length}`;

    const tips = [];
    if (!password) {
      tips.push("Use 12–16 or more characters.");
      tips.push("Never reuse passwords across accounts.");
      tips.push("A password manager can create and store unique passwords.");
    } else {
      if (password.length < 12) tips.push("Increase the length to at least 12–16 characters; longer is usually better.");
      if (result.variety < 3) tips.push("Consider mixing uppercase and lowercase letters, numbers, and symbols.");
      if (result.common) tips.push("Avoid common words, personal information, and predictable password patterns.");
      if (result.repeated) tips.push("Avoid repeating the same character several times in a row.");
      if (result.sequential) tips.push("Avoid sequences such as 1234, abcd, or qwerty.");
      if (password.length >= 12 && password.length < 16) tips.push("Try 16 or more characters for extra protection.");
      if (score >= 80) tips.push("Use this password for one account only and store it in a reputable password manager.");
      if (!tips.length) tips.push("Keep it unique for every account and avoid sharing it with anyone.");
    }
    $("tips-title").textContent = password ? "How to improve your password" : "Tips for a stronger password";
    const tipsList = $("tips");
    tipsList.replaceChildren();
    tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      tipsList.appendChild(li);
    });
  }

  toggle.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    toggle.textContent = show ? "Hide" : "Show";
    toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    input.focus();
  });

  clear.addEventListener("click", () => {
    input.value = "";
    input.type = "password";
    toggle.textContent = "Show";
    toggle.setAttribute("aria-label", "Show password");
    render();
    input.focus();
  });

  input.addEventListener("input", render);
  render();
})();
