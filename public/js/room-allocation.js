requireRole(["admin", "warden"]);

const allocationState = {
  students: [],
  rooms: [],
  selectedStudentId: null,
  roomFilter: "available"
};

const getRoomFilterStatus = (room) => {
  if (room.occupied >= room.capacity) return "occupied";
  if (room.occupied > 0) return "partial";
  return "available";
};

const renderAllocation = () => {
  const studentWrap = document.getElementById("unallocated-students");
  const roomWrap = document.getElementById("available-rooms");

  const unallocated = allocationState.students.filter((student) => !student.room_id);
  const filteredRooms = allocationState.rooms.filter(
    (room) => getRoomFilterStatus(room) === allocationState.roomFilter
  );

  studentWrap.innerHTML = unallocated.length
    ? unallocated
        .map(
          (student) => `
            <button class="selection-card ${allocationState.selectedStudentId === student._id ? "selected" : ""}" data-student-card="${student._id}">
              <h3>${student.name}</h3>
              <p>${student.course || "Course not set"} • ${student.year || "Year not set"}</p>
              <p>${student.email}</p>
            </button>
          `
        )
        .join("")
    : `<div class="empty-state">All students are currently allocated.</div>`;

  roomWrap.innerHTML = filteredRooms.length
    ? filteredRooms
        .map((room) => {
          const roomStatus = getRoomFilterStatus(room);
          return `
            <button class="selection-card ${roomStatus === "occupied" ? "room-full" : "room-available"}" data-room-card="${room._id}">
              <h4>Room ${room.room_number}</h4>
              <p>${room.block} Block • Floor ${room.floor}</p>
              <p>${room.type} • ${room.occupied}/${room.capacity} occupied • ${roomStatus}</p>
            </button>
          `;
        })
        .join("")
    : `<div class="empty-state">No rooms in ${allocationState.roomFilter} status right now.</div>`;
};

const loadAllocationData = async () => {
  try {
    if (isDemoMode()) {
      const demoView = buildDemoAdminView();
      allocationState.students = demoView.students || [];
      allocationState.rooms = demoView.rooms || [];
    } else {
      const [studentsRes, roomsRes] = await Promise.all([apiFetch("/students"), apiFetch("/rooms")]);
      allocationState.students = studentsRes.data || [];
      allocationState.rooms = roomsRes.data || [];
    }
    renderAllocation();
  } catch (error) {
    showToast(error.message, "error");
  }
};

document.addEventListener("click", async (event) => {
  const studentId = event.target.closest("[data-student-card]")?.dataset.studentCard;
  const roomId = event.target.closest("[data-room-card]")?.dataset.roomCard;

  if (studentId) {
    allocationState.selectedStudentId = studentId;
    renderAllocation();
    return;
  }

  if (roomId) {
    if (!allocationState.selectedStudentId) {
      showToast("Select a student first.", "error");
      return;
    }

    const student = allocationState.students.find((item) => item._id === allocationState.selectedStudentId);
    const room = allocationState.rooms.find((item) => item._id === roomId);

    if (!room || room.occupied >= room.capacity) {
      showToast("This room is already fully occupied.", "error");
      return;
    }

    const confirmed = window.confirm(`Allocate ${student.name} to Room ${room.room_number}?`);
    if (!confirmed) return;

    try {
      if (isDemoMode()) {
        demoMutations.updateStudentRoom(student._id, room._id);
      } else {
        await apiFetch(`/students/${student._id}`, {
          method: "PUT",
          body: JSON.stringify({ room_id: room._id, status: "active" })
        });
      }
      showToast("Room allocated successfully.");
      allocationState.selectedStudentId = null;
      await loadAllocationData();
    } catch (error) {
      showToast(error.message, "error");
    }
  }
});

document.querySelectorAll("[data-room-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    allocationState.roomFilter = button.dataset.roomFilter;
    document.querySelectorAll("[data-room-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderAllocation();
  });
});

loadAllocationData();
