import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiCLient } from "@/service/app";
import { type GradeSheet, type SubjectMark } from "../Student";

type Props = {
    gradeSheets: GradeSheet[];
    studentId?: string;
    onSaved: (updated: GradeSheet[]) => void;
};


function computeInternalAuto(s: SubjectMark) {
    const values = [s.cia1, s.cia2, s.cia3, s.specialCia]
        .map(v => Number(v))
        .filter(v => !isNaN(v));
    return values.reduce((a, b) => a + b, 0);
}

function computeBestTwoAverage(s: SubjectMark) {
    const values = [s.cia1, s.cia2, s.cia3, s.specialCia]
        .map(v => Number(v))
        .filter(v => !isNaN(v))
        .sort((a, b) => b - a);

    if (values.length === 0) return "—";
    if (values.length === 1) return values[0].toFixed(1);

    return ((values[0] + values[1]) / 2).toFixed(1);
}

function computeTotal(s: SubjectMark) {
    return Number(s.internalMarks ?? 0) + Number(s.externalMarks ?? 0);
}

/* ---------------- COMPONENT ---------------- */

export default function Grades({ gradeSheets, onSaved, studentId }: Props) {
    const user = useSelector((state: any) => state.auth?.userData);
    const canEdit = Boolean(user?.teacherId || user?.adminId);

    const [localSheets, setLocalSheets] = useState<GradeSheet[]>(gradeSheets);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!editing) {
            setLocalSheets(structuredClone(gradeSheets));
        }
    }, [gradeSheets, editing]);

    const totals = useMemo(() => {
        let credits = 0, totalMarks = 0, subCount = 0;
        for (const sheet of localSheets) {
            for (const s of sheet.subjects) {
                credits += s.credits ?? 0;
                totalMarks += computeTotal(s);
                subCount++;
            }
        }
        return { credits, totalMarks, subCount };
    }, [localSheets]);

    const updateField = (
        semIdx: number,
        subjIdx: number,
        key: keyof SubjectMark,
        value: string
    ) => {
        setStatusMsg(null);
        setLocalSheets(prev => {
            const copy = structuredClone(prev);
            const target = copy[semIdx].subjects[subjIdx];

            (target as any)[key] = value === "" ? 0 : Number(value);

            // Auto-calc total when anything changes
            target.totalMarks = computeTotal(target);

            return copy;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setStatusMsg(null);

        try {
            for (const sheet of localSheets) {
                for (const subj of sheet.subjects) {
                    await apiCLient.post("/mentors/update-grade", {
                        studentId,
                        semester: sheet.semester,
                        subjectCode: subj.subjectCode,
                        updates: {
                            cia1: subj.cia1,
                            cia2: subj.cia2,
                            cia3: subj.cia3,
                            specialCia: subj.specialCia,
                            internalMarks: subj.internalMarks,
                            externalMarks: subj.externalMarks,
                        },
                    });
                }
            }

            onSaved(localSheets);
            setEditing(false);
            setStatusMsg("Grades updated successfully.");
        } catch (err) {
            console.error(err);
            setStatusMsg("Failed to save grades.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setLocalSheets(structuredClone(gradeSheets));
        setEditing(false);
        setStatusMsg("Changes reverted.");
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-50">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">🎓</span>
                        Grades
                    </h2>
                    <div className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {totals.subCount} Subjects</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {totals.credits} Credits</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {totals.totalMarks} Total Marks</span>
                    </div>
                </div>

                {canEdit && (
                    <div className="flex gap-2">
                        {!editing ? (
                            <button
                                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 transition-all active:scale-[0.98]"
                                onClick={() => setEditing(true)}
                            >
                                ✏️ Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 transition-all active:scale-[0.98]"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "💾 Save"}
                                </button>
                                <button
                                    className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {statusMsg && (
                <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">{statusMsg}</div>
            )}

            {localSheets.map((sheet, semIdx) => (
                <section key={sheet.semester} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-extrabold text-gray-900">
                            Semester {sheet.semester}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                            SGPA: {sheet.sgpa ?? "—"}
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">Subject</th>
                                    <th className="px-3 py-3.5 text-center">Credits</th>
                                    <th className="px-3 py-3.5 text-center">CIA1</th>
                                    <th className="px-3 py-3.5 text-center">CIA2</th>
                                    <th className="px-3 py-3.5 text-center">CIA3</th>
                                    <th className="px-3 py-3.5 text-center">Special</th>
                                    <th className="px-3 py-3.5 text-center">Best 2 Avg</th>
                                    <th className="px-3 py-3.5 text-center">Internal</th>
                                    <th className="px-3 py-3.5 text-center">External</th>
                                    <th className="px-4 py-3.5 text-center text-gray-900">Total</th>
                                    <th className="px-4 py-3.5 text-center">Grade</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {sheet.subjects.map((s, subjIdx) => {
                                    const bestTwoAvg = computeBestTwoAverage(s);
                                    const total = computeTotal(s);
                                    
                                    let gradeBadgeClass = "bg-gray-100 text-gray-600 border border-gray-200/50";
                                    if (s.letterGrade) {
                                        const g = s.letterGrade.trim().toUpperCase();
                                        if (["S", "A+", "A"].includes(g)) gradeBadgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
                                        else if (["B+", "B"].includes(g)) gradeBadgeClass = "bg-blue-50 text-blue-700 border border-blue-200/50";
                                        else if (["C+", "C"].includes(g)) gradeBadgeClass = "bg-amber-50 text-amber-700 border border-amber-200/50";
                                        else if (["D", "E", "F"].includes(g)) gradeBadgeClass = "bg-rose-50 text-rose-700 border border-rose-200/50";
                                    }

                                    return (
                                        <tr key={s.subjectCode} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4 font-bold text-gray-900">{s.subjectName}</td>
                                            <td className="px-3 py-4 text-center font-medium text-gray-600">{s.credits}</td>

                                            {(["cia1", "cia2", "cia3", "specialCia"] as const).map((key) => (
                                                <td key={key} className="px-3 py-4 text-center text-gray-700 font-medium">
                                                    {editing ? (
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={20}
                                                            value={(s as any)[key] ?? 0}
                                                            onChange={(e) =>
                                                                updateField(semIdx, subjIdx, key, e.target.value)
                                                            }
                                                            className="w-14 rounded-lg border px-1 py-1 text-center bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        />
                                                    ) : (
                                                        (s as any)[key] ?? "—"
                                                    )}
                                                </td>
                                            ))}

                                            <td className="px-3 py-4 text-center font-bold text-indigo-700 bg-indigo-50/30">{bestTwoAvg}</td>

                                            <td className="px-3 py-4 text-center font-medium text-gray-700">
                                                {editing ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={s.internalMarks ?? computeInternalAuto(s)}
                                                        onChange={(e) =>
                                                            updateField(semIdx, subjIdx, "internalMarks", e.target.value)
                                                        }
                                                        className="w-16 rounded-lg border px-2 py-1 text-center bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    s.internalMarks ?? computeInternalAuto(s)
                                                )}
                                            </td>

                                            <td className="px-3 py-4 text-center font-medium text-gray-700">
                                                {editing ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={s.externalMarks ?? 0}
                                                        onChange={(e) =>
                                                            updateField(semIdx, subjIdx, "externalMarks", e.target.value)
                                                        }
                                                        className="w-16 rounded-lg border px-2 py-1 text-center bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    s.externalMarks ?? "—"
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center font-black text-gray-900 text-base">{total}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block min-w-[36px] shadow-sm ${gradeBadgeClass}`}>
                                                    {s.letterGrade || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
        </div>
    );
}
