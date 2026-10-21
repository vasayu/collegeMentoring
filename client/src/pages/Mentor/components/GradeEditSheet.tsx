import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { apiCLient } from '@/service/app';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubjectGrade {
    subjectCode: string;
    subjectName: string;
    cia1: number;
    cia2: number;
    cia3: number;
    specialCia: number;
    externalMarks: number;
    attendance: {
        cia1: { attended: number; total: number };
        cia2: { attended: number; total: number };
        cia3: { attended: number; total: number };
    };
}

interface StudentGradeRow {
    profileId: string;
    admissionNo: string;
    studentId: { firstName: string; lastName?: string; email: string };
    grade: { _id: string; subjects: SubjectGrade[] } | null;
    // local state tracking
    _dirty: boolean;
    _subjects: SubjectGrade[];
}

interface ClassGradeData {
    students: StudentGradeRow[];
    subjects: { subjectCode: string; subjectName: string }[];
}

interface Props {
    classId: string;
    onClose: () => void;
}

// ─── Deep clone helper ────────────────────────────────────────────────────────
const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Savings Progress Bar ─────────────────────────────────────────────────────
const ProgressBar = ({ done, total }: { done: number; total: number }) => {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                {done}/{total} saved
            </span>
        </div>
    );
};

// ─── Single cell input ────────────────────────────────────────────────────────
const NumInput = ({
    value,
    max,
    onChange,
}: {
    value: number;
    max?: number;
    onChange: (v: number) => void;
}) => (
    <input
        type="number"
        min={0}
        max={max}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 text-center text-sm border border-gray-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 bg-gray-50 hover:bg-white transition-colors"
    />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GradeEditSheet({ classId, onClose }: Props) {
    const [data, setData] = useState<ClassGradeData | null>(null);
    const [rows, setRows] = useState<StudentGradeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);
    const [expandedSubj, setExpandedSubj] = useState<Record<string, boolean>>({});
    const originalRef = useRef<Record<string, SubjectGrade[]>>({});

    // Fetch all class grades in one shot
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await apiCLient.get(`/mentors/class-grades/${classId}`);
                const d: ClassGradeData = res.data.data;
                setData(d);

                const initialRows: StudentGradeRow[] = d.students.map((s) => {
                    const subjects = s.grade?.subjects
                        ? deepClone(s.grade.subjects)
                        : d.subjects.map((subj) => ({
                              subjectCode: subj.subjectCode,
                              subjectName: subj.subjectName,
                              cia1: 0, cia2: 0, cia3: 0, specialCia: 0, externalMarks: 0,
                              attendance: {
                                  cia1: { attended: 0, total: 0 },
                                  cia2: { attended: 0, total: 0 },
                                  cia3: { attended: 0, total: 0 },
                              },
                          }));

                    // Store original for dirty detection
                    originalRef.current[s.profileId] = deepClone(subjects);

                    return {
                        ...s,
                        _dirty: false,
                        _subjects: subjects,
                    };
                });
                setRows(initialRows);

                // Default: expand first subject
                if (d.subjects.length > 0) {
                    setExpandedSubj({ [d.subjects[0].subjectCode]: true });
                }
            } catch (e) {
                toast.error('Failed to load class grades');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [classId]);

    // Update a single cell and mark row dirty
    const handleCellChange = useCallback(
        (profileId: string, subjCode: string, field: string, value: number, attCia?: string) => {
            setRows((prev) =>
                prev.map((row) => {
                    if (row.profileId !== profileId) return row;
                    const newSubjects = row._subjects.map((s) => {
                        if (s.subjectCode !== subjCode) return s;
                        if (attCia) {
                            return {
                                ...s,
                                attendance: {
                                    ...s.attendance,
                                    [attCia]: { ...s.attendance[attCia as 'cia1' | 'cia2' | 'cia3'], [field]: value },
                                },
                            };
                        }
                        return { ...s, [field]: value };
                    });

                    // Check dirty against original
                    const isDirty = JSON.stringify(newSubjects) !== JSON.stringify(originalRef.current[profileId]);
                    return { ...row, _subjects: newSubjects, _dirty: isDirty };
                })
            );
        },
        []
    );

    // Save only dirty rows
    const handleSave = async () => {
        const dirtyRows = rows.filter((r) => r._dirty && r.grade);
        if (dirtyRows.length === 0) {
            toast('No changes to save', { icon: 'ℹ️' });
            return;
        }

        setSaving(true);
        setSaveProgress({ done: 0, total: dirtyRows.length });

        const updates = dirtyRows.map((r) => ({
            gradeId: r.grade!._id,
            subjects: r._subjects,
        }));

        try {
            const res = await apiCLient.post('/mentors/batch-update-grades', { updates });
            const { successCount, total, errors } = res.data.data;

            setSaveProgress({ done: successCount, total });

            if (errors?.length) {
                toast.error(`${errors.length} record(s) failed to update`);
            } else {
                toast.success(`Saved ${successCount}/${total} student records`);
                // Clear dirty flags and update originals
                setRows((prev) =>
                    prev.map((row) => {
                        if (!row._dirty) return row;
                        originalRef.current[row.profileId] = deepClone(row._subjects);
                        return { ...row, _dirty: false };
                    })
                );
            }
        } catch (e) {
            toast.error('Failed to save grades');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveProgress(null), 3000);
        }
    };

    const dirtyCount = rows.filter((r) => r._dirty).length;
    const subjects = data?.subjects ?? [];

    const toggleSubject = (code: string) => {
        setExpandedSubj((prev) => ({ ...prev, [code]: !prev[code] }));
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm flex-shrink-0 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate">Edit Mode — Grades & Attendance</h2>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {rows.length} students · {subjects.length} subjects · {dirtyCount > 0 ? (
                                <span className="text-amber-600 font-bold">{dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</span>
                            ) : 'All changes saved'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    {saveProgress && !saving && (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-semibold">{saveProgress.done}/{saveProgress.total} updated</span>
                        </div>
                    )}
                    {saving && <ProgressBar done={saveProgress?.done ?? 0} total={saveProgress?.total ?? 1} />}
                    <button
                        onClick={handleSave}
                        disabled={saving || dirtyCount === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                            dirtyCount > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes {dirtyCount > 0 ? `(${dirtyCount})` : ''}
                    </button>
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center gap-6 px-6 py-2 bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 font-medium flex-shrink-0 flex-wrap gap-y-1">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Unsaved change</span>
                <span>CIA fields: max 20 marks each</span>
                <span>Attendance: attended/total lectures</span>
                <span className="ml-auto hidden sm:block">Scroll horizontally → subjects, sticky ← adm. no.</span>
            </div>

            {/* ── Sheet ── */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Loading grades...</span>
                    </div>
                </div>
            ) : rows.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <AlertCircle className="w-6 h-6 mr-2" /> No students enrolled in this class.
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <table className="border-collapse min-w-max w-full text-sm">
                        {/* ── Head ── */}
                        <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                            {/* Row 1: subject groups */}
                            <tr>
                                {/* Sticky identity columns */}
                                <th className="sticky left-0 z-30 bg-gray-50 border border-gray-200 px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[140px]">
                                    Adm. No.
                                </th>
                                <th className="sticky left-[140px] z-30 bg-gray-50 border border-gray-200 px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-[160px]">
                                    Name
                                </th>
                                {/* Subject group headers */}
                                {subjects.map((subj) => {
                                    const expanded = expandedSubj[subj.subjectCode];
                                    // grades cols: cia1/2/3/special/ext + attendance per cia (3 x 2 = 6)
                                    const colSpan = expanded ? 11 : 1;
                                    return (
                                        <th
                                            key={subj.subjectCode}
                                            colSpan={colSpan}
                                            className="border border-gray-200 bg-blue-50 text-blue-800 px-3 py-2 text-xs font-bold text-center whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors select-none"
                                            onClick={() => toggleSubject(subj.subjectCode)}
                                        >
                                            <div className="flex items-center justify-center gap-1.5">
                                                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                <span>{subj.subjectCode}</span>
                                                {!expanded && <span className="text-blue-500 font-normal">···</span>}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                            {/* Row 2: detailed column headers */}
                            <tr>
                                <th className="sticky left-0 z-30 bg-gray-50 border border-gray-200" />
                                <th className="sticky left-[140px] z-30 bg-gray-50 border border-gray-200" />
                                {subjects.map((subj) => {
                                    const expanded = expandedSubj[subj.subjectCode];
                                    if (!expanded) {
                                        return (
                                            <th key={subj.subjectCode} className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 font-semibold text-center whitespace-nowrap">
                                                {subj.subjectName.length > 12 ? subj.subjectName.slice(0, 12) + '…' : subj.subjectName}
                                            </th>
                                        );
                                    }
                                    return (
                                        <React.Fragment key={subj.subjectCode}>
                                            {['CIA1', 'CIA2', 'CIA3', 'SCIA', 'EXT'].map((h) => (
                                                <th key={h} className="border border-gray-200 bg-gray-50/80 px-2 py-2 text-xs text-gray-500 font-semibold text-center whitespace-nowrap min-w-[60px]">{h}</th>
                                            ))}
                                            {['C1 Att', 'C2 Att', 'C3 Att'].map((h) => (
                                                <th key={h} className="border border-gray-200 bg-indigo-50/60 px-2 py-2 text-xs text-indigo-600 font-semibold text-center whitespace-nowrap min-w-[100px]">{h}</th>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* ── Body ── */}
                        <tbody>
                            {rows.map((row, rIdx) => (
                                <tr
                                    key={row.profileId}
                                    className={`transition-colors group ${
                                        row._dirty
                                            ? 'bg-amber-50/60 hover:bg-amber-50'
                                            : rIdx % 2 === 0 ? 'bg-white hover:bg-gray-50/60' : 'bg-gray-50/30 hover:bg-gray-50'
                                    }`}
                                >
                                    {/* Sticky: Adm No */}
                                    <td className={`sticky left-0 z-10 border border-gray-200 px-4 py-2 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap ${row._dirty ? 'bg-amber-50' : rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <div className="flex items-center gap-2">
                                            {row._dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                                            {row.admissionNo || '—'}
                                        </div>
                                    </td>
                                    {/* Sticky: Name */}
                                    <td className={`sticky left-[140px] z-10 border border-gray-200 px-4 py-2 font-medium text-gray-900 whitespace-nowrap ${row._dirty ? 'bg-amber-50' : rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        {row.studentId?.firstName} {row.studentId?.lastName || ''}
                                    </td>

                                    {/* Subject cells */}
                                    {subjects.map((subj) => {
                                        const expanded = expandedSubj[subj.subjectCode];
                                        const s = row._subjects.find((x) => x.subjectCode === subj.subjectCode);
                                        if (!s) return <td key={subj.subjectCode} className="border border-gray-200 px-3 py-2 text-center text-gray-300">—</td>;

                                        if (!expanded) {
                                            // Collapsed: show avg CIA
                                            const avg = Math.round((s.cia1 + s.cia2 + s.cia3) / 3);
                                            return (
                                                <td key={subj.subjectCode} className="border border-gray-200 px-3 py-2 text-center">
                                                    <span className="text-xs font-semibold text-gray-500">{avg}</span>
                                                </td>
                                            );
                                        }

                                        return (
                                            <React.Fragment key={subj.subjectCode}>
                                                <td className="border border-gray-200 px-2 py-2 text-center">
                                                    <NumInput value={s.cia1} max={20} onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'cia1', v)} />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center">
                                                    <NumInput value={s.cia2} max={20} onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'cia2', v)} />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center">
                                                    <NumInput value={s.cia3} max={20} onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'cia3', v)} />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center">
                                                    <NumInput value={s.specialCia} max={20} onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'specialCia', v)} />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center">
                                                    <NumInput value={s.externalMarks} max={80} onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'externalMarks', v)} />
                                                </td>
                                                {(['cia1', 'cia2', 'cia3'] as const).map((cia) => (
                                                    <td key={cia} className="border border-gray-200 px-2 py-2">
                                                        <div className="flex items-center gap-1 justify-center">
                                                            <NumInput
                                                                value={s.attendance[cia].attended}
                                                                onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'attended', v, cia)}
                                                            />
                                                            <span className="text-gray-400 text-xs">/</span>
                                                            <NumInput
                                                                value={s.attendance[cia].total}
                                                                onChange={(v) => handleCellChange(row.profileId, subj.subjectCode, 'total', v, cia)}
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
