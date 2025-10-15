const courses = [
  { id: 1, title: "HTML Basics", category: "Web Development", description: "Learn the structure of web pages using HTML.", lessons: ["Intro to HTML", "Tags & Elements", "Links & Images"] },
  { id: 2, title: "CSS Fundamentals", category: "Web Design", description: "Style your web pages beautifully with CSS.", lessons: ["Selectors", "Colors & Fonts", "Flexbox & Layouts"] },
  { id: 3, title: "JavaScript for Beginners", category: "Web Development", description: "Add interactivity to your pages with JavaScript.", lessons: ["Variables", "Functions", "DOM Manipulation"] },
  { id: 4, title: "UI/UX Design Principles", category: "Design", description: "Design engaging user experiences and clean interfaces.", lessons: ["Design Basics", "Color Theory", "Wireframing"] },
];

const app = document.getElementById("app");
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");
let searchQuery = "";
let selectedCategory = "All";

/* AUTHENTICATION */
function showLoginPage() {
  app.innerHTML = `
    <div class="login-container">
      <h2>Welcome Back</h2>
      <input type="text" id="username" placeholder="Enter username" required />
      <input type="password" id="password" placeholder="Enter password" required />
      <button onclick="loginUser()">Login</button>
      <p style="margin-top:10px;">New user? <a href="#" onclick="showSignUp()">Create account</a></p>
    </div>
  `;
}

function showSignUp() {
  app.innerHTML = `
    <div class="login-container">
      <h2>Create Account</h2>
      <input type="text" id="newUsername" placeholder="Choose a username" required />
      <input type="password" id="newPassword" placeholder="Choose a password" required />
      <button onclick="signUpUser()">Sign Up</button>
      <p style="margin-top:10px;">Already have an account? <a href="#" onclick="showLoginPage()">Login</a></p>
    </div>
  `;
}

function signUpUser() {
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value.trim();

  if (!username || !password) return alert("Please fill in both fields.");
  if (users[username]) return alert("Username already exists.");

  users[username] = { password, progress: {} };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created! Please log in.");
  showLoginPage();
}

function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("Please enter your credentials.");
  if (!users[username] || users[username].password !== password) return alert("Invalid username or password.");

  currentUser = username;
  localStorage.setItem("currentUser", username);
  showCourseList();
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLoginPage();
}

/* COURSE MANAGEMENT */
function showCourseList() {
  const userData = users[currentUser] || { progress: {} };
  const categories = ["All", ...new Set(courses.map(c => c.category))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  app.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <h2>Hello, ${currentUser} 👋</h2>
      <div>
        <button onclick="showProfile()" style="background:#4a90e2; margin-right:0.5rem;">Profile</button>
        <button onclick="logoutUser()" style="background:#777;">Logout</button>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" placeholder="Search courses..." oninput="updateSearch(this.value)" />
      <select onchange="updateCategory(this.value)">
        ${categories.map(cat => `<option ${cat===selectedCategory ? "selected" : ""}>${cat}</option>`).join("")}
      </select>
    </div>

    <div class="course-list">
      ${
        filteredCourses.length
          ? filteredCourses.map(course => {
              const completed = userData.progress[course.id]?.length || 0;
              const total = course.lessons.length;
              const percent = (completed / total) * 100;

              return `
                <div class="course-card">
                  <h3>${course.title}</h3>
                  <p><strong>Category:</strong> ${course.category}</p>
                  <p>${course.description}</p>
                  <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
                  <small>${completed}/${total} lessons completed</small><br />
                  <button onclick="viewCourse(${course.id})">View Details</button>
                </div>
              `;
            }).join("")
          : "<p>No courses match your search.</p>"
      }
    </div>
  `;
}

function updateSearch(value) {
  searchQuery = value;
  showCourseList();
}

function updateCategory(value) {
  selectedCategory = value;
  showCourseList();
}

function viewCourse(id) {
  const userData = users[currentUser];
  const course = courses.find(c => c.id === id);
  const completed = userData.progress[id] || [];
  const percent = (completed.length / course.lessons.length) * 100;

  app.innerHTML = `
    <div class="course-detail">
      <h2>${course.title}</h2>
      <p><strong>Category:</strong> ${course.category}</p>
      <p>${course.description}</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
      <small>${completed.length}/${course.lessons.length} lessons completed</small>
      <h3 style="margin-top:1rem;">Lessons:</h3>
      <ul>
        ${course.lessons.map((lesson, i) => `
          <li class="lesson ${completed.includes(i) ? "completed" : ""}" onclick="toggleLesson(${id}, ${i})">${lesson}</li>
        `).join("")}
      </ul>
      <button style="background:#777; margin-top:1rem;" onclick="showCourseList()">Back to Courses</button>
    </div>
  `;
}

function toggleLesson(courseId, lessonIndex) {
  const userData = users[currentUser];
  userData.progress[courseId] = userData.progress[courseId] || [];
  if (userData.progress[courseId].includes(lessonIndex)) {
    userData.progress[courseId] = userData.progress[courseId].filter(i => i !== lessonIndex);
  } else {
    userData.progress[courseId].push(lessonIndex);
  }
  localStorage.setItem("users", JSON.stringify(users));
  viewCourse(courseId);
}

/* PROFILE ANALYTICS */
function showProfile() {
  const userData = users[currentUser];
  const progress = userData.progress || {};
  let totalLessons = 0;
  let completedLessons = 0;
  let coursesStarted = Object.keys(progress).length;
  let coursesCompleted = 0;

  const courseNames = [];
  const lessonsCompletedPerCourse = [];

  courses.forEach(course => {
    totalLessons += course.lessons.length;
    const completed = progress[course.id]?.length || 0;
    completedLessons += completed;
    if (completed === course.lessons.length && completed > 0) {
      coursesCompleted++;
    }
    courseNames.push(course.title);
    lessonsCompletedPerCourse.push(completed);
  });

  const percentComplete = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  app.innerHTML = `
    <div class="profile-dashboard">
      <h2>${currentUser}'s Learning Dashboard</h2>
      <p>Track your progress and accomplishments 🎯</p>

      <div class="stats-grid">
        <div class="stat-card"><h3>${coursesStarted}</h3><p>Courses Started</p></div>
        <div class="stat-card"><h3>${coursesCompleted}</h3><p>Courses Completed</p></div>
        <div class="stat-card"><h3>${completedLessons}</h3><p>Lessons Completed</p></div>
        <div class="stat-card"><h3>${percentComplete}%</h3><p>Overall Progress</p></div>
      </div>

      <div style="margin-top:2rem;">
        <canvas id="completionChart" width="200" height="200"></canvas>
      </div>
      <div style="margin-top:2rem;">
        <canvas id="lessonChart" width="400" height="250"></canvas>
      </div>

      <button style="margin-top:2rem;" onclick="showCourseList()">Back to Courses</button>
    </div>
  `;

  setTimeout(() => {
    const ctx1 = document.getElementById("completionChart").getContext("2d");
    new Chart(ctx1, {
      type: "pie",
      data: {
        labels: ["Completed", "Remaining"],
        datasets: [{
          data: [percentComplete, 100 - percentComplete],
          backgroundColor: ["#4a90e2", "#e4e4e4"],
        }]
      },
      options: {
        plugins: {
          title: { display: true, text: "Overall Completion", font: { size: 16 } },
          legend: { position: "bottom" }
        }
      }
    });

    const ctx2 = document.getElementById("lessonChart").getContext("2d");
    new Chart(ctx2, {
      type: "bar",
      data: {
        labels: courseNames,
        datasets: [{
          label: "Lessons Completed",
          data: lessonsCompletedPerCourse,
          backgroundColor: "#4a90e2"
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Lessons" } }
        },
        plugins: {
          title: { display: true, text: "Lessons Completed per Course", font: { size: 16 } }
        }
      }
    });
  }, 200);
}

if (currentUser) {
  showCourseList();
} else {
  showLoginPage();
}
