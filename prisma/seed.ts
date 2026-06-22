import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@medistore.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@medistore.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Seller user
  const sellerPassword = await bcrypt.hash("Seller@123", 10);
  const seller = await prisma.user.upsert({
    where: { email: "seller@medistore.com" },
    update: {},
    create: {
      name: "MediPharm Store",
      email: "seller@medistore.com",
      password: sellerPassword,
      role: "SELLER",
      phone: "+1234567890",
      address: "123 Pharmacy St, Medical City",
    },
  });

  // Customer user
  const customerPassword = await bcrypt.hash("Customer@123", 10);
  await prisma.user.upsert({
    where: { email: "customer@medistore.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@medistore.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Pain Relief" }, update: {}, create: { name: "Pain Relief" } }),
    prisma.category.upsert({ where: { name: "Antibiotics" }, update: {}, create: { name: "Antibiotics" } }),
    prisma.category.upsert({ where: { name: "Vitamins & Supplements" }, update: {}, create: { name: "Vitamins & Supplements" } }),
    prisma.category.upsert({ where: { name: "Allergy & Sinus" }, update: {}, create: { name: "Allergy & Sinus" } }),
    prisma.category.upsert({ where: { name: "Digestive Health" }, update: {}, create: { name: "Digestive Health" } }),
    prisma.category.upsert({ where: { name: "Cold & Flu" }, update: {}, create: { name: "Cold & Flu" } }),
    prisma.category.upsert({ where: { name: "Skin Care" }, update: {}, create: { name: "Skin Care" } }),
    prisma.category.upsert({ where: { name: "Eye Care" }, update: {}, create: { name: "Eye Care" } }),
  ]);

  // Sample medicines
  const medicines = [
    { name: "Paracetamol 500mg", description: "Effective pain reliever and fever reducer. Safe for adults and children over 12.", price: 4.99, stock: 200, manufacturer: "Generic Pharma", dosage: "1-2 tablets every 4-6 hours", categoryId: categories[0].id, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300" },
    { name: "Ibuprofen 400mg", description: "Non-steroidal anti-inflammatory drug for pain, fever, and inflammation.", price: 6.99, stock: 150, manufacturer: "MediCorp", dosage: "1 tablet 3 times daily with food", categoryId: categories[0].id, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300" },
    { name: "Aspirin 300mg", description: "Widely used pain reliever, fever reducer, and anti-inflammatory.", price: 3.49, stock: 180, manufacturer: "PharmaCo", dosage: "1-3 tablets every 4 hours", categoryId: categories[0].id, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300" },
    { name: "Amoxicillin 500mg", description: "Broad-spectrum antibiotic for bacterial infections.", price: 12.99, stock: 80, manufacturer: "BioMed Labs", dosage: "1 capsule 3 times daily", categoryId: categories[1].id, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300" },
    { name: "Vitamin C 1000mg", description: "High-dose Vitamin C supplement to boost immune system and fight oxidative stress.", price: 8.99, stock: 300, manufacturer: "NutriLife", dosage: "1 tablet daily", categoryId: categories[2].id, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300" },
    { name: "Vitamin D3 2000IU", description: "Essential vitamin for bone health, immune function and mood regulation.", price: 9.99, stock: 250, manufacturer: "SunHealth", dosage: "1 capsule daily with meal", categoryId: categories[2].id, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300" },
    { name: "Loratadine 10mg", description: "Non-drowsy antihistamine for seasonal and year-round allergy relief.", price: 7.49, stock: 120, manufacturer: "AllerCare", dosage: "1 tablet daily", categoryId: categories[3].id, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300" },
    { name: "Omeprazole 20mg", description: "Proton pump inhibitor for heartburn, acid reflux, and GERD treatment.", price: 11.99, stock: 90, manufacturer: "GastroPharma", dosage: "1 capsule daily before breakfast", categoryId: categories[4].id, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300" },
    { name: "DayQuil Cold & Flu", description: "Multi-symptom cold and flu relief including fever, cough, and congestion.", price: 9.49, stock: 100, manufacturer: "Vicks", dosage: "2 capsules every 4 hours", categoryId: categories[5].id, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300" },
    { name: "Hydrocortisone Cream 1%", description: "Topical cream for itch relief, minor skin irritations, and rashes.", price: 5.99, stock: 70, manufacturer: "DermaCare", dosage: "Apply thin layer 2-4 times daily", categoryId: categories[6].id, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300" },
    { name: "Artificial Tears Eye Drops", description: "Lubricating eye drops to relieve dry, irritated eyes.", price: 6.49, stock: 110, manufacturer: "EyeComfort", dosage: "1-2 drops in each eye as needed", categoryId: categories[7].id, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300" },
    { name: "Zinc 50mg", description: "Essential mineral supplement to support immune health and wound healing.", price: 7.99, stock: 200, manufacturer: "NutriLife", dosage: "1 tablet daily with food", categoryId: categories[2].id, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300" },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({ data: { ...med, sellerId: seller.id } });
  }

  console.log("✅ Seed completed!");
  console.log("Admin credentials: admin@medistore.com / Admin@123");
  console.log("Seller credentials: seller@medistore.com / Seller@123");
  console.log("Customer credentials: customer@medistore.com / Customer@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
