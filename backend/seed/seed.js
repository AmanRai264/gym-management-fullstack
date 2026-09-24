require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const MembershipPlan = require("../models/MembershipPlan");
const Attendance = require("../models/Attendance");
const Payment = require("../models/Payment");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Progress = require("../models/Progress");
const GymClass = require("../models/GymClass");
const Equipment = require("../models/Equipment");
const Expense = require("../models/Expense");
const GymSettings = require("../models/GymSettings");
const generateId = require("../utils/idGenerator");

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const firstNames = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Krishna","Ishaan","Rohan","Ananya","Diya","Isha","Aadhya","Myra","Sara","Kiara","Anika","Riya","Aisha","Rahul","Karan","Neha","Priya","Amit","Sanya","Vikram","Pooja","Manish","Divya","Rajesh","Sneha","Arun","Kavya","Nikhil","Meera","Suresh","Tanvi","Deepak","Nisha"];
const lastNames = ["Sharma","Verma","Patel","Gupta","Singh","Kumar","Yadav","Reddy","Nair","Iyer","Mehta","Joshi","Chopra","Malhotra","Kapoor","Rao","Pillai","Menon","Desai","Bhatt"];
const fullName = () => `${rand(firstNames)} ${rand(lastNames)}`;

const seed = async () => {
  await connectDB();
  console.log("Clearing existing demo data...");
  await Promise.all([
    User.deleteMany({}), Member.deleteMany({}), Trainer.deleteMany({}), MembershipPlan.deleteMany({}),
    Attendance.deleteMany({}), Payment.deleteMany({}), WorkoutPlan.deleteMany({}), DietPlan.deleteMany({}),
    Progress.deleteMany({}), GymClass.deleteMany({}), Equipment.deleteMany({}), Expense.deleteMany({}),
    GymSettings.deleteMany({}),
  ]);

  console.log("Creating gym settings...");
  await GymSettings.create({
    gymName: "PowerFit Gym",
    address: "204 Marine Drive, Mumbai, Maharashtra, India",
    phone: "+91 98200 12345",
    email: "info@powerfitgym.demo",
    workingHours: "Mon-Sun, 6:00 AM - 10:00 PM",
    currency: "INR",
    taxPercent: 18,
  });

  console.log("Creating demo login accounts...");
  const demoUsers = [
    { name: "Super Admin", email: "admin@gymdemo.com", password: "Admin@123", role: "super_admin" },
    { name: "Gym Owner", email: "owner@gymdemo.com", password: "Owner@123", role: "gym_owner" },
    { name: "Front Manager", email: "manager@gymdemo.com", password: "Manager@123", role: "manager" },
    { name: "Rohan Trainer", email: "trainer@gymdemo.com", password: "Trainer@123", role: "trainer" },
    { name: "Reception Desk", email: "reception@gymdemo.com", password: "Reception@123", role: "receptionist" },
    { name: "Demo Member", email: "member@gymdemo.com", password: "Member@123", role: "member" },
  ];
  const createdUsers = await User.create(demoUsers);

  console.log("Creating membership plans...");
  const plans = await MembershipPlan.create([
    { name: "Monthly", durationInMonths: 1, price: 1999, description: "Flexible month-to-month access", features: ["Gym floor access", "Locker"], accessType: "Basic", status: "active" },
    { name: "Quarterly", durationInMonths: 3, price: 5499, description: "3-month commitment, better value", features: ["Gym floor access", "Locker", "1 free PT session"], accessType: "Full", status: "active" },
    { name: "Half-Yearly", durationInMonths: 6, price: 9999, description: "6-month plan with group classes", features: ["Gym floor access", "Group classes", "Locker"], accessType: "Full", status: "active" },
    { name: "Yearly", durationInMonths: 12, price: 17999, description: "Best value annual membership", features: ["Full access", "Group classes", "Diet consultation"], accessType: "Premium", status: "active" },
    { name: "Premium", durationInMonths: 12, price: 29999, description: "All-inclusive premium tier", features: ["24x7 access", "Personal trainer", "Diet & recovery plans"], accessType: "Premium", personalTrainerIncluded: true, status: "active" },
    { name: "Personal Training", durationInMonths: 1, price: 6999, description: "1-on-1 personal training add-on", features: ["Dedicated trainer", "Custom workout plan"], accessType: "Premium", personalTrainerIncluded: true, status: "active" },
  ]);

  console.log("Creating trainers...");
  const specializations = ["Strength Training", "Weight Loss", "Yoga", "CrossFit", "Bodybuilding", "Cardio", "Functional Training", "Nutrition"];
  const trainerDocs = [];
  for (let i = 0; i < 10; i++) {
    trainerDocs.push({
      trainerId: generateId("TRN"),
      name: fullName(),
      phone: `+91 9${randInt(100000000, 999999999)}`,
      email: `trainer${i + 1}@powerfitgym.demo`,
      specialization: [rand(specializations), rand(specializations)],
      experience: randInt(1, 15),
      salary: randInt(25000, 65000),
      joiningDate: randDate(new Date(2021, 0, 1), new Date()),
      status: "active",
    });
  }
  const trainers = await Trainer.create(trainerDocs);
  trainers[0].email = "trainer@gymdemo.com";
  trainers[0].name = "Rohan Trainer";
  trainers[0].user = createdUsers[3]._id;
  await trainers[0].save();
  createdUsers[3].trainerProfile = trainers[0]._id;
  await createdUsers[3].save();

  console.log("Creating members...");
  const bloodGroups = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
  const now = new Date();
  const memberDocs = [];
  for (let i = 0; i < 100; i++) {
    const plan = rand(plans);
    const joiningDate = randDate(new Date(now.getFullYear() - 1, now.getMonth(), 1), now);
    const startDate = joiningDate;
    const expiry = new Date(startDate);
    expiry.setMonth(expiry.getMonth() + plan.durationInMonths);
    const isExpired = expiry < now && Math.random() < 0.3;
    const height = randInt(150, 195);
    const weight = randInt(50, 100);
    memberDocs.push({
      memberId: generateId("MEM"),
      fullName: fullName(),
      dob: randDate(new Date(1975, 0, 1), new Date(2006, 0, 1)),
      gender: rand(["Male", "Female"]),
      phone: `+91 9${randInt(100000000, 999999999)}`,
      email: `member${i + 1}@example.demo`,
      address: `${randInt(1, 400)}, ${rand(["MG Road","Linking Road","SV Road","Station Road","Park Street"])}, Mumbai`,
      emergencyContact: `+91 9${randInt(100000000, 999999999)}`,
      joiningDate,
      membershipPlan: plan._id,
      membershipStartDate: startDate,
      membershipExpiryDate: expiry,
      assignedTrainer: rand(trainers)._id,
      bloodGroup: rand(bloodGroups),
      height,
      weight,
      bmi: +(weight / ((height / 100) ** 2)).toFixed(1),
      medicalNotes: Math.random() < 0.15 ? rand(["Mild asthma", "Previous knee injury", "None"]) : "",
      status: isExpired ? "expired" : rand(["active", "active", "active", "frozen"]),
    });
  }
  const members = await Member.create(memberDocs);
  members[0].email = "member@gymdemo.com";
  members[0].fullName = "Demo Member";
  members[0].user = createdUsers[5]._id;
  members[0].status = "active";
  await members[0].save();
  createdUsers[5].memberProfile = members[0]._id;
  await createdUsers[5].save();

  console.log("Creating attendance records...");
  const attendanceDocs = [];
  for (let i = 0; i < 500; i++) {
    const member = rand(members);
    const date = randDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now);
    const checkIn = new Date(date);
    checkIn.setHours(randInt(6, 20), randInt(0, 59));
    const checkOut = new Date(checkIn);
    checkOut.setMinutes(checkOut.getMinutes() + randInt(30, 120));
    attendanceDocs.push({
      member: member._id,
      date,
      checkInTime: checkIn,
      checkOutTime: Math.random() < 0.85 ? checkOut : null,
      method: rand(["QR", "RFID", "Manual"]),
    });
  }
  await Attendance.create(attendanceDocs);

  console.log("Creating payment records...");
  const paymentDocs = [];
  for (let i = 0; i < 100; i++) {
    const member = rand(members);
    const plan = rand(plans);
    const amount = plan.price;
    const discount = Math.random() < 0.2 ? Math.round(amount * 0.1) : 0;
    const tax = Math.round((amount - discount) * 0.18);
    paymentDocs.push({
      member: member._id,
      membershipPlan: plan._id,
      amount,
      discount,
      tax,
      finalAmount: amount - discount + tax,
      method: rand(["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"]),
      status: rand(["paid", "paid", "paid", "pending"]),
      invoiceNumber: generateId("INV"),
      date: randDate(new Date(now.getFullYear(), now.getMonth() - 11, 1), now),
    });
  }
  await Payment.create(paymentDocs);

  console.log("Creating workout plans...");
  const categories = ["Weight Loss", "Muscle Gain", "Strength", "Beginner", "Intermediate", "Advanced", "Cardio", "Functional Training"];
  const exercisePool = [
    { name: "Barbell Squat", muscleGroup: "Legs" }, { name: "Bench Press", muscleGroup: "Chest" },
    { name: "Deadlift", muscleGroup: "Back" }, { name: "Pull Up", muscleGroup: "Back" },
    { name: "Shoulder Press", muscleGroup: "Shoulders" }, { name: "Plank", muscleGroup: "Core" },
    { name: "Treadmill Run", muscleGroup: "Cardio" }, { name: "Lunges", muscleGroup: "Legs" },
  ];
  const workoutDocs = [];
  for (let i = 0; i < 20; i++) {
    const member = rand(members);
    workoutDocs.push({
      title: `${rand(categories)} Plan - Week ${randInt(1, 8)}`,
      category: rand(categories),
      member: member._id,
      trainer: rand(trainers)._id,
      exercises: Array.from({ length: randInt(4, 6) }, () => {
        const ex = rand(exercisePool);
        return { ...ex, sets: randInt(3, 5), reps: `${randInt(8, 15)}`, weight: `${randInt(10, 80)}kg`, restTime: `${randInt(30, 90)}s`, instructions: "Maintain proper form throughout." };
      }),
      status: "active",
    });
  }
  await WorkoutPlan.create(workoutDocs);

  console.log("Creating diet plans...");
  const dietDocs = [];
  for (let i = 0; i < 20; i++) {
    const member = rand(members);
    dietDocs.push({
      planName: `${rand(["Fat Loss", "Muscle Building", "Maintenance", "Athletic Performance"])} Diet`,
      member: member._id,
      calories: randInt(1600, 3000),
      protein: randInt(80, 200),
      carbs: randInt(100, 300),
      fat: randInt(40, 100),
      meals: [
        { type: "Breakfast", time: "7:30 AM", items: ["Oats", "Eggs", "Fruit"] },
        { type: "Mid-Morning", time: "10:30 AM", items: ["Protein shake"] },
        { type: "Lunch", time: "1:00 PM", items: ["Rice", "Dal", "Vegetables", "Chicken/Paneer"] },
        { type: "Evening", time: "5:00 PM", items: ["Nuts", "Green tea"] },
        { type: "Dinner", time: "8:00 PM", items: ["Roti", "Vegetables", "Salad"] },
      ],
      status: "active",
    });
  }
  await DietPlan.create(dietDocs);

  console.log("Creating progress records...");
  const progressDocs = [];
  for (let i = 0; i < 50; i++) {
    const member = rand(members);
    const weight = randInt(55, 100);
    const height = member.height || randInt(150, 195);
    progressDocs.push({
      member: member._id,
      date: randDate(new Date(now.getFullYear(), now.getMonth() - 5, 1), now),
      weight,
      height,
      bmi: +(weight / ((height / 100) ** 2)).toFixed(1),
      bodyFatPercent: randInt(10, 30),
      chest: randInt(85, 115),
      waist: randInt(70, 100),
      arms: randInt(28, 42),
      thighs: randInt(45, 65),
      muscleMass: randInt(25, 45),
    });
  }
  await Progress.create(progressDocs);

  console.log("Creating classes...");
  const classTypes = ["Yoga", "Zumba", "CrossFit", "HIIT", "Strength Training", "Cardio", "Personal Training"];
  const classDocs = [];
  for (let i = 0; i < 20; i++) {
    const date = randDate(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 15));
    classDocs.push({
      name: `${rand(classTypes)} Session`,
      type: rand(classTypes),
      trainer: rand(trainers)._id,
      capacity: randInt(10, 30),
      date,
      startTime: `${randInt(6, 19)}:00`,
      endTime: `${randInt(6, 19)}:45`,
      status: date < now ? "completed" : "scheduled",
    });
  }
  await GymClass.create(classDocs);

  console.log("Creating equipment...");
  const equipmentNames = ["Treadmill", "Elliptical Trainer", "Rowing Machine", "Smith Machine", "Power Rack", "Leg Press", "Lat Pulldown", "Dumbbell Set", "Barbell Set", "Cable Crossover", "Spin Bike", "Bench Press Station"];
  const equipmentDocs = [];
  for (let i = 0; i < 30; i++) {
    const purchaseDate = randDate(new Date(2019, 0, 1), now);
    const nextMaintenance = new Date(now);
    nextMaintenance.setDate(nextMaintenance.getDate() + randInt(-10, 60));
    equipmentDocs.push({
      name: `${rand(equipmentNames)} #${i + 1}`,
      category: rand(["Cardio", "Strength", "Free Weights", "Machines"]),
      brand: rand(["Technogym", "Life Fitness", "Cybex", "Rogue", "Matrix"]),
      purchaseDate,
      purchasePrice: randInt(15000, 250000),
      warrantyUntil: new Date(purchaseDate.getFullYear() + 2, purchaseDate.getMonth(), purchaseDate.getDate()),
      location: rand(["Ground Floor", "First Floor", "Cardio Zone", "Strength Zone"]),
      condition: rand(["Excellent", "Good", "Fair"]),
      lastMaintenanceDate: randDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now),
      nextMaintenanceDate: nextMaintenance,
      status: nextMaintenance < now ? "Maintenance Required" : "Working",
    });
  }
  await Equipment.create(equipmentDocs);

  console.log("Creating expenses...");
  const expenseCategories = ["Rent", "Electricity", "Equipment", "Staff Salary", "Maintenance", "Marketing", "Software", "Other"];
  const expenseDocs = [];
  for (let i = 0; i < 50; i++) {
    expenseDocs.push({
      category: rand(expenseCategories),
      description: `${rand(expenseCategories)} expense - ${rand(["monthly", "one-time", "recurring"])}`,
      amount: randInt(2000, 80000),
      date: randDate(new Date(now.getFullYear(), now.getMonth() - 11, 1), now),
    });
  }
  await Expense.create(expenseDocs);

  console.log("\n✅ Seed complete!");
  console.log("\nDemo login credentials:");
  demoUsers.forEach((u) => console.log(`  ${u.role.padEnd(14)} ${u.email.padEnd(28)} ${u.password}`));
};

if (require.main === module) {
  seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}

module.exports = { seed };
