const slider = document.getElementById('slider');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

function showRegister(){
  slider.style.transform = 'translateX(-100%)';
  loginBtn.classList.remove('active');
  registerBtn.classList.add('active');
}

function showLogin(){
  slider.style.transform = 'translateX(0%)';
  registerBtn.classList.remove('active');
  loginBtn.classList.add('active');
}

loginBtn.addEventListener("click", showLogin);
registerBtn.addEventListener("click", showRegister);

// ==========================
// LOGIN FUNCTION
// ==========================
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  fetch("http://localhost:6500/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("Login สำเร็จ");
    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  });
}

// ==========================
// REGISTER FUNCTION
// ==========================
function register() {
  const studentId = document.getElementById("studentId").value;
  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  fetch("http://localhost:6500/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ studentId, name, surname, email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("สมัครสมาชิกสำเร็จ");
      showLogin();
    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  });
}