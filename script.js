const domCache = {
  loginScreen: null,
  mainApp: null,
  bookingList: null,
  editId: null,
  modelSelect: null,
  modelOther: null,
  regNum: null,
  datePick: null,
  timePick: null,
  notes: null,
  submitBtn: null,
  cancelEdit: null,
  otherInputContainer: null,
  adminUsername: null,
  adminPassword: null,
  hamburger: null,
  navMenu: null,
  sections: null,
  navButtons: null,
  catBtns: null,
  servicePanels: null,

  init() {
    this.loginScreen = document.getElementById("login-screen");
    this.mainApp = document.getElementById("main-app");
    this.bookingList = document.getElementById("booking-list");
    this.editId = document.getElementById("edit-id");
    this.modelSelect = document.getElementById("model-select");
    this.modelOther = document.getElementById("model-other");
    this.regNum = document.getElementById("reg-num");
    this.datePick = document.getElementById("date-pick");
    this.timePick = document.getElementById("time-pick");
    this.notes = document.getElementById("notes");
    this.submitBtn = document.getElementById("submit-btn");
    this.cancelEdit = document.getElementById("cancel-edit");
    this.otherInputContainer = document.getElementById("other-input-container");
    this.adminUsername = document.getElementById("admin-username");
    this.adminPassword = document.getElementById("admin-password");
    this.hamburger = document.querySelector(".hamburger");
    this.navMenu = document.querySelector(".nav-menu");
    this.sections = document.querySelectorAll(".section");
    this.navButtons = document.querySelectorAll("nav button");
    this.catBtns = document.querySelectorAll(".cat-btn");
    this.servicePanels = document.querySelectorAll(".service-panel");
  },
};

function tabTo(cat) {
  domCache.catBtns.forEach((b) => b.classList.remove("active"));
  domCache.servicePanels.forEach((p) => p.classList.remove("active"));
  document.getElementById(`btn-${cat}`).classList.add("active");
  document.getElementById(`panel-${cat}`).classList.add("active");
}

function checkOther(val) {
  domCache.otherInputContainer.style.display =
    val === "Other" ? "block" : "none";
}

function toggleMobileMenu() {
  domCache.hamburger.classList.toggle("active");
  domCache.navMenu.classList.toggle("active");
}

function isLoggedIn() {
  return sessionStorage.getItem("vw_admin_logged_in") === "true";
}

function showLoginScreen() {
  domCache.loginScreen.style.display = "flex";
  domCache.mainApp.style.display = "none";
}

function hideLoginScreen() {
  domCache.loginScreen.style.display = "none";
  domCache.mainApp.style.display = "block";
}

function handleLogin(e) {
  e.preventDefault();
  const username = domCache.adminUsername.value;
  const password = domCache.adminPassword.value;
  if (username === "admin" && password === "admin123") {
    sessionStorage.setItem("vw_admin_logged_in", "true");
    hideLoginScreen();
    setView("garage");
  } else {
    alert("Invalid username or password");
    domCache.adminPassword.value = "";
  }
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("vw_admin_logged_in");
    showLoginScreen();
  }
}

function setView(view) {
  domCache.sections.forEach((s) => s.classList.remove("active"));
  domCache.navButtons.forEach((b) => b.classList.remove("active"));
  document.getElementById(`${view}-section`).classList.add("active");
  document.getElementById(`nav-${view}`).classList.add("active");

  const activeSection = document.getElementById(`${view}-section`);
  if (activeSection) {
    activeSection.setAttribute("aria-hidden", "false");
    domCache.sections.forEach((section) => {
      if (!section.classList.contains("active")) {
        section.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (view === "garage") renderGarage();

  if (domCache.hamburger && domCache.navMenu) {
    domCache.hamburger.classList.remove("active");
    domCache.navMenu.classList.remove("active");
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

  const modelVal = domCache.modelSelect.value;
  const finalModel =
    modelVal === "Other" ? domCache.modelOther.value : modelVal;

  const entry = {
    id: domCache.editId.value || Date.now().toString(),
    model: finalModel,
    reg: domCache.regNum.value,
    tasks: checked,
    date: domCache.datePick.value,
    time: domCache.timePick.value,
    notes: domCache.notes.value,
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
  const container = domCache.bookingList;
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

  domCache.editId.value = item.id;
  const mSelect = domCache.modelSelect;
  const isStd = Array.from(mSelect.options).some((o) => o.value === item.model);

  if (isStd) {
    mSelect.value = item.model;
    checkOther("");
  } else {
    mSelect.value = "Other";
    checkOther("Other");
    domCache.modelOther.value = item.model;
  }

  domCache.regNum.value = item.reg;
  domCache.datePick.value = item.date;
  domCache.timePick.value = item.time;
  domCache.notes.value = item.notes;

  document.querySelectorAll('input[name="task"]').forEach((cb) => {
    cb.checked = item.tasks.includes(cb.value);
  });

  domCache.submitBtn.textContent = "Update Records";
  domCache.cancelEdit.style.display = "block";
}

function resetForm() {
  form.reset();
  domCache.editId.value = "";
  domCache.submitBtn.textContent = "Submit Booking";
  domCache.cancelEdit.style.display = "none";
  checkOther("");
  tabTo("maint");
}

// Initialize DOM cache and set up the application
domCache.init();
tabTo("maint");
domCache.datePick.min = new Date().toISOString().split("T")[0];

document.getElementById("login-form").addEventListener("submit", handleLogin);

if (!isLoggedIn()) {
  showLoginScreen();
} else {
  hideLoginScreen();
  setView("garage");
}
