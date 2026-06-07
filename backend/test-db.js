import mongoose from 'mongoose';
import 'dotenv/config';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  const doctors = await mongoose.connection.db.collection('doctors').find({}).toArray();
  
  console.log("USERS:");
  users.forEach(u => console.log(u.email, u.role, u._id));
  
  console.log("\nDOCTORS:");
  doctors.forEach(d => console.log(d.email, "doctor", d._id));
  
  process.exit(0);
}
check();
