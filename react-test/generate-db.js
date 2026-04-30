import fs from 'fs';

const generateDB = () => {
  const db = {
    departments: [
      { dept_code: "CARD", dept_name: "Cardiology", floor: 1 },
      { dept_code: "ORTH", dept_name: "Orthopedics", floor: 2 },
      { dept_code: "NEUR", dept_name: "Neurology", floor: 3 },
      { dept_code: "PED", dept_name: "Pediatrics", floor: 1 },
      { dept_code: "ENT", dept_name: "E.N.T", floor: 2 }
    ],
    doctors: Array.from({ length: 100 }, (_, i) => ({
      id: `D${i + 1}`,
      doc_name: `Dr. ${["Krunal", "Kamalakar", "Smith", "Taylor", "Sharma", "Patil"][i % 6]} ${i + 1}`,
      dept: ["CARD", "ORTH", "NEUR", "PED", "ENT"][i % 5],
      availability: i % 2 === 0 ? "Morning" : "Evening"
    })),
    patients: Array.from({ length: 50 }, (_, i) => ({
      id: `P${100 + i}`,
      full_name_backend: `Patient ${i + 1}`,
      age_backend: Math.floor(Math.random() * 60) + 18,
      blood_group: ["A+", "B+", "O+", "AB-"][i % 4],
      history: "No major issues"
    })),
    property_types: [
      { code: "COMM", display: "Commercial Office" },
      { code: "RETL", display: "Retail/Mall" },
      { code: "INDU", display: "Industrial/Warehouse" },
      { code: "RESI", display: "Residential Complex" }
    ]
  };

  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  console.log("✅ db.json generated successfully!");
};

generateDB();