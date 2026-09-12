import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users (1 Admin, 2 PMs, 4 Devs)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@velozity.com',
      name: 'Aman Sharma',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'sarah.pm@velozity.com',
      name: 'Sarah Chen',
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'marcus.pm@velozity.com',
      name: 'Marcus Vance',
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      email: 'ravi.dev@velozity.com',
      name: 'Ravi Kumar',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: 'elena.dev@velozity.com',
      name: 'Elena Rostova',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      email: 'alex.dev@velozity.com',
      name: 'Alex Morgan',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      email: 'priya.dev@velozity.com',
      name: 'Priya Patel',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  console.log('✅ Users created');

  // 2. Seed Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Apex Financial Holdings',
      company: 'Apex Financial Group',
      email: 'contact@apexfin.com',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'BioPulse Therapeutics',
      company: 'BioPulse Health Inc.',
      email: 'team@biopulse.org',
    },
  });

  console.log('✅ Clients created');

  // 3. Seed Projects (3 Projects across PMs)
  const now = new Date();
  const pastDate3Days = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const pastDate5Days = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const futureDate2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const futureDate5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const futureDate10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

  // Project 1: Banking Core Migration (PM: Sarah Chen)
  const project1 = await prisma.project.create({
    data: {
      title: 'Banking Core Modernization',
      description: 'Migrating legacy mainframe ledger workflows to high-throughput cloud event streaming architecture.',
      clientId: client1.id,
      pmId: pm1.id,
    },
  });

  // Project 2: Clinical Telemetry Portal (PM: Marcus Vance)
  const project2 = await prisma.project.create({
    data: {
      title: 'Clinical Telemetry Portal',
      description: 'Real-time patient monitoring platform with HIPAA-compliant sensor streaming and alert dispatch.',
      clientId: client2.id,
      pmId: pm2.id,
    },
  });

  // Project 3: AI Fraud Detection Pipeline (PM: Sarah Chen)
  const project3 = await prisma.project.create({
    data: {
      title: 'Real-Time Fraud Detection Engine',
      description: 'Sub-millisecond inference pipeline utilizing graph neural networks for anomalous transaction flagging.',
      clientId: client1.id,
      pmId: pm1.id,
    },
  });

  console.log('✅ Projects created');

  // 4. Seed Tasks (5+ per project, at least 2 overdue)
  // Tasks for Project 1 (Banking Core Modernization)
  const p1t1 = await prisma.task.create({
    data: {
      title: 'Design PostgreSQL Ledger Schema with Dual-Entry Audit',
      description: 'Implement immutable transaction logs with cryptographic hash chain checks.',
      projectId: project1.id,
      developerId: dev1.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate5Days,
      isOverdue: false,
    },
  });

  const p1t2 = await prisma.task.create({
    data: {
      title: 'Implement Kafka Event Ingestion Consumer',
      description: 'Build robust consumer group with dead-letter queue and retry backoff.',
      projectId: project1.id,
      developerId: dev1.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2Days,
      isOverdue: false,
    },
  });

  const p1t3 = await prisma.task.create({
    data: {
      title: 'Reconcile Multi-Currency Exchange Rates API',
      description: 'Connect to Bloomberg real-time FX feed with fallback cache.',
      projectId: project1.id,
      developerId: dev2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDate3Days,
      isOverdue: true, // OVERDUE 1
    },
  });

  const p1t4 = await prisma.task.create({
    data: {
      title: 'Stress Test Ledger Locking Concurrency',
      description: 'Benchmark row-level lock contention under 10,000 requests/sec.',
      projectId: project1.id,
      developerId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate5Days,
      isOverdue: false,
    },
  });

  const p1t5 = await prisma.task.create({
    data: {
      title: 'SOC2 Compliance Data Retention Policies',
      description: 'Configure automated S3 Glacier archival rules and PII anonymization.',
      projectId: project1.id,
      developerId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate10Days,
      isOverdue: false,
    },
  });

  const p1t6 = await prisma.task.create({
    data: {
      title: 'Audit Trail Export to CSV and PDF',
      description: 'Generate signed audit reports with HMAC verification.',
      projectId: project1.id,
      developerId: dev1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate5Days,
      isOverdue: false,
    },
  });

  // Tasks for Project 2 (Clinical Telemetry Portal)
  const p2t1 = await prisma.task.create({
    data: {
      title: 'ECG Signal WebSocket Streaming Server',
      description: 'Deliver 250Hz pulse telemetry with packet loss recovery.',
      projectId: project2.id,
      developerId: dev3.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate3Days,
      isOverdue: true, // OVERDUE 2
    },
  });

  const p2t2 = await prisma.task.create({
    data: {
      title: 'ICD-10 Diagnostic Code Mapping',
      description: 'Integrate standard medical vocabulary and fuzzy lookup endpoint.',
      projectId: project2.id,
      developerId: dev4.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDate5Days,
      isOverdue: false,
    },
  });

  const p2t3 = await prisma.task.create({
    data: {
      title: 'Critical Vital Threshold Alert Push System',
      description: 'Dispatch immediate push notifications and SMS when vitals exceed safe ranges.',
      projectId: project2.id,
      developerId: dev3.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate2Days,
      isOverdue: false,
    },
  });

  const p2t4 = await prisma.task.create({
    data: {
      title: 'Biometric Wearable Bluetooth Pair Flow',
      description: 'Mobile web WebBluetooth API bridge for pulse oximeter pairing.',
      projectId: project2.id,
      developerId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate5Days,
      isOverdue: false,
    },
  });

  const p2t5 = await prisma.task.create({
    data: {
      title: 'Nurse Station Multi-Bed Overview Grid',
      description: 'Responsive telemetry grid rendering 16 simultaneous patient waveforms.',
      projectId: project2.id,
      developerId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate10Days,
      isOverdue: false,
    },
  });

  // Tasks for Project 3 (AI Fraud Detection Pipeline)
  const p3t1 = await prisma.task.create({
    data: {
      title: 'Train Graph Convolutional Network on Anomaly Dataset',
      description: 'Evaluate PyTorch Geometric model performance with ROC-AUC metric.',
      projectId: project3.id,
      developerId: dev1.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDate5Days,
      isOverdue: false,
    },
  });

  const p3t2 = await prisma.task.create({
    data: {
      title: 'ONNX Runtime Model Quantization',
      description: 'Quantize FP32 model to INT8 to achieve under 5ms inference latency.',
      projectId: project3.id,
      developerId: dev2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2Days,
      isOverdue: false,
    },
  });

  const p3t3 = await prisma.task.create({
    data: {
      title: 'Rule-Based Safety Override Heuristics',
      description: 'Hard constraints for sanctioned jurisdictions and velocity checks.',
      projectId: project3.id,
      developerId: dev2.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate5Days,
      isOverdue: false,
    },
  });

  const p3t4 = await prisma.task.create({
    data: {
      title: 'Risk Score Dashboard Component',
      description: 'Color-coded radial gauge displaying transaction risk percentage.',
      projectId: project3.id,
      developerId: dev1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate10Days,
      isOverdue: false,
    },
  });

  const p3t5 = await prisma.task.create({
    data: {
      title: 'Webhook Callback Notification Service',
      description: 'Deliver asynchronous fraud risk alerts to merchant checkout APIs.',
      projectId: project3.id,
      developerId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate10Days,
      isOverdue: false,
    },
  });

  console.log('✅ Tasks created (including 2 overdue tasks)');

  // 5. Seed Historical Activity Logs
  const activities = [
    {
      projectId: project1.id,
      taskId: p1t1.id,
      userId: dev1.id,
      actionText: `${dev1.name} moved Task "${p1t1.title}" from In Review → Done`,
      previousState: { status: 'IN_REVIEW' },
      newState: { status: 'DONE' },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      projectId: project1.id,
      taskId: p1t2.id,
      userId: dev1.id,
      actionText: `${dev1.name} moved Task "${p1t2.title}" from In Progress → In Review`,
      previousState: { status: 'IN_PROGRESS' },
      newState: { status: 'IN_REVIEW' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      projectId: project1.id,
      taskId: p1t3.id,
      userId: pm1.id,
      actionText: `${pm1.name} assigned Task "${p1t3.title}" to ${dev2.name}`,
      previousState: { developerId: null },
      newState: { developerId: dev2.id },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      projectId: project2.id,
      taskId: p2t2.id,
      userId: dev4.id,
      actionText: `${dev4.name} moved Task "${p2t2.title}" from In Review → Done`,
      previousState: { status: 'IN_REVIEW' },
      newState: { status: 'DONE' },
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    },
    {
      projectId: project2.id,
      taskId: p2t3.id,
      userId: dev3.id,
      actionText: `${dev3.name} moved Task "${p2t3.title}" from In Progress → In Review`,
      previousState: { status: 'IN_PROGRESS' },
      newState: { status: 'IN_REVIEW' },
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
    },
    {
      projectId: project3.id,
      taskId: p3t1.id,
      userId: dev1.id,
      actionText: `${dev1.name} moved Task "${p3t1.title}" from In Progress → Done`,
      previousState: { status: 'IN_PROGRESS' },
      newState: { status: 'DONE' },
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    },
    {
      projectId: project3.id,
      taskId: p3t3.id,
      userId: dev2.id,
      actionText: `${dev2.name} moved Task "${p3t3.title}" from In Progress → In Review`,
      previousState: { status: 'IN_PROGRESS' },
      newState: { status: 'IN_REVIEW' },
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act });
  }

  console.log('✅ Historical Activity Logs created');

  // 6. Seed In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: dev1.id,
        message: 'You have been assigned to task: "Audit Trail Export to CSV and PDF"',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        userId: pm1.id,
        message: 'Task "Implement Kafka Event Ingestion Consumer" was submitted for In Review by Ravi Kumar',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: pm2.id,
        message: 'Task "Critical Vital Threshold Alert Push System" was submitted for In Review by Alex Morgan',
        isRead: false,
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        userId: dev2.id,
        message: 'You have been assigned to task: "Reconcile Multi-Currency Exchange Rates API"',
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
