requireRole(["admin", "warden"]);

const adminState = {
  students: [],
  rooms: [],
  fees: [],
  complaints: [],
  notices: [],
  feeFilter: "all"
};

const currentUser = getUser();
document.getElementById("admin-user-name").textContent = currentUser.username;
document.getElementById("admin-user-role").textContent = currentUser.role;
document.getElementById("admin-user-avatar").textContent = initials(currentUser.username);

const setSection = (sectionId) => {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
  document.querySelectorAll(".section-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === sectionId);
  });
  document.getElementById("section-title").textContent =
    sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
};

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => setSection(button.dataset.section));
});

document.getElementById("logout-button").addEventListener("click", () => {
  clearSession();
  window.location.replace("./login.html");
});

const renderStudents = () => {
  const tbody = document.getElementById("students-table");
  tbody.innerHTML = adminState.students
    .map((student) => {
      const room = student.room_id
        ? `${student.room_id.room_number} / ${student.room_id.block}`
        : "Unassigned";
      return `
        <tr>
          <td data-label="Name">${student.name}</td>
          <td data-label="Email">${student.email}</td>
          <td data-label="Phone">${student.phone || "—"}</td>
          <td data-label="Course">${student.course || "—"}</td>
          <td data-label="Year">${student.year || "—"}</td>
          <td data-label="Room">${room}</td>
          <td data-label="Status"><span class="badge ${statusBadgeClass(student.status)}">${student.status}</span></td>
          <td data-label="Access">
            <span class="badge ${student.accessApproved ? "green" : "orange"}">
              ${student.accessApproved ? "approved" : "pending"}
            </span>
          </td>
          <td data-label="Action">
            <button class="table-action ${student.accessApproved ? "danger" : ""}" data-toggle-access="${student._id}" data-approved="${student.accessApproved ? "true" : "false"}">
              ${student.accessApproved ? "Revoke Access" : "Approve Access"}
            </button>
            <button class="table-action ${student.room_id ? "danger" : ""}" ${
              student.room_id ? `data-vacate="${student._id}"` : "disabled"
            }>
              Vacate
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
};

const renderRooms = () => {
  const tbody = document.getElementById("rooms-table");
  tbody.innerHTML = adminState.rooms
    .map(
      (room) => `
        <tr>
          <td data-label="Room">${room.room_number}</td>
          <td data-label="Block">${room.block}</td>
          <td data-label="Floor">${room.floor}</td>
          <td data-label="Type">${room.type}</td>
          <td data-label="Capacity">${room.capacity}</td>
          <td data-label="Occupied">${room.occupied}</td>
          <td data-label="Status"><span class="badge ${statusBadgeClass(room.status)}">${room.status}</span></td>
          <td data-label="Action"><button class="table-action danger" data-delete-room="${room._id}">Delete</button></td>
        </tr>
      `
    )
    .join("");
};

const renderFees = () => {
  const tbody = document.getElementById("fees-table");
  const filtered =
    adminState.feeFilter === "all"
      ? adminState.fees
      : adminState.fees.filter((fee) => fee.status === adminState.feeFilter);

  tbody.innerHTML = filtered
    .map(
      (fee) => `
        <tr>
          <td data-label="Student">${fee.student_id?.name || "Unknown"}</td>
          <td data-label="Amount">${formatCurrency(fee.amount)}</td>
          <td data-label="Month">${fee.month}</td>
          <td data-label="Payment Mode">${fee.payment_mode}</td>
          <td data-label="Status"><span class="badge ${statusBadgeClass(fee.status)}">${fee.status}</span></td>
          <td data-label="Paid Date">${formatDate(fee.paid_date)}</td>
        </tr>
      `
    )
    .join("");
};

const renderComplaints = () => {
  const tbody = document.getElementById("complaints-table");
  tbody.innerHTML = adminState.complaints
    .map(
      (complaint) => `
        <tr>
          <td data-label="Student">${complaint.student_id?.name || "Unknown"}</td>
          <td data-label="Title">${complaint.title}</td>
          <td data-label="Category">${complaint.category}</td>
          <td data-label="Status"><span class="badge ${statusBadgeClass(complaint.status)}">${complaint.status}</span></td>
          <td data-label="Date">${formatDate(complaint.createdAt)}</td>
          <td data-label="Action">
            <button class="table-action" data-resolve="${complaint._id}" ${
              complaint.status === "resolved" ? "disabled" : ""
            }>
              Resolve
            </button>
          </td>
        </tr>
      `
    )
    .join("");
};

const renderNotices = () => {
  const tbody = document.getElementById("notices-table");
  tbody.innerHTML = adminState.notices
    .map(
      (notice) => `
        <tr>
          <td data-label="Title">${notice.title}</td>
          <td data-label="Category"><span class="badge ${statusBadgeClass(notice.category)}">${notice.category}</span></td>
          <td data-label="Active">${notice.is_active ? "Yes" : "No"}</td>
          <td data-label="Posted">${formatDate(notice.createdAt)}</td>
          <td data-label="Action"><button class="table-action danger" data-delete-notice="${notice._id}">Delete</button></td>
        </tr>
      `
    )
    .join("");
};

const renderStats = () => {
  document.getElementById("stat-students").textContent = adminState.students.length;
  document.getElementById("stat-rooms").textContent = adminState.rooms.length;
  document.getElementById("stat-fees").textContent = adminState.fees.filter((fee) =>
    ["pending", "overdue"].includes(fee.status)
  ).length;
  document.getElementById("stat-complaints").textContent = adminState.complaints.filter(
    (complaint) => complaint.status !== "resolved"
  ).length;

  const tip =
    adminState.students.length && adminState.rooms.length
      ? "Use the Room Allocation page to match unassigned students with open rooms."
      : "Add rooms and students to start building your hostel map.";
  document.getElementById("dashboard-tip").textContent = tip;

  const studentSelect = document.getElementById("fee-student-select");
  studentSelect.innerHTML = adminState.students
    .map((student) => `<option value="${student._id}">${student.name}</option>`)
    .join("");
};

const loadAllData = async () => {
  setLoading("global-loader", true);
  try {
    if (isDemoMode()) {
      const demoView = buildDemoAdminView();
      adminState.students = demoView.students;
      adminState.rooms = demoView.rooms;
      adminState.fees = demoView.fees;
      adminState.complaints = demoView.complaints;
      adminState.notices = demoView.notices;
    } else {
      const [students, rooms, fees, complaints, notices] = await Promise.all([
        apiFetch("/students"),
        apiFetch("/rooms"),
        apiFetch("/fees"),
        apiFetch("/complaints"),
        apiFetch("/notices")
      ]);

      adminState.students = students.data || [];
      adminState.rooms = rooms.data || [];
      adminState.fees = fees.data || [];
      adminState.complaints = complaints.data || [];
      adminState.notices = notices.data || [];
    }

    renderStudents();
    renderRooms();
    renderFees();
    renderComplaints();
    renderNotices();
    renderStats();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading("global-loader", false);
  }
};

document.getElementById("student-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = serializeForm(event.target);
    if (isDemoMode()) demoMutations.addStudent(payload);
    else {
      await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    closeModal("student-modal");
    event.target.reset();
    showToast("Student created successfully.");
    await loadAllData();
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.getElementById("room-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = serializeForm(event.target);
  payload.floor = Number(payload.floor);
  payload.capacity = Number(payload.capacity);
  try {
    if (isDemoMode()) demoMutations.addRoom(payload);
    else {
      await apiFetch("/rooms", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    closeModal("room-modal");
    event.target.reset();
    showToast("Room added successfully.");
    await loadAllData();
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.getElementById("fee-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = serializeForm(event.target);
  payload.amount = Number(payload.amount);
  try {
    if (isDemoMode()) demoMutations.addFee(payload);
    else {
      await apiFetch("/fees", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    closeModal("fee-modal");
    event.target.reset();
    showToast("Fee record created.");
    await loadAllData();
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.getElementById("notice-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = serializeForm(event.target);
  payload.is_active = event.target.is_active.checked;
  try {
    if (isDemoMode()) demoMutations.addNotice(payload);
    else {
      await apiFetch("/notices", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    closeModal("notice-modal");
    event.target.reset();
    event.target.is_active.checked = true;
    showToast("Notice published.");
    await loadAllData();
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.addEventListener("click", async (event) => {
  const vacateId = event.target.getAttribute("data-vacate");
  const toggleAccessId = event.target.getAttribute("data-toggle-access");
  const approvedState = event.target.getAttribute("data-approved");
  const deleteRoomId = event.target.getAttribute("data-delete-room");
  const resolveId = event.target.getAttribute("data-resolve");
  const deleteNoticeId = event.target.getAttribute("data-delete-notice");

  try {
    if (toggleAccessId) {
      if (isDemoMode()) {
        showToast("Access approval is only available with live backend.", "error");
        return;
      }
      const nextApproved = approvedState !== "true";
      await apiFetch(`/students/${toggleAccessId}/access`, {
        method: "PUT",
        body: JSON.stringify({ approved: nextApproved })
      });
      showToast(nextApproved ? "Student access approved." : "Student access revoked.");
      await loadAllData();
    }

    if (vacateId) {
      if (isDemoMode()) demoMutations.vacateStudent(vacateId);
      else await apiFetch(`/students/${vacateId}/vacate`, { method: "PUT" });
      showToast("Student vacated successfully.");
      await loadAllData();
    }

    if (deleteRoomId) {
      if (isDemoMode()) demoMutations.deleteRoom(deleteRoomId);
      else await apiFetch(`/rooms/${deleteRoomId}`, { method: "DELETE" });
      showToast("Room deleted.");
      await loadAllData();
    }

    if (resolveId) {
      if (isDemoMode()) demoMutations.resolveComplaint(resolveId);
      else await apiFetch(`/complaints/${resolveId}/resolve`, { method: "PUT" });
      showToast("Complaint resolved.");
      await loadAllData();
    }

    if (deleteNoticeId) {
      if (isDemoMode()) demoMutations.deleteNotice(deleteNoticeId);
      else await apiFetch(`/notices/${deleteNoticeId}`, { method: "DELETE" });
      showToast("Notice deleted.");
      await loadAllData();
    }
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.querySelectorAll("[data-fee-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    adminState.feeFilter = button.dataset.feeFilter;
    document.querySelectorAll("[data-fee-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderFees();
  });
});

loadAllData();
