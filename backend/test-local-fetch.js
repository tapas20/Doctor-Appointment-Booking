import axios from 'axios';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function test() {
  const token = jwt.sign({ id: '6a245790faf93699c3ade9ed' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  try {
    const res = await axios.get('http://[::1]:4000/api/doctor/profile', {
      headers: { dtoken: token }
    });
    console.log("Profile SUCCESS:", res.data);
  } catch (err) {
    console.error("Profile ERROR:", err.response ? err.response.data : err.message);
  }

  try {
    const res2 = await axios.get('http://[::1]:4000/api/doctor/dashboard', {
      headers: { dtoken: token }
    });
    console.log("Dashboard SUCCESS:", res2.data.dashData);
  } catch (err) {
    console.error("Dashboard ERROR:", err.response ? err.response.data : err.message);
  }
}
test();
