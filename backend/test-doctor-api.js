import axios from 'axios';
import mongoose from 'mongoose';

async function test() {
  const backendUrl = "http://127.0.0.1:4000";
  // Assume a known doctor email
  const doctorEmail = "richard@example.com";
  const doctorPassword = "password123";

  try {
    console.log("Logging in...");
    const loginRes = await axios.post(`${backendUrl}/api/auth/login`, {
      email: doctorEmail,
      password: doctorPassword
    });
    const token = loginRes.data.token;
    console.log("Login successful, token:", token.substring(0, 20) + "...");

    console.log("Fetching profile...");
    const profileRes = await axios.get(`${backendUrl}/api/doctor/profile`, {
      headers: { dtoken: token }
    });
    console.log("Profile response:", profileRes.data);

    console.log("Fetching dashboard...");
    const dashRes = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
      headers: { dtoken: token }
    });
    console.log("Dashboard response:", dashRes.data);

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

test();
