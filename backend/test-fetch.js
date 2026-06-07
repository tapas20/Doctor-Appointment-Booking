import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function test() {
  const token = jwt.sign({ id: '6a245790faf93699c3ade9ed' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  try {
    const res = await fetch('http://localhost:4000/api/doctor/profile', {
      headers: { dtoken: token }
    });
    const data = await res.json();
    console.log("Profile SUCCESS:", data);
  } catch (err) {
    console.error("Profile ERROR:", err.message);
  }

  try {
    const res2 = await fetch('http://localhost:4000/api/doctor/dashboard', {
      headers: { dtoken: token }
    });
    const data2 = await res2.json();
    console.log("Dashboard SUCCESS:", data2.dashData);
  } catch (err) {
    console.error("Dashboard ERROR:", err.message);
  }
}
test();
