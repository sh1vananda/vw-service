function tabTo(cat) {
  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".service-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(`btn-${cat}`).classList.add("active");
  document.getElementById(`panel-${cat}`).classList.add("active");
}

function checkOther(val) {
  document.getElementById("other-input-container").style.display =
    val === "Other" ? "block" : "none";
}

function toggleMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}

function isLoggedIn() {
  return sessionStorage.getItem("vw_admin_logged_in") === "true";
}

function showLoginScreen() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("main-app").style.display = "none";
}

function hideLoginScreen() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  if (username === "admin" && password === "admin123") {
    sessionStorage.setItem("vw_admin_logged_in", "true");
    hideLoginScreen();
    setView("garage");
  } else {
    alert("Invalid username or password");
    document.getElementById("admin-password").value = "";
  }
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("vw_admin_logged_in");
    showLoginScreen();
  }
}

function setView(view) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`${view}-section`).classList.add("active");
  document.getElementById(`nav-${view}`).classList.add("active");

  const activeSection = document.getElementById(`${view}-section`);
  if (activeSection) {
    activeSection.setAttribute("aria-hidden", "false");
    document.querySelectorAll(".section:not(.active)").forEach((section) => {
      section.setAttribute("aria-hidden", "true");
    });
  }

  if (view === "garage") renderGarage();

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (hamburger && navMenu) {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }
  window.scrollTo(0, 0);

  const mainHeading = activeSection.querySelector("h1");
  if (mainHeading) {
    mainHeading.focus();
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const checked = Array.from(
    document.querySelectorAll('input[name="task"]:checked')
  ).map((i) => i.value);

  if (checked.length === 0) {
    alert("Technical requirement selection is mandatory.");
    return;
  }

  const modelVal = document.getElementById("model-select").value;
  const finalModel =
    modelVal === "Other"
      ? document.getElementById("model-other").value
      : modelVal;

  const entry = {
    id: document.getElementById("edit-id").value || Date.now().toString(),
    model: finalModel,
    reg: document.getElementById("reg-num").value,
    tasks: checked,
    date: document.getElementById("date-pick").value,
    time: document.getElementById("time-pick").value,
    notes: document.getElementById("notes").value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (response.ok) {
      console.log("Saved to database");
    }
  } catch (error) {
    console.log("API unavailable, using localStorage");
  }

  const data = JSON.parse(localStorage.getItem("vw_enterprise_v4") || "[]");
  const idx = data.findIndex((x) => x.id === entry.id);

  if (idx > -1) data[idx] = entry;
  else data.push(entry);

  localStorage.setItem("vw_enterprise_v4", JSON.stringify(data));
  resetForm();
  setView("garage");
}

const form = document.getElementById("mainForm");
form.addEventListener("submit", handleFormSubmit);

function renderGarage() {
  const container = document.getElementById("booking-list");
  const data = JSON.parse(localStorage.getItem("vw_enterprise_v4") || "[]");

  container.innerHTML = data.length
    ? ""
    : '<div class="card">No active technical dossiers found.</div>';

  data
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((item) => {
      const div = document.createElement("div");
      div.className = "booking-item";
      div.setAttribute("role", "region");
      div.setAttribute("aria-label", `Booking for ${item.model} - ${item.reg}`);
      div.innerHTML = `
        <div class="booking-meta">
            <h3>${item.model} — ${item.reg}</h3>
            <p>Dossier Date: <strong>${
              item.date
            }</strong> | Scheduled Slot: <strong>${item.time}</strong></p>
            <div class="task-tags" aria-label="Service tasks">
                ${item.tasks
                  .map(
                    (t) =>
                      `<span class="tag" aria-label="Service task: ${t}">${t}</span>`
                  )
                  .join("")}
            </div>
        </div>
        <div style="display:flex; gap:1.5rem; align-items:center">
            <button class="btn btn-outline" style="padding:0.7rem 1.5rem;" onclick="prepEdit('${
              item.id
            }')" aria-label="Modify booking for ${item.model}">Modify</button>
            <button class="btn btn-danger" onclick="cancelBooking('${
              item.id
            }')" aria-label="Cancel booking for ${item.model}">Cancel</button>
        </div>
    `;
      container.appendChild(div);
    });
}

function cancelBooking(id) {
  if (!confirm("Are you sure you want to purge this technical booking?"))
    return;
  let data = JSON.parse(localStorage.getItem("vw_enterprise_v4"));
  data = data.filter((x) => x.id !== id);
  localStorage.setItem("vw_enterprise_v4", JSON.stringify(data));
  renderGarage();
}

function prepEdit(id) {
  const data = JSON.parse(localStorage.getItem("vw_enterprise_v4"));
  const item = data.find((x) => x.id === id);
  setView("book");

  document.getElementById("edit-id").value = item.id;
  const mSelect = document.getElementById("model-select");
  const isStd = Array.from(mSelect.options).some((o) => o.value === item.model);

  if (isStd) {
    mSelect.value = item.model;
    checkOther("");
  } else {
    mSelect.value = "Other";
    checkOther("Other");
    document.getElementById("model-other").value = item.model;
  }

  document.getElementById("reg-num").value = item.reg;
  document.getElementById("date-pick").value = item.date;
  document.getElementById("time-pick").value = item.time;
  document.getElementById("notes").value = item.notes;

  document.querySelectorAll('input[name="task"]').forEach((cb) => {
    cb.checked = item.tasks.includes(cb.value);
  });

  document.getElementById("submit-btn").textContent = "Update Records";
  document.getElementById("cancel-edit").style.display = "block";
}

function resetForm() {
  form.reset();
  document.getElementById("edit-id").value = "";
  document.getElementById("submit-btn").textContent = "Submit Booking";
  document.getElementById("cancel-edit").style.display = "none";
  checkOther("");
  tabTo("maint");
}

tabTo("maint");
document.getElementById("date-pick").min = new Date()
  .toISOString()
  .split("T")[0];

let loginFormHandler = handleLogin;

document
  .getElementById("login-form")
  .addEventListener("submit", loginFormHandler);

if (!isLoggedIn()) {
  showLoginScreen();
} else {
  hideLoginScreen();
  setView("garage");
}
