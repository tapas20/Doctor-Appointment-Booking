import axios from 'axios';
async function test() {
  try {
    const login = await axios.post("http://127.0.0.1:4000/api/auth/login", {
      email: "richard@example.com",
      password: "password123"
    });
    console.log("Token:", login.data.token);
    const profile = await axios.get("http://127.0.0.1:4000/api/doctor/profile", {
      headers: { dtoken: login.data.token }
    });
    console.log("Profile:", profile.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
