import mongoose from 'mongoose';
import 'dotenv/config';

const appointmentSchema = new mongoose.Schema({ docId: String }, { strict: false });
const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const appts = await appointmentModel.find({ docId: '6a245ab1453bf3435c9d2d30' });
  console.log('Appts with actual doctor._id:', appts.length);
  const apptsUser = await appointmentModel.find({ docId: '6a245790faf93699c3ade9ed' });
  console.log('Appts with user._id:', apptsUser.length);
  process.exit(0);
}
check();
