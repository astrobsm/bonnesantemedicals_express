"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcryptjs_1.default.hash('chibuike_douglas', 12);
    const adminUser = await prisma.user.upsert({
        where: { username: 'blakvelvet' },
        update: {},
        create: {
            username: 'blakvelvet',
            hashedPassword,
            role: 'Admin',
            status: 'active',
            profileCompleted: true,
            fullName: 'Blake Velvet',
            email: 'admin@astrobsm.com'
        }
    });
    console.log('✅ Admin user created:', adminUser);
    const warehouse1 = await prisma.warehouse.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Main Warehouse',
            location: 'Lagos, Nigeria',
            manager: 'Blake Velvet',
            managerPhone: '+234-800-000-0001'
        }
    });
    const warehouse2 = await prisma.warehouse.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Secondary Warehouse',
            location: 'Abuja, Nigeria',
            manager: 'John Manager',
            managerPhone: '+234-800-000-0002'
        }
    });
    console.log('✅ Warehouses created:', { warehouse1, warehouse2 });
    const product1 = await prisma.product.upsert({
        where: { productId: 'PROD-001' },
        update: {},
        create: {
            name: 'Paracetamol 500mg',
            productId: 'PROD-001',
            description: 'Pain relief medication',
            unitOfMeasure: 'tablets',
            unitPrice: 0.50,
            reorderPoint: 100,
            openingStockQuantity: 1000,
            averageProductionTime: 2.5,
            status: 'Green'
        }
    });
    const product2 = await prisma.product.upsert({
        where: { productId: 'PROD-002' },
        update: {},
        create: {
            name: 'Amoxicillin 250mg',
            productId: 'PROD-002',
            description: 'Antibiotic medication',
            unitOfMeasure: 'capsules',
            unitPrice: 1.20,
            reorderPoint: 50,
            openingStockQuantity: 500,
            averageProductionTime: 3.0,
            status: 'Green'
        }
    });
    console.log('✅ Products created:', { product1, product2 });
    const rawMaterial1 = await prisma.rawMaterial.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Paracetamol API',
            description: 'Active pharmaceutical ingredient for paracetamol',
            unitOfMeasure: 'kg',
            reorderPoint: 10
        }
    });
    const rawMaterial2 = await prisma.rawMaterial.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Lactose Monohydrate',
            description: 'Excipient for tablet formulation',
            unitOfMeasure: 'kg',
            reorderPoint: 20
        }
    });
    console.log('✅ Raw materials created:', { rawMaterial1, rawMaterial2 });
    const staff1 = await prisma.staff.upsert({
        where: { staffId: 'STAFF-001' },
        update: {},
        create: {
            name: 'John Production',
            staffId: 'STAFF-001',
            phone: '+234-800-111-0001',
            role: 'Production Manager',
            department: 'Production',
            hourlyRate: 15.00,
            appointmentType: 'Full-time'
        }
    });
    const staff2 = await prisma.staff.upsert({
        where: { staffId: 'STAFF-002' },
        update: {},
        create: {
            name: 'Jane Quality',
            staffId: 'STAFF-002',
            phone: '+234-800-111-0002',
            role: 'Quality Control',
            department: 'QC',
            hourlyRate: 12.00,
            appointmentType: 'Full-time'
        }
    });
    console.log('✅ Staff created:', { staff1, staff2 });
    const customer1 = await prisma.customer.upsert({
        where: { customerId: 'CUST-001' },
        update: {},
        create: {
            name: 'ABC Pharmacy',
            customerId: 'CUST-001',
            phone: '+234-800-222-0001',
            address: '123 Lagos Street, Lagos',
            company: 'ABC Pharmacy Ltd'
        }
    });
    console.log('✅ Customer created:', customer1);
    const supplier1 = await prisma.supplier.upsert({
        where: { supplierId: 'SUP-001' },
        update: {},
        create: {
            name: 'XYZ Chemical Supplies',
            supplierId: 'SUP-001',
            phone: '+234-800-333-0001',
            address: '456 Industrial Area, Lagos',
            country: 'Nigeria',
            state: 'Lagos'
        }
    });
    console.log('✅ Supplier created:', supplier1);
    console.log('🎉 Database seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map