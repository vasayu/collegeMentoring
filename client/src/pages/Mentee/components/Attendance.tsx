import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiCLient } from "@/service/app";

type Props = {
    gradeSheets: any[];
    studentId?: string;
    onSaved?: (updatedSheets: any[]) => void;
};

const CIAS = ["cia1", "cia2", "cia3"] as const;

const getTotals = (attendance: any) => {
    const total = CIAS.reduce((a, c) => a + (attendance?.[c]?.total || 0), 0);
    const attended = CIAS.reduce((a, c) => a + (attendance?.[c]?.attended || 0), 0);
    return { total, attended };
};

export default function Attendance({ gradeSheets, studentId, onSaved }: Props) {
    const user = useSelector((state: any) => state.auth?.userData);
    const canEdit = Boolean(user?.teacherId || user?.adminId);

    const [localSheets, setLocalSheets] = useState<any[]>([]);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    useEffect(() => {
        if (gradeSheets) {
            setLocalSheets(structuredClone(gradeSheets));
        }
    }, [gradeSheets]);

    const handleAttendanceChange = (
        semIdx: number,
        subjIdx: number,
        cia: typeof CIAS[number],
        field: "attended" | "total",
        value: number
    ) => {
        setLocalSheets((prev) => {
            const copy = structuredClone(prev);
            copy[semIdx].subjects[subjIdx].attendance[cia][field] = value;
            return copy;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setStatusMsg(null);

        try {
            for (const sheet of localSheets) {
                for (const subject of sheet.subjects) {
                    await apiCLient.post("/mentors/update-grade", {
                        studentId,
                        semester: sheet.semester,
                        subjectCode: subject.subjectCode,
                        updates: {
                            attendance: subject.attendance,
                        },
                    });
                }
            }

            setStatusMsg("Attendance saved successfully.");
            onSaved?.(localSheets);
            setEditing(false);
        } catch (err) {
            console.error(err);
            setStatusMsg("Failed to save attendance.");
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
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">📅</span>
                    Attendance Record
                </h2>

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

            {localSheets.length === 0 ? (
                <div className="text-sm font-medium text-gray-400 py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    No attendance data available.
                </div>
            ) : (
                localSheets.map((sheet, semIdx) => {
                    const semesterTotals = sheet.subjects.reduce(
                        (acc: any, s: any) => {
                            const { total, attended } = getTotals(s.attendance);
                            acc.total += total;
                            acc.attended += attended;
                            return acc;
                        },
                        { total: 0, attended: 0 }
                    );

                    const overallPercent = semesterTotals.total
                        ? (
                            (semesterTotals.attended / semesterTotals.total) *
                            100
                        ).toFixed(1)
                        : "0.0";

                    return (
                        <div key={sheet.semester} className="mb-8 last:mb-0">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-lg font-extrabold text-gray-900">
                                    Semester {sheet.semester}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                                    {sheet.subjects.length} Subjects
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                                    {overallPercent}% Overall
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                                        <tr>
                                            <th className="px-5 py-3.5">Subject</th>
                                            {CIAS.map((cia) => (
                                                <th key={cia} className="px-3 py-3.5 text-center uppercase text-xs tracking-wider">
                                                    {cia} (Att / Tot)
                                                </th>
                                            ))}
                                            <th className="px-4 py-3.5 text-center">Total</th>
                                            <th className="px-4 py-3.5 text-center">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {sheet.subjects.map(
                                            (sub: any, subjIdx: number) => {
                                                const { total, attended } =
                                                    getTotals(sub.attendance);
                                                const percentStr = total
                                                    ? (
                                                        (attended / total) *
                                                        100
                                                    ).toFixed(1)
                                                    : "—";

                                                const percentNum = Number(percentStr);
                                                let badgeClass = "bg-gray-100 text-gray-600";
                                                if (percentStr !== "—") {
                                                    if (percentNum >= 80) badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
                                                    else if (percentNum >= 70) badgeClass = "bg-amber-50 text-amber-700 border border-amber-200/50";
                                                    else badgeClass = "bg-rose-50 text-rose-700 border border-rose-200/50";
                                                }

                                                return (
                                                    <tr
                                                        key={sub.subjectCode}
                                                        className="hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-5 py-4 font-bold text-gray-900">
                                                            {sub.subjectName}
                                                        </td>

                                                        {CIAS.map((cia) => (
                                                            <td key={cia} className="px-3 py-4 text-center">
                                                                {editing ? (
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            value={sub.attendance[cia].attended}
                                                                            onChange={(e) => handleAttendanceChange(semIdx, subjIdx, cia, "attended", Number(e.target.value))}
                                                                            className="w-12 border rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:w-14"
                                                                        />
                                                                        <span className="text-gray-400 font-medium">/</span>
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            value={sub.attendance[cia].total}
                                                                            onChange={(e) => handleAttendanceChange(semIdx, subjIdx, cia, "total", Number(e.target.value))}
                                                                            className="w-12 border rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:w-14"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="font-semibold text-gray-800">
                                                                        {sub.attendance[cia].attended} <span className="text-gray-400 font-normal">/ {sub.attendance[cia].total}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}

                                                        <td className="text-center px-4 py-4 font-semibold text-gray-800">
                                                            {attended} <span className="text-gray-400 font-normal">/ {total}</span>
                                                        </td>

                                                        <td className="text-center px-4 py-4">
                                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block min-w-[50px] shadow-sm ${badgeClass}`}>
                                                                {percentStr !== "—" ? `${percentStr}%` : "—"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
