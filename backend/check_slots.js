import mongoose from "mongoose";
mongoose.connect("mongodb+srv://tapasjyoti8327_db_user:wttTFxnkoSMJfeAL@prescripto.ngpsbby.mongodb.net/prescripto");
const doctorSchema = new mongoose.Schema({ name: String, slots_booked: Object }, { strict: false });
const Doctor = mongoose.model("doctor", doctorSchema);
async function run() {
  const doc = await Doctor.findOne({name: "Dr. Tapas"});
  console.log(JSON.stringify(doc.slots_booked, null, 2));
  process.exit(0);
}
run();
