import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('vAbhi2678', 10)

  console.log('🌱 Starting seed...')

  // Create a company
  const company = await prisma.company.upsert({
    where: { id: 'test-company-id' },
    update: {},
    create: {
      id: 'test-company-id',
      name: 'Test Company',
    },
  })
  console.log('✅ Company created:', company.name)

  // Create Admin User
  const adminEmployee = await prisma.employee.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'Admin',
      department: 'Management',
      employeeType: 'EMPLOYEE',
      status: 'ACTIVE',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password,
      name: 'Admin User',
      userType: 'ADMIN',
      companyId: company.id,
      employeeId: adminEmployee.id,
    },
  })
  console.log('✅ Admin user created: admin@test.com')

  // Create Developer 1
  const dev1 = await prisma.employee.upsert({
    where: { email: 'dev1@test.com' },
    update: {},
    create: {
      email: 'dev1@test.com',
      name: 'John Developer',
      role: 'Senior Developer',
      department: 'Engineering',
      employeeType: 'EMPLOYEE',
      status: 'ACTIVE',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'dev1@test.com' },
    update: {},
    create: {
      email: 'dev1@test.com',
      password,
      name: 'John Developer',
      userType: 'EMPLOYEE',
      companyId: company.id,
      employeeId: dev1.id,
    },
  })
  console.log('✅ Developer 1 created: dev1@test.com')

  // Create Developer 2
  const dev2 = await prisma.employee.upsert({
    where: { email: 'dev2@test.com' },
    update: {},
    create: {
      email: 'dev2@test.com',
      name: 'Sarah Engineer',
      role: 'Full Stack Developer',
      department: 'Engineering',
      employeeType: 'EMPLOYEE',
      status: 'ACTIVE',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'dev2@test.com' },
    update: {},
    create: {
      email: 'dev2@test.com',
      password,
      name: 'Sarah Engineer',
      userType: 'EMPLOYEE',
      companyId: company.id,
      employeeId: dev2.id,
    },
  })
  console.log('✅ Developer 2 created: dev2@test.com')

  // Create Developer 3
  const dev3 = await prisma.employee.upsert({
    where: { email: 'dev3@test.com' },
    update: {},
    create: {
      email: 'dev3@test.com',
      name: 'Mike Frontend',
      role: 'Frontend Developer',
      department: 'Engineering',
      employeeType: 'EMPLOYEE',
      status: 'ACTIVE',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'dev3@test.com' },
    update: {},
    create: {
      email: 'dev3@test.com',
      password,
      name: 'Mike Frontend',
      userType: 'EMPLOYEE',
      companyId: company.id,
      employeeId: dev3.id,
    },
  })
  console.log('✅ Developer 3 created: dev3@test.com')

  // Create Designer
  const designer = await prisma.employee.upsert({
    where: { email: 'designer@test.com' },
    update: {},
    create: {
      email: 'designer@test.com',
      name: 'Lisa Designer',
      role: 'UI/UX Designer',
      department: 'Design',
      employeeType: 'EMPLOYEE',
      status: 'ACTIVE',
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'designer@test.com' },
    update: {},
    create: {
      email: 'designer@test.com',
      password,
      name: 'Lisa Designer',
      userType: 'EMPLOYEE',
      companyId: company.id,
      employeeId: designer.id,
    },
  })
  console.log('✅ Designer created: designer@test.com')

  // Create Client
  const client = await prisma.client.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      name: 'Client User',
      password,
      companyId: company.id,
    },
  })
  console.log('✅ Client created: client@test.com')

  // Create a default bank account
  await prisma.account.upsert({
    where: { id: 'test-account-id' },
    update: {},
    create: {
      id: 'test-account-id',
      name: 'Main Bank Account',
      type: 'Bank Account',
      balance: 100000,
      companyId: company.id,
    },
  })
  console.log('✅ Bank account created')

  // Create a test project
  const project = await prisma.project.upsert({
    where: { id: 'test-project-id' },
    update: {},
    create: {
      id: 'test-project-id',
      name: 'Test Project - E-Commerce Platform',
      description: 'A modern e-commerce platform with admin dashboard',
      status: 'ACTIVE',
      companyId: company.id,
      clientId: client.id,
    },
  })
  console.log('✅ Test project created:', project.name)

  // Assign team members to project
  await prisma.projectEmployee.upsert({
    where: { id: 'pe-1' },
    update: {},
    create: {
      id: 'pe-1',
      projectId: project.id,
      employeeId: dev1.id,
      role: 'LEAD',
    },
  })

  await prisma.projectEmployee.upsert({
    where: { id: 'pe-2' },
    update: {},
    create: {
      id: 'pe-2',
      projectId: project.id,
      employeeId: dev2.id,
      role: 'DEVELOPER',
    },
  })

  await prisma.projectEmployee.upsert({
    where: { id: 'pe-3' },
    update: {},
    create: {
      id: 'pe-3',
      projectId: project.id,
      employeeId: dev3.id,
      role: 'DEVELOPER',
    },
  })

  await prisma.projectEmployee.upsert({
    where: { id: 'pe-4' },
    update: {},
    create: {
      id: 'pe-4',
      projectId: project.id,
      employeeId: designer.id,
      role: 'DESIGNER',
    },
  })
  console.log('✅ Team members assigned to project')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('📧 Login credentials (all users):')
  console.log('   Password: vAbhi2678\n')
  console.log('👤 Admin:')
  console.log('   Email: admin@test.com')
  console.log('\n👨‍💻 Developers:')
  console.log('   Email: dev1@test.com (John Developer - Lead)')
  console.log('   Email: dev2@test.com (Sarah Engineer)')
  console.log('   Email: dev3@test.com (Mike Frontend)')
  console.log('\n🎨 Designer:')
  console.log('   Email: designer@test.com (Lisa Designer)')
  console.log('\n🤝 Client:')
  console.log('   Email: client@test.com')
  console.log('\n📁 Test project created: Test Project - E-Commerce Platform')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
