const configuredApiBase =
  window.HMS_API_BASE ||
  document.documentElement.getAttribute("data-api-base") ||
  localStorage.getItem("hms_api_base");

const normalizeApiBase = (value) => {
  if (!value) return `${window.location.origin}/api`;
  return value.replace(/\/+$/, "");
};

let API_BASE = normalizeApiBase(configuredApiBase);
const DEFAULT_API_BASE = normalizeApiBase(`${window.location.origin}/api`);

const setApiBase = (value) => {
  const normalized = normalizeApiBase(value);
  localStorage.setItem("hms_api_base", normalized);
  API_BASE = normalized;
  return normalized;
};

const getToken = () => localStorage.getItem("hms_token");
const getUser = () => JSON.parse(localStorage.getItem("hms_user") || "null");
const DEMO_STORAGE_KEY = "hms_demo_data";

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const createDemoData = () => ({
  students: [
    {
      _id: "stu-1",
      name: "Aarav Sharma",
      email: "aarav@student.com",
      phone: "9876500011",
      course: "Computer Science",
      year: "3rd Year",
      address: "Jaipur, Rajasthan",
      room_id: "room-1",
      status: "active",
      join_date: "2026-04-14T00:00:00.000Z",
      createdAt: "2026-04-14T00:00:00.000Z"
    },
    {
      _id: "stu-2",
      name: "Meera Nair",
      email: "meera@student.com",
      phone: "9876500021",
      course: "Electronics",
      year: "2nd Year",
      address: "Kochi, Kerala",
      room_id: null,
      status: "pending",
      join_date: "2026-04-21T00:00:00.000Z",
      createdAt: "2026-04-21T00:00:00.000Z"
    }
  ],
  rooms: [
    {
      _id: "room-1",
      room_number: "A-101",
      block: "A",
      floor: 1,
      type: "double",
      capacity: 2,
      occupied: 1,
      status: "partial",
      amenities: ["WiFi", "Study Table", "Wardrobe"],
      createdAt: "2026-04-14T00:00:00.000Z"
    },
    {
      _id: "room-2",
      room_number: "A-102",
      block: "A",
      floor: 1,
      type: "double",
      capacity: 2,
      occupied: 0,
      status: "available",
      amenities: ["WiFi", "Balcony"],
      createdAt: "2026-04-14T00:00:00.000Z"
    }
  ],
  fees: [
    {
      _id: "fee-1",
      student_id: "stu-1",
      amount: 45000,
      month: "May 2026",
      payment_mode: "upi",
      status: "paid",
      paid_date: "2026-05-01T00:00:00.000Z",
      createdAt: "2026-05-01T00:00:00.000Z"
    },
    {
      _id: "fee-2",
      student_id: "stu-1",
      amount: 45000,
      month: "June 2026",
      payment_mode: "bank-transfer",
      status: "pending",
      paid_date: null,
      createdAt: "2026-06-01T00:00:00.000Z"
    }
  ],
  complaints: [
    {
      _id: "complaint-1",
      student_id: "stu-1",
      title: "Reading light flickering",
      description: "The study light turns off randomly at night.",
      category: "electrical",
      status: "open",
      createdAt: "2026-05-03T00:00:00.000Z"
    }
  ],
  notices: [
    {
      _id: "notice-1",
      title: "Semester Fee Reminder",
      content: "Please clear pending hostel fees before the 10th of each month.",
      category: "fees",
      is_active: true,
      createdAt: "2026-05-01T00:00:00.000Z"
    },
    {
      _id: "notice-2",
      title: "Quiet Hours",
      content: "Study quiet hours are in effect from 10 PM to 6 AM every day.",
      category: "rules",
      is_active: true,
      createdAt: "2026-05-05T00:00:00.000Z"
    }
  ]
});

const getDemoData = () => {
  const existing = localStorage.getItem(DEMO_STORAGE_KEY);
  if (existing) return JSON.parse(existing);
  const seeded = createDemoData();
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveDemoData = (data) => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
};

const ensureDemoData = () => getDemoData();

const recomputeDemoRooms = (data) => {
  data.rooms.forEach((room) => {
    const occupied = data.students.filter((student) => student.room_id === room._id).length;
    room.occupied = occupied;
    room.status = occupied <= 0 ? "available" : occupied >= room.capacity ? "full" : "partial";
  });
  return data;
};

const buildDemoAdminView = () => {
  const data = recomputeDemoRooms(cloneData(getDemoData()));
  const roomMap = new Map(data.rooms.map((room) => [room._id, room]));
  const studentMap = new Map(data.students.map((student) => [student._id, student]));

  return {
    students: data.students.map((student) => ({
      ...student,
      room_id: student.room_id ? cloneData(roomMap.get(student.room_id)) : null
    })),
    rooms: data.rooms,
    fees: data.fees.map((fee) => ({
      ...fee,
      student_id: cloneData(studentMap.get(fee.student_id))
    })),
    complaints: data.complaints.map((complaint) => ({
      ...complaint,
      student_id: cloneData(studentMap.get(complaint.student_id))
    })),
    notices: data.notices
  };
};

const buildDemoStudentView = (studentId) => {
  const data = recomputeDemoRooms(cloneData(getDemoData()));
  const roomMap = new Map(data.rooms.map((room) => [room._id, room]));
  const student = data.students.find((item) => item._id === studentId);
  if (!student) throw new Error("Demo student profile not found.");

  return {
    profile: {
      ...student,
      room_id: student.room_id ? cloneData(roomMap.get(student.room_id)) : null
    },
    fees: data.fees.filter((fee) => fee.student_id === studentId),
    complaints: data.complaints.filter((complaint) => complaint.student_id === studentId),
    notices: data.notices.filter((notice) => notice.is_active)
  };
};

const isDemoMode = () => Boolean(getUser()?.demoMode);

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const demoLogin = (role) => {
  const data = ensureDemoData();
  if (role === "student") {
    const student = data.students.find((item) => item.email === "aarav@student.com");
    setSession("demo-token-student", {
      _id: "demo-user-student",
      username: student.name,
      email: student.email,
      role: "student",
      student_id: student._id,
      demoMode: true
    });
  } else {
    setSession("demo-token-admin", {
      _id: "demo-user-admin",
      username: "Admin Officer",
      email: "admin@hostel.com",
      role: "admin",
      student_id: null,
      demoMode: true
    });
  }
};

const demoMutations = {
  addStudent(payload) {
    const data = getDemoData();
    data.students.unshift({
      _id: createId("stu"),
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
      course: payload.course || "",
      year: payload.year || "",
      address: payload.address || "",
      room_id: payload.room_id || null,
      status: "active",
      join_date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    saveDemoData(recomputeDemoRooms(data));
  },
  vacateStudent(studentId) {
    const data = getDemoData();
    const student = data.students.find((item) => item._id === studentId);
    if (student) {
      student.room_id = null;
      student.status = "vacated";
      saveDemoData(recomputeDemoRooms(data));
    }
  },
  updateStudentRoom(studentId, roomId) {
    const data = getDemoData();
    const student = data.students.find((item) => item._id === studentId);
    if (student) {
      student.room_id = roomId;
      student.status = "active";
      saveDemoData(recomputeDemoRooms(data));
    }
  },
  addRoom(payload) {
    const data = getDemoData();
    data.rooms.unshift({
      _id: createId("room"),
      room_number: payload.room_number,
      block: payload.block,
      floor: Number(payload.floor),
      type: payload.type,
      capacity: Number(payload.capacity),
      occupied: 0,
      status: "available",
      amenities: String(payload.amenities || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString()
    });
    saveDemoData(data);
  },
  deleteRoom(roomId) {
    const data = getDemoData();
    data.students.forEach((student) => {
      if (student.room_id === roomId) student.room_id = null;
    });
    data.rooms = data.rooms.filter((room) => room._id !== roomId);
    saveDemoData(recomputeDemoRooms(data));
  },
  addFee(payload) {
    const data = getDemoData();
    data.fees.unshift({
      _id: createId("fee"),
      student_id: payload.student_id,
      amount: Number(payload.amount),
      month: payload.month,
      payment_mode: payload.payment_mode,
      status: payload.status,
      paid_date: payload.status === "paid" ? new Date().toISOString() : null,
      createdAt: new Date().toISOString()
    });
    saveDemoData(data);
  },
  resolveComplaint(complaintId) {
    const data = getDemoData();
    const complaint = data.complaints.find((item) => item._id === complaintId);
    if (complaint) complaint.status = "resolved";
    saveDemoData(data);
  },
  addStudentComplaint(studentId, payload) {
    const data = getDemoData();
    data.complaints.unshift({
      _id: createId("complaint"),
      student_id: studentId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      status: "open",
      createdAt: new Date().toISOString()
    });
    saveDemoData(data);
  },
  addNotice(payload) {
    const data = getDemoData();
    data.notices.unshift({
      _id: createId("notice"),
      title: payload.title,
      content: payload.content,
      category: payload.category,
      is_active: Boolean(payload.is_active),
      createdAt: new Date().toISOString()
    });
    saveDemoData(data);
  },
  deleteNotice(noticeId) {
    const data = getDemoData();
    data.notices = data.notices.filter((notice) => notice._id !== noticeId);
    saveDemoData(data);
  }
};

const setSession = (token, user) => {
  localStorage.setItem("hms_token", token);
  localStorage.setItem("hms_user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("hms_token");
  localStorage.removeItem("hms_user");
};

const redirectForRole = (role) => {
  if (["admin", "warden"].includes(role)) {
    window.location.replace("./admin-dashboard.html");
  } else if (role === "student") {
    window.location.replace("./student-dashboard.html");
  } else {
    window.location.replace("./login.html");
  }
};

const requireRole = (allowedRoles) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user || !allowedRoles.includes(user.role)) {
    window.location.replace("./login.html");
    throw new Error("Unauthorized");
  }

  return { token, user };
};

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const executeFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

  let response;
  try {
    response = await executeFetch();
  } catch (error) {
    if (API_BASE !== DEFAULT_API_BASE) {
      API_BASE = DEFAULT_API_BASE;
      localStorage.removeItem("hms_api_base");
      try {
        response = await executeFetch();
      } catch (retryError) {
        throw new Error("Backend API is unreachable. Check deployment, API URL, and server status.");
      }
    } else {
      throw new Error("Backend API is unreachable. Check deployment, API URL, and server status.");
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }

  return data;
};

const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return { ok: true, apiBase: API_BASE };
  } catch (error) {
    return { ok: false, apiBase: API_BASE };
  }
};

const createToastStack = () => {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
};

const showToast = (message, type = "success") => {
  const stack = createToastStack();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
};

const setLoading = (elementId, state) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.classList.toggle("hidden", !state);
};

const openModal = (id) => {
  document.getElementById(id)?.classList.remove("hidden");
};

const closeModal = (id) => {
  document.getElementById(id)?.classList.add("hidden");
};

const serializeForm = (form) => {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") data[key] = data[key].trim();
  });
  return data;
};

const initials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const statusBadgeClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["paid", "active", "available", "resolved", "full"].includes(normalized)) return "green";
  if (["pending", "partial", "in-progress", "overdue"].includes(normalized)) return "orange";
  if (["open", "vacated"].includes(normalized)) return "red";
  if (["general"].includes(normalized)) return "blue";
  if (["rules"].includes(normalized)) return "purple";
  return "blue";
};

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-modal]")) {
    openModal(event.target.getAttribute("data-modal"));
  }

  if (event.target.matches("[data-close-modal]")) {
    event.target.closest(".modal")?.classList.add("hidden");
  }

  if (event.target.classList.contains("modal")) {
    event.target.classList.add("hidden");
  }
});
