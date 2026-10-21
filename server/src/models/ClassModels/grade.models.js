import mongoose from "mongoose";

const subjectMarkSchema = new mongoose.Schema(
  {
   
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    credits: { type: Number, default: 0 },

    specialCia: { type: Number, default: 0, max: 20 },
    cia1: { type: Number, default: 0, max: 20 },
    cia2: { type: Number, default: 0, max: 20 },
    cia3: { type: Number, default: 0, max: 20 },

    internalMarks: { type: Number, default: 0,  }, // derived or entered
    externalMarks: { type: Number, default: 0, }, // end-sem
    totalMarks: { type: Number, default: 0,  }, // derived
    totallecture: {
      type: Number,
      default: 0,
    },
    attendance:{
        cia1:{
            attended:{ type: Number, default: 0,  },
            total:{ type: Number, default: 0,  },
        },
        cia2:{
            attended:{ type: Number, default: 0,  },
            total:{ type: Number, default: 0,  },
        },
        cia3:{
            attended:{ type: Number, default: 0,  },
            total:{ type: Number, default: 0,  },
        },
    },

    letterGrade: String, // e.g., "A+"
  },
  { _id: false }
);

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required: true },

    subjects: [subjectMarkSchema],

    semesterExam: Number, // overall semester exam marks if any
    sgpa: Number, // computed
    remarks: String,
  },
  { timestamps: true }
);

// unique: one grade sheet per student per semester
gradeSchema.index({ studentId: 1, semester: 1 }, { unique: true });

// Auto compute totals & SGPA if possible
gradeSchema.pre("save", function (next) {
  this.subjects = (this.subjects || []).map((s) => {
    const internal =
      s.internalMarks ??
      [s.cia1, s.cia2, s.cia3, s.specialCia]
        .filter((v) => typeof v === "number")
        .reduce((a, b) => a + b, 0);
    const external = s.externalMarks ?? 0;
    const total = internal + external;
    const letter = s.letterGrade || toLetter(total);
    return {
      ...s,
      internalMarks: internal,
      externalMarks: external,
      totalMarks: total,
      letterGrade: letter,
    };
  });

  this.sgpa = computeSGPA(this.subjects);
  next();
});

// helpers (very simple rubric—adjust to your college policy)
function toLetter(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  return "F";
}

function letterToPoint(letter) {
  return { "A+": 10, A: 9, "B+": 8, B: 7, C: 6, D: 5, F: 0 }[letter] ?? 0;
}

function computeSGPA(subjects) {
  if (!subjects?.length) return 0;
  let totCredits = 0,
    weighted = 0;
  for (const s of subjects) {
    const cr = s.credits ?? 4;
    totCredits += cr;
    weighted += letterToPoint(s.letterGrade) * cr;
  }
  return totCredits ? Number((weighted / totCredits).toFixed(2)) : 0;
}

export const Grade = mongoose.model("Grade", gradeSchema);
