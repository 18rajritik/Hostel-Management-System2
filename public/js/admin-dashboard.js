const admin = requireAuth("admin");
let roomPage = 1;
let studentPage = 1;
let complaintPage = 1;

document.querySelector("#adminName").textContent = admin.name;

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

async function loadAnalytics() {
  const { data } = await request("/analytics");
  document.querySelector("#metrics").innerHTML = `
    <div class="card metric"><span>Total Students</span><strong>${data.totalStudents}</strong></div>
    <div class="card metric"><span>Rooms Occupied</span><strong>${data.roomsOccupied}</strong></div>
    <div class="card metric"><span>Available Rooms</span><strong>${data.availableRooms}</strong></div>
    <div class="card metric"><span>Open Complaints</span><strong>${data.activeComplaints}</strong></div>
  `;
}

async function loadStudents() {
  const search = document.querySelector("#studentSearch").value;
  const data = await request(`/users?search=${encodeURIComponent(search)}&page=${studentPage}`);
  document.querySelector("#studentRows").innerHTML = data.data.map((student) => `
    <tr>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.department || "-"}</td>
      <td>${student.year || "-"}</td>
      <td><button class="btn danger" onclick="deleteStudent('${student._id}')">Delete</button></td>
    </tr>
  `).join("") || `<tr><td colspan="5">No students found.</td></tr>`;
  document.querySelector("#studentPage").textContent = `${data.page} / ${data.pages}`;
}

async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  try {
    await request(`/users/${id}`, { method: "DELETE" });
    toast("Student deleted");
    loadStudents();
    loadAnalytics();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadRooms() {
  const search = document.querySelector("#roomSearch").value;
  const status = document.querySelector("#roomStatus").value;
  const data = await request(`/rooms?search=${encodeURIComponent(search)}&status=${status}&page=${roomPage}`);
  document.querySelector("#roomRows").innerHTML = data.data.map((room) => `
    <tr>
      <td>${room.roomNumber}</td>
      <td>${room.block}</td>
      <td>${room.floor}</td>
      <td>${room.occupants.length}/${room.capacity}</td>
      <td>${badge(room.status)}</td>
      <td>
        <button class="btn" onclick='editRoom(${JSON.stringify(room)})'>Edit</button>
        <button class="btn danger" onclick="deleteRoom('${room._id}')">Delete</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No rooms found.</td></tr>`;
  document.querySelector("#roomPage").textContent = `${data.page} / ${data.pages}`;
}

function openRoomModal() {
  document.querySelector("#roomForm").reset();
  document.querySelector("#roomId").value = "";
  document.querySelector("#roomModal").classList.add("show");
}

function editRoom(room) {
  const form = document.querySelector("#roomForm");
  form.roomId.value = room._id;
  form.roomNumber.value = room.roomNumber;
  form.block.value = room.block;
  form.floor.value = room.floor;
  form.capacity.value = room.capacity;
  form.status.value = room.status;
  document.querySelector("#roomModal").classList.add("show");
}

async function deleteRoom(id) {
  if (!confirm("Delete this room?")) return;
  try {
    await request(`/rooms/${id}`, { method: "DELETE" });
    toast("Room deleted");
    loadRooms();
    loadAnalytics();
  } catch (error) {
    toast(error.message, "error");
  }
}

document.querySelector("#roomForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target));
  const id = payload.roomId;
  delete payload.roomId;
  try {
    await request(id ? `/rooms/${id}` : "/rooms", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    document.querySelector("#roomModal").classList.remove("show");
    toast(id ? "Room updated" : "Room added");
    loadRooms();
    loadAnalytics();
  } catch (error) {
    toast(error.message, "error");
  }
});

async function loadApplications() {
  const rooms = await request("/rooms?status=available&limit=50");
  const roomOptions = rooms.data.map((room) => `<option value="${room._id}">${room.roomNumber} (${room.block}, ${room.availableBeds} beds)</option>`).join("");
  const data = await request("/applications");
  document.querySelector("#applicationRows").innerHTML = data.data.map((item) => `
    <tr>
      <td>${item.student?.name || "-"}</td>
      <td>${item.preferredBlock || "-"}</td>
      <td>${item.preferredFloor || "-"}</td>
      <td>${badge(item.status)}</td>
      <td>
        <select id="room-${item._id}">${roomOptions}</select>
      </td>
      <td>
        <button class="btn primary" onclick="updateApplication('${item._id}', 'Approved')">Approve</button>
        <button class="btn danger" onclick="updateApplication('${item._id}', 'Rejected')">Reject</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No applications found.</td></tr>`;
}

async function updateApplication(id, status) {
  try {
    const roomId = document.querySelector(`#room-${id}`)?.value;
    await request(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, roomId })
    });
    toast(`Application ${status.toLowerCase()}`);
    loadApplications();
    loadRooms();
    loadAnalytics();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadComplaints() {
  const search = document.querySelector("#complaintSearch").value;
  const status = document.querySelector("#complaintStatus").value;
  const data = await request(`/complaints?search=${encodeURIComponent(search)}&status=${status}&page=${complaintPage}`);
  document.querySelector("#complaintRows").innerHTML = data.data.map((item) => `
    <tr>
      <td>${item.student?.name || "-"}</td>
      <td>${item.title}</td>
      <td>${item.category}</td>
      <td>${badge(item.status)}</td>
      <td>
        <select onchange="updateComplaint('${item._id}', this.value)">
          ${["Pending", "In Progress", "Resolved"].map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="5">No complaints found.</td></tr>`;
  document.querySelector("#complaintPage").textContent = `${data.page} / ${data.pages}`;
}

async function updateComplaint(id, status) {
  try {
    await request(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    toast("Complaint updated");
    loadComplaints();
    loadAnalytics();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadPayments() {
  const payments = await request("/payments?limit=50");
  document.querySelector("#paymentRows").innerHTML = payments.data.map((item) => `
    <tr>
      <td>${item.student?.name || "-"}</td>
      <td>${item.term}</td>
      <td>₹${item.amount.toLocaleString("en-IN")}</td>
      <td>${new Date(item.dueDate).toLocaleDateString()}</td>
      <td>${badge(item.status)}</td>
      <td>
        <button class="btn" onclick='editPayment(${JSON.stringify(item)})'>Edit</button>
        <button class="btn danger" onclick="deletePayment('${item._id}')">Delete</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No payments found.</td></tr>`;
}

async function openPaymentModal() {
  document.querySelector("#paymentForm").reset();
  document.querySelector("#paymentId").value = "";
  const students = await request("/users?limit=50");
  document.querySelector("#paymentStudent").innerHTML = students.data.map((student) => `<option value="${student._id}">${student.name}</option>`).join("");
  document.querySelector("#paymentModal").classList.add("show");
}

function editPayment(payment) {
  openPaymentModal().then(() => {
    const form = document.querySelector("#paymentForm");
    form.paymentId.value = payment._id;
    form.student.value = payment.student?._id || payment.student;
    form.term.value = payment.term;
    form.amount.value = payment.amount;
    form.dueDate.value = payment.dueDate.slice(0, 10);
    form.status.value = payment.status;
    form.method.value = payment.method;
  });
}

document.querySelector("#paymentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target));
  const id = payload.paymentId;
  delete payload.paymentId;
  try {
    await request(id ? `/payments/${id}` : "/payments", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    document.querySelector("#paymentModal").classList.remove("show");
    toast(id ? "Payment updated" : "Payment added");
    loadPayments();
    loadAnalytics();
  } catch (error) {
    toast(error.message, "error");
  }
});

async function deletePayment(id) {
  if (!confirm("Delete this payment record?")) return;
  await request(`/payments/${id}`, { method: "DELETE" });
  toast("Payment deleted");
  loadPayments();
}

["studentSearch", "roomSearch", "roomStatus", "complaintSearch", "complaintStatus"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("input", () => {
    studentPage = roomPage = complaintPage = 1;
    loadStudents();
    loadRooms();
    loadComplaints();
  });
});

document.querySelector("#studentPrev").onclick = () => { studentPage = Math.max(studentPage - 1, 1); loadStudents(); };
document.querySelector("#studentNext").onclick = () => { studentPage += 1; loadStudents(); };
document.querySelector("#roomPrev").onclick = () => { roomPage = Math.max(roomPage - 1, 1); loadRooms(); };
document.querySelector("#roomNext").onclick = () => { roomPage += 1; loadRooms(); };
document.querySelector("#complaintPrev").onclick = () => { complaintPage = Math.max(complaintPage - 1, 1); loadComplaints(); };
document.querySelector("#complaintNext").onclick = () => { complaintPage += 1; loadComplaints(); };

loadAnalytics();
loadStudents();
loadRooms();
loadApplications();
loadComplaints();
loadPayments();
