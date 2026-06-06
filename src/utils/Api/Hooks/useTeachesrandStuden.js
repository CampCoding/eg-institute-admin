import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../ApiFunctions/AllFetchData"; // تأكد من صحة مسار ملف الـ Instance

// ==========================================
// 1. API Functions (تعديل المسارات لـ Relative Paths)
// ==========================================

// جلب كل الطلاب
export const getallStudents = async function getallStudents() {
  // شيلنا الـ URL الكامل وسبنا اللي بعد الـ admin/
  const res = await API.get("/students/select_students.php");
  return res.data;
};

// ربط طالب بمدرس
export const getAssignedStudents = async function getAssignedStudents({ teacher_id, studentId }) {
  const res = await API.post("/teachers/assign_student_to_teacher.php", {
    "teacher_id": teacher_id,
    "student_id": studentId
  });
  return res.data;
};

// جلب طلاب مدرس معين
export const getStudentTeacher = async function getStudentTeacher(teacher_id) {
  if (!teacher_id) return null;
  const res = await API.post(`/teachers/select_teacher_students.php`, {
    "teacher_id": teacher_id
  });
  return res.data;
};

// جلب مدرسين طالب معين
export const getTeacherStudent = async function getTeacherStudent(studentId) {
  if (!studentId) return null;
  const res = await API.post(`/students/select_student_teachers.php`, {
    "student_id": studentId
  });
  return res.data;
};

// ==========================================
// 2. Custom Hook (كما هو بدون تغيير)
// ==========================================
export const useGetStudentTeacher = (teacherId = null, studentId = null) => {
  const queryClient = useQueryClient();

  const allstudentsQuery = useQuery({
    queryKey: ["all-students"],
    queryFn: () => getallStudents(),
  });

  const assignStudentMutation = useMutation({
    mutationFn: ({ teacher_id, studentId }) => getAssignedStudents({ teacher_id, studentId }),
    onSuccess: () => {
      toast.success("Assigned student successfully");
      queryClient.invalidateQueries({ queryKey: ["students-for-teacher", teacherId] });
    },
    onError: () => {
      toast.error("Failed to assign student");
    }
  });

  const allStudentsForTeacherQuery = useQuery({
    queryKey: ["students-for-teacher", teacherId],
    queryFn: () => getStudentTeacher(teacherId),
    enabled: !!teacherId,
  });

  const allTeachersForStudentQuery = useQuery({
    queryKey: ["teachers-for-student", studentId],
    queryFn: () => getTeacherStudent(studentId),
    enabled: !!studentId,
  });

  return {
    allstudentsQuery,
    assignStudentMutation,
    allStudentsForTeacherQuery,
    allTeachersForStudentQuery
  };
};