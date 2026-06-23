import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@medistore.com" },
    update: {},
    create: { name: "Admin User", email: "admin@medistore.com", password: adminPassword, role: "ADMIN" },
  });

  const sellerPassword = await bcrypt.hash("Seller@123", 10);
  const seller = await prisma.user.upsert({
    where: { email: "seller@medistore.com" },
    update: {},
    create: { name: "MediPharm Store", email: "seller@medistore.com", password: sellerPassword, role: "SELLER", phone: "+1234567890", address: "123 Pharmacy St" },
  });

  const customerPassword = await bcrypt.hash("Customer@123", 10);
  await prisma.user.upsert({
    where: { email: "customer@medistore.com" },
    update: {},
    create: { name: "John Doe", email: "customer@medistore.com", password: customerPassword, role: "CUSTOMER" },
  });

  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: "Pain Relief" }, update: {}, create: { name: "Pain Relief" } }),
    prisma.category.upsert({ where: { name: "Antibiotics" }, update: {}, create: { name: "Antibiotics" } }),
    prisma.category.upsert({ where: { name: "Vitamins & Supplements" }, update: {}, create: { name: "Vitamins & Supplements" } }),
    prisma.category.upsert({ where: { name: "Allergy & Sinus" }, update: {}, create: { name: "Allergy & Sinus" } }),
    prisma.category.upsert({ where: { name: "Digestive Health" }, update: {}, create: { name: "Digestive Health" } }),
    prisma.category.upsert({ where: { name: "Cold & Flu" }, update: {}, create: { name: "Cold & Flu" } }),
    prisma.category.upsert({ where: { name: "Skin Care" }, update: {}, create: { name: "Skin Care" } }),
    prisma.category.upsert({ where: { name: "Eye Care" }, update: {}, create: { name: "Eye Care" } }),
  ]);

  const medicines = [
    { name: "Paracetamol 500mg", description: "Effective pain reliever and fever reducer.", price: 4.99, stock: 200, manufacturer: "Generic Pharma", dosage: "1-2 tablets every 4-6 hours", categoryId: cats[0].id },
    { name: "Ibuprofen 400mg", description: "Anti-inflammatory drug for pain and fever.", price: 6.99, stock: 150, manufacturer: "MediCorp", dosage: "1 tablet 3 times daily with food", categoryId: cats[0].id },
    { name: "Aspirin 300mg", description: "Pain reliever and anti-inflammatory.", price: 3.49, stock: 180, manufacturer: "PharmaCo", dosage: "1-3 tablets every 4 hours", categoryId: cats[0].id },
    { name: "Amoxicillin 500mg", description: "Broad-spectrum antibiotic for bacterial infections.", price: 12.99, stock: 80, manufacturer: "BioMed Labs", dosage: "1 capsule 3 times daily", categoryId: cats[1].id },
    { name: "Vitamin C 1000mg", description: "High-dose Vitamin C to boost immune system.", price: 8.99, stock: 300, manufacturer: "NutriLife", dosage: "1 tablet daily", categoryId: cats[2].id },
    { name: "Vitamin D3 2000IU", description: "Essential vitamin for bone health.", price: 9.99, stock: 250, manufacturer: "SunHealth", dosage: "1 capsule daily with meal", categoryId: cats[2].id },
    { name: "Loratadine 10mg", description: "Non-drowsy antihistamine for allergy relief.", price: 7.49, stock: 120, manufacturer: "AllerCare", dosage: "1 tablet daily", categoryId: cats[3].id },
    { name: "Omeprazole 20mg", description: "Proton pump inhibitor for acid reflux.", price: 11.99, stock: 90, manufacturer: "GastroPharma", dosage: "1 capsule daily before breakfast", categoryId: cats[4].id },
    { name: "DayQuil Cold & Flu", description: "Multi-symptom cold and flu relief.", price: 9.49, stock: 100, manufacturer: "Vicks", dosage: "2 capsules every 4 hours", categoryId: cats[5].id },
    { name: "Hydrocortisone Cream 1%", description: "Topical cream for itch and rashes.", price: 5.99, stock: 70, manufacturer: "DermaCare", dosage: "Apply 2-4 times daily", categoryId: cats[6].id },
    { name: "Artificial Tears Eye Drops", description: "Lubricating drops for dry eyes.", price: 6.49, stock: 110, manufacturer: "EyeComfort", dosage: "1-2 drops as needed", categoryId: cats[7].id },
    { name: "Zinc 50mg", description: "Essential mineral for immune health.", price: 7.99, stock: 200, manufacturer: "NutriLife", dosage: "1 tablet daily with food", categoryId: cats[2].id },
  ];

  let created = 0;
  for (const med of medicines) {
    const existing = await prisma.medicine.findFirst({ where: { name: med.name } });
    if (!existing) {
      await prisma.medicine.create({ data: { ...med, sellerId: seller.id } });
      created++;
    }
  }

  console.log("✅ Seed complete!");
  console.log(`   Users: admin, seller, customer`);
  console.log(`   Categories: ${cats.length}`);
  console.log(`   Medicines created: ${created}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
