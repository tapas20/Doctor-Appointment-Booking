import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import doctorModel from "./models/doctorModel.js";
import userModel from "./models/userModel.js";

const doctorsData = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    speciality: "General physician",
    degree: "MBBS, MD",
    experience: "10 Years",
    about: "Dr. Rajesh Kumar is a senior General Physician with over a decade of experience in treating acute and chronic illnesses. He is known for his patient-centric approach and accurate diagnoses.",
    fees: 500,
    address: { line1: "123, Apollo Clinic", line2: "Koramangala, Bengaluru" },
    gender: "Male"
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@example.com",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    speciality: "General physician",
    degree: "MBBS, DNB",
    experience: "7 Years",
    about: "Dr. Priya Sharma is dedicated to providing comprehensive healthcare for families. She has a strong focus on preventive medicine and wellness.",
    fees: 400,
    address: { line1: "45, Wellness Center", line2: "Andheri West, Mumbai" },
    gender: "Female"
  },
  {
    name: "Dr. Sneha Reddy",
    email: "sneha.reddy@example.com",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    speciality: "Gynecologist",
    degree: "MBBS, MS (OBG)",
    experience: "12 Years",
    about: "Dr. Sneha Reddy is a highly skilled Gynecologist specializing in high-risk pregnancies, infertility treatments, and minimally invasive surgeries.",
    fees: 800,
    address: { line1: "Care Women's Hospital", line2: "Jubilee Hills, Hyderabad" },
    gender: "Female"
  },
  {
    name: "Dr. Anjali Desai",
    email: "anjali.desai@example.com",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    speciality: "Gynecologist",
    degree: "MBBS, DGO",
    experience: "8 Years",
    about: "Dr. Anjali Desai provides compassionate care for women at all stages of life, from adolescence through menopause.",
    fees: 600,
    address: { line1: "Shakti Clinic", line2: "Navrangpura, Ahmedabad" },
    gender: "Female"
  },
  {
    name: "Dr. Vikram Singh",
    email: "vikram.singh@example.com",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    speciality: "Dermatologist",
    degree: "MBBS, MD (Dermatology)",
    experience: "15 Years",
    about: "Dr. Vikram Singh is a renowned Dermatologist with expertise in cosmetic dermatology, acne treatment, and skin rejuvenation.",
    fees: 1000,
    address: { line1: "SkinCare Elite", line2: "Vasant Kunj, New Delhi" },
    gender: "Male"
  },
  {
    name: "Dr. Neha Gupta",
    email: "neha.gupta@example.com",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    speciality: "Dermatologist",
    degree: "MBBS, DDVL",
    experience: "6 Years",
    about: "Dr. Neha Gupta offers advanced treatments for various skin, hair, and nail disorders. She is passionate about restoring skin health.",
    fees: 700,
    address: { line1: "Glow Skin Clinic", line2: "Salt Lake City, Kolkata" },
    gender: "Female"
  },
  {
    name: "Dr. Rohan Mehta",
    email: "rohan.mehta@example.com",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    speciality: "Pediatricians",
    degree: "MBBS, MD (Pediatrics)",
    experience: "9 Years",
    about: "Dr. Rohan Mehta is a friendly and experienced Pediatrician. He specializes in newborn care, vaccinations, and childhood development.",
    fees: 600,
    address: { line1: "Little Stars Hospital", line2: "Baner, Pune" },
    gender: "Male"
  },
  {
    name: "Dr. Kavita Iyer",
    email: "kavita.iyer@example.com",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    speciality: "Pediatricians",
    degree: "MBBS, DCH",
    experience: "11 Years",
    about: "Dr. Kavita Iyer has a gentle approach to treating children. She is highly recommended by parents for her thorough examinations.",
    fees: 650,
    address: { line1: "Kids Care Clinic", line2: "Adyar, Chennai" },
    gender: "Female"
  },
  {
    name: "Dr. Sanjay Joshi",
    email: "sanjay.joshi@example.com",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    speciality: "Neurologist",
    degree: "MBBS, MD, DM (Neurology)",
    experience: "18 Years",
    about: "Dr. Sanjay Joshi is a top-tier Neurologist specializing in stroke management, epilepsy, and movement disorders.",
    fees: 1500,
    address: { line1: "Neuro Brain Center", line2: "Indiranagar, Bengaluru" },
    gender: "Male"
  },
  {
    name: "Dr. Meera Nambiar",
    email: "meera.nambiar@example.com",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
    speciality: "Neurologist",
    degree: "MBBS, DNB (Neurology)",
    experience: "14 Years",
    about: "Dr. Meera Nambiar provides exceptional care for complex neurological conditions, utilizing the latest diagnostic technologies.",
    fees: 1200,
    address: { line1: "Nambiar Neuro Clinic", line2: "Kochi, Kerala" },
    gender: "Female"
  },
  {
    name: "Dr. Arun Verma",
    email: "arun.verma@example.com",
    image: "https://randomuser.me/api/portraits/men/66.jpg",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD, DM (Gastro)",
    experience: "16 Years",
    about: "Dr. Arun Verma is an expert Gastroenterologist highly skilled in endoscopies, liver diseases, and functional bowel disorders.",
    fees: 1100,
    address: { line1: "Digestive Health Institute", line2: "Gomti Nagar, Lucknow" },
    gender: "Male"
  },
  {
    name: "Dr. Pooja Menon",
    email: "pooja.menon@example.com",
    image: "https://randomuser.me/api/portraits/women/76.jpg",
    speciality: "Gastroenterologist",
    degree: "MBBS, DNB (Gastroenterology)",
    experience: "10 Years",
    about: "Dr. Pooja Menon focuses on digestive health and nutritional well-being, providing comprehensive care for gastrointestinal issues.",
    fees: 900,
    address: { line1: "Menon Gastro Care", line2: "Thiruvananthapuram, Kerala" },
    gender: "Female"
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully.");

    console.log("Hashing default password...");
    const defaultPassword = "Password@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let seededCount = 0;

    for (const doc of doctorsData) {
      // Check if doctor already exists
      const exists = await doctorModel.findOne({ email: doc.email });
      if (!exists) {
        // Create Doctor entry
        const newDoctor = new doctorModel({
          name: doc.name,
          email: doc.email,
          password: hashedPassword,
          image: doc.image,
          speciality: doc.speciality,
          degree: doc.degree,
          experience: doc.experience,
          about: doc.about,
          fees: doc.fees,
          address: doc.address,
          date: Date.now(),
          available: true,
          averageRating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1), // Random rating between 4.2 and 5.0
          reviewCount: Math.floor(Math.random() * 50) + 10, // Random reviews between 10 and 60
        });
        await newDoctor.save();

        // Create User entry for the doctor to enable unified login
        const userExists = await userModel.findOne({ email: doc.email });
        if (!userExists) {
          const newUser = new userModel({
            name: doc.name,
            email: doc.email,
            password: hashedPassword,
            role: "doctor",
            image: doc.image,
            gender: doc.gender,
          });
          await newUser.save();
        }

        console.log(`Seeded: ${doc.name} (${doc.speciality})`);
        seededCount++;
      } else {
        console.log(`Skipped: ${doc.name} (Email already exists)`);
      }
    }

    console.log(`\nSeeding completed! Successfully added ${seededCount} new doctors.`);
    console.log(`Default login password for all seeded doctors is: ${defaultPassword}`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
}

seedDatabase();
