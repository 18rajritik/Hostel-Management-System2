const student = requireAuth("student");
let studentPage = 1;

document.querySelector("#studentName").textContent = student.name;
document.querySelector("#profileForm").addEventListener("submit", saveProfile);
document.querySelector("#applicationForm").addEventListener("submit", submitApplication);
document.querySelector("#complaintForm").addEventListener("submit", submitComplaint);

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-section]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".dash-section").forEach((section) => section.classList.add("hidden"));
    document.querySelector(`#${button.dataset.section}`).classList.remove("hidden");
  });
});

function badge(value) {
  const type = ["Approved", "Paid", "Resolved", "available"].includes(value)
    ? "good"
    : ["Pending", "In Progress"].includes(value)
      ? "warn"
      : "bad";
  return `<span class="badge ${type}">${value}</span>`;
}

function fillProfile() {
  const form = document.querySelector("#profileForm");
  ["name", "phone", "department", "year", "address", "guardianName", "guardianPhone"].forEach((field) => {
    form.elements[field].value = student[field] || "";
  });
}

async function saveProfile(event) {
  event.preventDefault();
  try {
    const payload = Object.fromEntries(new FormData(event.target));
    const data = await request("/users/me", { method: "PUT", body: JSON.stringify(payload) });
    localStorage.setItem("hms_user", JSON.stringify(data.user));
    toast("Profile updated");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function submitApplication(event) {
  event.preventDefault();
  try {
    await request("/applications", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(event.target)))
    });
    event.target.reset();
    toast("Room application submitted");
    loadApplications();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function submitComplaint(event) {
  event.preventDefault();
  try {
    await request("/complaints", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(event.target)))
    });
    event.target.reset();
    toast("Complaint submitted");
    loadComplaints();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadApplications() {
  const data = await request("/applications");
  const rows = data.data.map((item) => `
    <tr>
      <td>${new Date(item.createdAt).toLocaleDateString()}</td>
      <td>${item.preferredBlock || "-"}</td>
      <td>${item.preferredFloor || "-"}</td>
      <td>${badge(item.status)}</td>
      <td>${item.allottedRoom ? `${item.allottedRoom.block}-${item.allottedRoom.roomNumber}` : "Not allotted"}</td>
    </tr>
  `).join("");
  document.querySelector("#applicationRows").innerHTML = rows || `<tr><td colspan="5">No applications yet.</td></tr>`;
}

async function loadComplaints() {
  const search = document.querySelector("#complaintSearch").value;
  const data = await request(`/complaints?search=${encodeURIComponent(search)}&page=${studentPage}`);
  const rows = data.data.map((item) => `
    <tr>
      <td>${item.title}</td>
      <td>${item.category}</td>
      <td>${badge(item.status)}</td>
      <td>${item.adminNote || "-"}</td>
    </tr>
  `).join("");
  document.querySelector("#complaintRows").innerHTML = rows || `<tr><td colspan="4">No complaints found.</td></tr>`;
  document.querySelector("#complaintPage").textContent = `${data.page} / ${data.pages}`;
}

async function loadPayments() {
  const data = await request("/payments");
  const rows = data.data.map((item) => `
    <tr>
      <td>${item.term}</td>
      <td>₹${item.amount.toLocaleString("en-IN")}</td>
      <td>${new Date(item.dueDate).toLocaleDateString()}</td>
      <td>${badge(item.status)}</td>
      <td>${item.method}</td>
    </tr>
  `).join("");
  document.querySelector("#paymentRows").innerHTML = rows || `<tr><td colspan="5">No fee records found.</td></tr>`;
}

document.querySelector("#complaintSearch").addEventListener("input", () => {
  studentPage = 1;
  loadComplaints();
});

document.querySelector("#complaintPrev").addEventListener("click", () => {
  studentPage = Math.max(studentPage - 1, 1);
  loadComplaints();
});

document.querySelector("#complaintNext").addEventListener("click", () => {
  studentPage += 1;
  loadComplaints();
});

fillProfile();
loadApplications();
loadComplaints();
loadPayments();
