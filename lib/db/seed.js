// seed.js - database seeding script
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// CommonJS seed function
async function seed() {
  // Configure connection URL from .env if exists
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medcore';

  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Successfully connected to MongoDB.');

  const db = mongoose.connection.db;

  try {
    const hydrateCollection = async (name, data) => {
      try {
        await db.collection(name).drop();
        console.log(`  Dropped existing collection: ${name}`);
      } catch (e) {
        // Collection might not exist yet, ignore drop error
      }
      if (data && data.length > 0) {
        await db.collection(name).insertMany(data);
        console.log(`  ✓ Inserted ${data.length} documents into ${name}`);
      }
    };

    // Load initial JSON datasets
    const patientsPath = path.join(process.cwd(), 'lib', 'mock-data', 'patients.json');
    const doctorsPath = path.join(process.cwd(), 'lib', 'mock-data', 'doctors.json');
    const appointmentsPath = path.join(process.cwd(), 'lib', 'mock-data', 'appointments.json');

    const patientsData = JSON.parse(fs.readFileSync(patientsPath, 'utf8'));
    const doctorsData = JSON.parse(fs.readFileSync(doctorsPath, 'utf8'));
    const appointmentsData = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));

    // Construct Medical Records
    const initialRecords = [
      {
        id: 'REC-3001',
        patientId: 'PX-2001',
        doctorId: 'DR-0001',
        department: 'Cardiology',
        diagnosis: 'Acute Coronary Syndrome',
        treatmentPlan: 'Bed rest, continuous ECG monitoring, and medication schedule. Scheduled coronary angiography.',
        prescriptions: [
          { medicineName: 'Aspirin', dosage: '1-0-0', duration: '30 days', instructions: 'After breakfast' },
          { medicineName: 'Clopidogrel', dosage: '0-0-1', duration: '30 days', instructions: 'Before sleep' },
          { medicineName: 'Atorvastatin', dosage: '0-0-1', duration: '60 days', instructions: 'Before sleep' }
        ],
        labResults: [
          { testName: 'Troponin-T', result: '0.45 ng/mL', normalRange: '< 0.01 ng/mL', status: 'Critical' },
          { testName: 'Electrocardiogram (ECG)', result: 'ST-segment elevation in V1-V4', normalRange: 'Normal Sinus Rhythm', status: 'Abnormal' }
        ],
        vitals: { bloodPressure: '142/90 mmHg', heartRate: 88, temperature: 98.4, respiratoryRate: 18, spO2: 95 },
        notes: 'Patient was admitted with acute retrosternal chest pain radiating to left arm. Hemodynamically stable but requires intensive nurse monitoring.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      },
      {
        id: 'REC-3002',
        patientId: 'PX-2002',
        doctorId: 'DR-0002',
        department: 'Neurology',
        diagnosis: 'Migraine with Aura',
        treatmentPlan: 'Avoid triggers, trigger diary maintenance, and prophylactic abortive drug management.',
        prescriptions: [
          { medicineName: 'Sumatriptan', dosage: '1-0-0 (SOS)', duration: '10 days', instructions: 'Take at onset of aura' },
          { medicineName: 'Propranolol', dosage: '1-0-1', duration: '90 days', instructions: 'After meals' }
        ],
        labResults: [
          { testName: 'Brain MRI (Contrast)', result: 'No acute intracranial pathology detected. Normal scans.', normalRange: 'Normal', status: 'Normal' }
        ],
        vitals: { bloodPressure: '118/76 mmHg', heartRate: 72, temperature: 98.6, respiratoryRate: 14, spO2: 99 },
        notes: 'Recurrent severe throbbing unilateral headaches preceded by visual scintillating scotoma.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];

    // Construct Medicines
    const initialMedicines = [
      {
        id: 'MED-4001',
        name: 'Aspirin',
        category: 'Analgesic / Antiplatelet',
        stock: 450,
        threshold: 100,
        price: 12,
        dosageForm: 'Tablet',
        strength: '75 mg',
        manufacturer: 'Bayer Health',
        expiryDate: '2027-12-31'
      },
      {
        id: 'MED-4002',
        name: 'Amoxicillin',
        category: 'Antibiotic',
        stock: 35,
        threshold: 50,
        price: 45,
        dosageForm: 'Capsule',
        strength: '500 mg',
        manufacturer: 'GlaxoSmithKline',
        expiryDate: '2026-10-31'
      },
      {
        id: 'MED-4003',
        name: 'Paracetamol',
        category: 'Antipyretic',
        stock: 1200,
        threshold: 200,
        price: 5,
        dosageForm: 'Tablet',
        strength: '650 mg',
        manufacturer: 'Cipla Ltd.',
        expiryDate: '2028-05-15'
      },
      {
        id: 'MED-4004',
        name: 'Metformin',
        category: 'Antidiabetic',
        stock: 80,
        threshold: 100,
        price: 15,
        dosageForm: 'Tablet',
        strength: '500 mg',
        manufacturer: 'Pfizer Inc.',
        expiryDate: '2027-04-20'
      },
      {
        id: 'MED-4005',
        name: 'Atorvastatin',
        category: 'Antihyperlipidemic',
        stock: 320,
        threshold: 80,
        price: 28,
        dosageForm: 'Tablet',
        strength: '20 mg',
        manufacturer: 'Lupin Labs',
        expiryDate: '2027-09-30'
      }
    ];

    // Construct Invoices
    const initialInvoices = [
      {
        id: 'INV-8001',
        patientId: 'PX-2001',
        appointmentId: 'APT-5001',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
        lineItems: [
          { description: 'Emergency Cardiology Consultation', amount: 800, quantity: 1 },
          { description: 'Troponin-T Lab Analysis', amount: 1200, quantity: 1 },
          { description: 'ECG Screening Charges', amount: 500, quantity: 1 },
          { description: 'Cardiology Ward Occupancy Charge (2 Days)', amount: 6000, quantity: 1 }
        ],
        discount: 10,
        tax: 18,
        total: 9027,
        amountPaid: 9027,
        status: 'Paid',
        paymentMethod: 'UPI'
      },
      {
        id: 'INV-8002',
        patientId: 'PX-2002',
        appointmentId: 'APT-5002',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
        lineItems: [
          { description: 'Neurology Consultation', amount: 1000, quantity: 1 },
          { description: 'Contrast Brain MRI Scan', amount: 8500, quantity: 1 }
        ],
        discount: 0,
        tax: 18,
        total: 11210,
        amountPaid: 0,
        status: 'Unpaid'
      },
      {
        id: 'INV-8003',
        patientId: 'PX-2003',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
        lineItems: [
          { description: 'General OPD Consultation Fee', amount: 500, quantity: 1 },
          { description: 'Pharmacy Prescription Dispense', amount: 1500, quantity: 1 }
        ],
        discount: 0,
        tax: 5,
        total: 2100,
        amountPaid: 500,
        status: 'Partially Paid',
        paymentMethod: 'Cash'
      }
    ];

    // Construct Activity Logs
    const initialActivities = [
      {
        id: 'ACT-1001',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        type: 'info',
        message: 'System database initialized successfully.',
        category: 'system'
      },
      {
        id: 'ACT-1002',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        type: 'success',
        message: 'Initial clinical data registers loaded.',
        category: 'system'
      }
    ];

    // Construct seeded Admin User
    const seededUsers = [
      {
        id: 'USR-0001',
        name: 'MedCore Admin',
        email: 'admin@medcore.com',
        password: hashPassword('admin123'),
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Sync all
    await hydrateCollection('patients', patientsData);
    await hydrateCollection('doctors', doctorsData);
    await hydrateCollection('appointments', appointmentsData);
    await hydrateCollection('medicalrecords', initialRecords);
    await hydrateCollection('medicines', initialMedicines);
    await hydrateCollection('invoices', initialInvoices);
    await hydrateCollection('activitylogs', initialActivities);
    await hydrateCollection('users', seededUsers);

    console.log('✓ Seeding complete! Database successfully populated.');
    await mongoose.connection.close();
    // Do not exit the process; let the caller handle response
    return { success: true };
  } catch (error) {
    console.error('✗ Seeding failed with error:', error);
    await mongoose.connection.close();
    throw error;
  }
}

module.exports = seed;

