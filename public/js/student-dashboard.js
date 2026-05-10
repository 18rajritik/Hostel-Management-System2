requireRole(["student"]);

const studentUser = getUser();
const studentState = {
  profile: null,
  fees: [],
  complaints: [],
  notices: []
};

const switchStudentSection = (sectionId) => {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
  document.querySelectorAll(".section-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === sectionId);
  });
  const button = document.querySelector(`[data-section="${sectionId}"]`);
  document.getElementById("student-section-title").textContent = button?.textContent || "Student";
};

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => switchStudentSection(button.dataset.section));
});

document.getElementById("student-logout").addEventListener("click", () => {
  clearSession();
  window.location.replace("./login.html");
});

const renderProfile = () => {
  const profile = studentState.profile;
  document.getElementById("student-name").textContent = profile.name;
  document.getElementById("student-email").textContent = profile.email;
  document.getElementById("student-avatar").textContent = initials(profile.name);

  document.getElementById("profile-card").innerHTML = `
    <article class="profile-card">
      <h3>${profile.name}</h3>
      <div class="profile-meta">
        <div><strong>Email</strong>${profile.email}</div>
        <div><strong>Phone</strong>${profile.phone || "—"}</div>
        <div><strong>Course</strong>${profile.course || "—"}</div>
        <div><strong>Year</strong>${profile.year || "—"}</div>
        <div><strong>Address</strong>${profile.address || "—"}</div>
        <div><strong>Join Date</strong>${formatDate(profile.join_date)}</div>
        <div><strong>Status</strong><span class="badge ${statusBadgeClass(profile.status)}">${profile.status}</span></div>
      </div>
    </article>
    <article class="profile-card">
      <h3>Room Allocation</h3>
      ${
        profile.room_id
          ? `
            <div class="profile-meta">
              <div><strong>Room Number</strong>${profile.room_id.room_number}</div>
              <div><strong>Block</strong>${profile.room_id.block}</div>
              <div><strong>Floor</strong>${profile.room_id.floor}</div>
              <div><strong>Type</strong>${profile.room_id.type}</div>
            </div>
          `
          : `<p>No room assigned yet.</p>`
      }
    </article>
  `;

  document.getElementById("room-card").className = `room-showcase${profile.room_id ? "" : " empty-state"}`;
  document.getElementById("room-card").innerHTML = profile.room_id
    ? `
      <h2>Room ${profile.room_id.room_number}</h2>
      <p><strong>Block:</strong> ${profile.room_id.block}</p>
      <p><strong>Floor:</strong> ${profile.room_id.floor}</p>
      <p><strong>Type:</strong> ${profile.room_id.type}</p>
      <p><strong>Amenities:</strong> ${
        profile.room_id.amenities?.length ? profile.room_id.amenities.join(", ") : "Not listed"
      }</p>
    `
    : `<p>No room assigned yet.</p>`;
};

const renderFees = () => {
  const tbody = document.getElementById("student-fees-table");
  tbody.innerHTML = studentState.fees
    .map(
      (fee) => `
        <tr>
          <td>${fee.month}</td>
          <td>${formatCurrency(fee.amount)}</td>
          <td>${fee.payment_mode}</td>
          <td><span class="badge ${statusBadgeClass(fee.status)}">${fee.status}</span></td>
          <td>${formatDate(fee.paid_date)}</td>
        </tr>
      `
    )
    .join("");

  const paid = studentState.fees
    .filter((fee) => fee.status === "paid")
    .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  const pending = studentState.fees
    .filter((fee) => fee.status !== "paid")
    .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

  document.getElementById("total-paid").textContent = formatCurrency(paid);
  document.getElementById("total-pending").textContent = formatCurrency(pending);
};

const renderComplaints = () => {
  const tbody = document.getElementById("student-complaints-table");
  tbody.innerHTML = studentState.complaints
    .map(
      (complaint) => `
        <tr>
          <td>${complaint.title}</td>
          <td>${complaint.category}</td>
          <td><span class="badge ${statusBadgeClass(complaint.status)}">${complaint.status}</span></td>
          <td>${formatDate(complaint.createdAt)}</td>
        </tr>
      `
    )
    .join("");
};

const renderNotices = () => {
  const wrap = document.getElementById("student-notices");
  wrap.innerHTML = studentState.notices
    .map(
      (notice) => `
        <article class="notice-card">
          <span class="badge ${statusBadgeClass(notice.category)}">${notice.category}</span>
          <h3>${notice.title}</h3>
          <p>${notice.content}</p>
          <small>${formatDate(notice.createdAt)}</small>
        </article>
      `
    )
    .join("");
};

const loadStudentData = async () => {
  setLoading("student-loader", true);
  try {
    const [profileRes, feesRes, complaintsRes, noticesRes] = await Promise.all([
      apiFetch("/student/me"),
      apiFetch("/student/me/fees"),
      apiFetch("/student/me/complaints"),
      apiFetch("/notices/active")
    ]);

    studentState.profile = profileRes.data;
    studentState.fees = feesRes.data || [];
    studentState.complaints = complaintsRes.data || [];
    studentState.notices = noticesRes.data || [];

    renderProfile();
    renderFees();
    renderComplaints();
    renderNotices();
  } catch (error) {
    showToast(error.message, "error");
    if (error.message.includes("linked")) {
      clearSession();
      setTimeout(() => window.location.replace("./login.html"), 1200);
    }
  } finally {
    setLoading("student-loader", false);
  }
};

document.getElementById("student-complaint-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await apiFetch("/student/me/complaints", {
      method: "POST",
      body: JSON.stringify(serializeForm(event.target))
    });
    closeModal("student-complaint-modal");
    event.target.reset();
    showToast("Complaint submitted successfully.");
    await loadStudentData();
  } catch (error) {
    showToast(error.message, "error");
  }
});

loadStudentData();
