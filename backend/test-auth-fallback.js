import mongoose from 'mongoose';
import 'dotenv/config';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const decodedId = '6a245790faf93699c3ade9ed'; // The user _id
  let finalDocId = decodedId;
  
  try {
    const userDoc = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(decodedId) });
    console.log("userDoc:", userDoc);
    if (userDoc && userDoc.role === "doctor") {
      const actualDoctor = await mongoose.connection.db.collection('doctors').findOne({ email: userDoc.email });
      console.log("actualDoctor:", actualDoctor);
      if (actualDoctor) {
        finalDocId = actualDoctor._id.toString();
      }
    }
  } catch (e) {
    console.error(e);
  }
  
  console.log("finalDocId:", finalDocId);
  process.exit(0);
}
check();
