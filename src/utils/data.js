// utils/data.js
export const courses = [
  {
    id: 1,
    title: "Modern Standard Arabic for Beginners",
    description:
      "Learn the basics of Modern Standard Arabic (الفصحى), including pronunciation, alphabet, and simple phrases.",
    level: "Beginner",
    duration: "10h 15m",
    lessons: 26,
    teacher: "Dr. Layla Hassan",
    price: "$35",
    color: "from-[var(--primary-color)] to-[var(--accent-color)]",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    poster:
      "https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=1200&auto=format&fit=crop",
    units: [
      {
        unitId: 1,
        name: "Arabic Alphabet & Sounds",
        unitNumber: 1,
        lessonsCount: 6,
        videos: [
          "https://www.w3schools.com/html/mov_bbb.mp4",
          "https://www.w3schools.com/html/movie.mp4",
        ],
        pdfs: ["https://example.com/arabic-alphabet.pdf"],
      },
      {
        unitId: 2,
        name: "Basic Grammar & Simple Sentences",
        unitNumber: 2,
        lessonsCount: 8,
        videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
        pdfs: ["https://example.com/basic-grammar.pdf"],
      },
    ],
  },
  {
    id: 2,
    title: "Egyptian Arabic: Everyday Conversation",
    description:
      "Master common phrases and expressions in Egyptian Arabic (العامية) for travel, work, and social interactions.",
    level: "Intermediate",
    duration: "8h 30m",
    lessons: 22,
    teacher: "Omar Nasser",
    price: "$39",
    color: "from-[var(--secondary-color)] to-[var(--accent-color)]",
    video: "https://www.w3schools.com/html/movie.mp4",
    poster:
      "https://images.unsplash.com/photo-1543352632-2b6dc4aa417d?q=80&w=1200&auto=format&fit=crop",
    units: [
      {
        unitId: 1,
        name: "Essential Greetings & Introductions",
        unitNumber: 1,
        lessonsCount: 5,
        videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
        pdfs: ["https://example.com/greetings-introductions.pdf"],
      },
      {
        unitId: 2,
        name: "Everyday Dialogues",
        unitNumber: 2,
        lessonsCount: 7,
        videos: ["https://www.w3schools.com/html/movie.mp4"],
        pdfs: ["https://example.com/everyday-dialogues.pdf"],
      },
    ],
  },
  {
    id: 3,
    title: "Arabic Mastery: MSA & Egyptian Dialect",
    description:
      "A comprehensive course covering both Modern Standard Arabic (الفصحى) and Egyptian Arabic (العامية) for complete fluency.",
    level: "All Levels",
    duration: "15h 45m",
    lessons: 40,
    teacher: "Mariam Fathi",
    price: "$59",
    color: "from-[var(--accent-color)] to-[var(--primary-color)]",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    poster:
      "https://images.unsplash.com/photo-1581090700227-4c4d1a6a3f87?q=80&w=1200&auto=format&fit=crop",
    units: [
      {
        unitId: 1,
        name: "MSA Core Grammar & Vocabulary",
        unitNumber: 1,
        lessonsCount: 10,
        videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
        pdfs: ["https://example.com/msa-core.pdf"],
      },
      {
        unitId: 2,
        name: "Egyptian Arabic in Real Life",
        unitNumber: 2,
        lessonsCount: 12,
        videos: ["https://www.w3schools.com/html/movie.mp4"],
        pdfs: ["https://example.com/egyptian-real-life.pdf"],
      },
    ],
  },
];


export const teachers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 234 567 8901",
    class: "Grade 10A",
    status: "Active",
    enrollmentDate: "2023-09-15",
    gpa: 3.8,
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 234 567 8902",
    class: "Grade 11B",
    status: "Active",
    enrollmentDate: "2023-09-12",
    gpa: 3.9,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma.davis@email.com",
    phone: "+1 234 567 8903",
    class: "Grade 9C",
    status: "Inactive",
    enrollmentDate: "2023-09-20",
    gpa: 3.6,
    avatar: "ED",
  },
];

export const PRODUCTS = [
  {
    id: "b1",
    type: "books",
    subtype: "scientific",
    title: "MSA Grammar Companion",
    desc: "Master Modern Standard Arabic with clear explanations, interactive drills, and comprehensive answer Keys.",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop",
    rating: 4.8,
    price: 24.0,
    originalPrice: 32.0,
    tag: "Bestseller",
    reviews: 245,
    badge: "🏆",
  },
  {
    id: "b2",
    type: "books",
    subtype: "printed",
    title: "Egyptian Phrasebook",
    desc: "Essential everyday dialogues with accurate phonetics and cultural context. Your gateway to authentic Egyptian Arabic.",
    image:
      "https://images.unsplash.com/photo-1526312426976-593c2b9991f5?w=800&h=600&fit=crop",
    rating: 4.6,
    price: 18.5,
    originalPrice: 25.0,
    reviews: 189,
    badge: "📚",
  },
  {
    id: "b3",
    type: "books",
    subtype: "digital",
    title: "Digital Story Adventures",
    desc: "Engaging animated digital Arabic stories designed for young readers with audio narration.",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
    rating: 4.7,
    price: 14.0,
    originalPrice: 20.0,
    reviews: 120,
    badge: "📖",
  },
  {
    id: "s1",
    type: "supplies",
    title: "Study Planner (Undated)",
    desc: "Premium undated planner with weekly layouts, habit tracker, and thick paper.",
    image:
      "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=800&h=600&fit=crop",
    rating: 4.7,
    price: 12.0,
    originalPrice: 16.0,
    tag: "New",
    reviews: 98,
    badge: "✨",
  },
  {
    id: "s2",
    type: "supplies",
    title: "Flashcards Set (500 pcs)",
    desc: "Professional-grade flashcards with rounded corners and smooth finish.",
    image:
      "https://images.unsplash.com/photo-1511974035430-5de47d3b95da?w=800&h=600&fit=crop",
    rating: 4.5,
    price: 14.0,
    reviews: 156,
    badge: "🎯",
  },
  {
    id: "v1",
    type: "videos",
    title: "Advanced Syntax Masterclass",
    desc: "Comprehensive HD video lessons with interactive quizzes and downloadable PDF notes.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
    rating: 4.9,
    price: 39.0,
    originalPrice: 55.0,
    tag: "Top Rated",
    reviews: 312,
    badge: "🚀",
  },
  {
    id: "v2",
    type: "videos",
    title: "Pronunciation Drills Pack",
    desc: "Intensive pronunciation training with minimal pairs, stress patterns, and rhythm practice.",
    image:
      "https://images.unsplash.com/photo-1520974722079-6ca4f3c6bbf0?w=800&h=600&fit=crop",
    rating: 4.7,
    price: 29.0,
    originalPrice: 40.0,
    reviews: 201,
    badge: "🎵",
  },
];


export const reservations = [
  {
    id: "r1",
    teacher: { name: "Sarah Wilson", avatar: "" },
    title: "1:1 Arabic Coaching",
    note: "Bring your last homework for review.",
    start: "2025-08-05T17:00:00+02:00",
    durationMin: 60,
    mode: "Online",
    status: "upcoming", // upcoming | completed | canceled
    priority: "normal",
  },
  {
    id: "r2",
    teacher: { name: "Omar El-Sayed", avatar: "" },
    title: "Dialect Practice Session",
    note: "Roleplay dialogues: directions & bargaining.",
    start: "2025-08-01T19:30:00+02:00",
    durationMin: 45,
    mode: "Online",
    status: "completed",
    priority: "low",
  },
  {
    id: "r3",
    teacher: { name: "Dr. Amira Hassan", avatar: "" },
    title: "Advanced Syntax Review",
    note: "Reschedule needed due to conflict.",
    start: "2025-07-28T18:00:00+02:00",
    durationMin: 60,
    mode: "Campus Room B",
    status: "canceled",
    priority: "high",
  },
];

export const finance_transactions =    [
  { 
    id: 1, 
    date: "2025-08-01", 
    description: "Course Payment - English", 
    type: "income", 
    amount: 250, 
    status: "completed",
    category: "Course Fees",
    paymentMethod: "Credit Card",
    reference: "TXN001"
  },
  { 
    id: 2, 
    date: "2025-08-02", 
    description: "Instructor Salary - July", 
    type: "expense", 
    amount: 1200, 
    status: "paid",
    category: "Salaries",
    paymentMethod: "Bank Transfer",
    reference: "TXN002"
  },
  { 
    id: 3, 
    date: "2025-08-04", 
    description: "Book Sale Revenue", 
    type: "income", 
    amount: 850, 
    status: "completed",
    category: "Sales",
    paymentMethod: "Cash",
    reference: "TXN003"
  },
  { 
    id: 4, 
    date: "2025-08-05", 
    description: "Electricity Bill - July", 
    type: "expense", 
    amount: 160, 
    status: "pending",
    category: "Utilities",
    paymentMethod: "Auto Debit",
    reference: "TXN004"
  },
  { 
    id: 5, 
    date: "2025-08-06", 
    description: "Workshop Registration", 
    type: "income", 
    amount: 450, 
    status: "completed",
    category: "Events",
    paymentMethod: "PayPal",
    reference: "TXN005"
  },
  { 
    id: 6, 
    date: "2025-08-07", 
    description: "Office Supplies", 
    type: "expense", 
    amount: 75, 
    status: "paid",
    category: "Supplies",
    paymentMethod: "Credit Card",
    reference: "TXN006"
  }
]

export const general_data = [
  {
    id: "evt_001",
    type: "STUDENT_REGISTERED",
    at: "2025-08-11T07:45:12.000Z",
    actor: { id: "stu_1023", role: "student", name: "Omar Ali" },
    metadata: { source: "signup_form", email: "omar.ali@example.com" },
    view: {
      title: "تسجيل طالب جديد",
      badge: { text: "طالب", color: "emerald" },
      details: [
        { label: "الطالب", value: "Omar Ali" },
        { label: "التاريخ", value: "2025-08-11 10:45 (Africa/Cairo)" },
        { label: "المصدر", value: "نموذج التسجيل" },
      ],
    },
  },
  {
    id: "evt_002",
    type: "PAYMENT_RECEIVED",
    at: "2025-08-11T08:10:03.000Z",
    actor: { id: "stu_1023", role: "student", name: "Omar Ali" },
    target: { id: "sys_billing", role: "system", name: "Billing" },
    amount: 49,
    currency: "USD",
    metadata: { courseId: "crs_msa_beg", method: "Card ••4321", invoiceId: "inv_7751" },
    view: {
      title: "دفع رسوم",
      badge: { text: "دفعة", color: "blue" },
      details: [
        { label: "الطالب", value: "Omar Ali" },
        { label: "المبلغ", value: "49 USD" },
        { label: "الدورة", value: "MSA for Beginners" },
        { label: "طريقة الدفع", value: "Card ••4321" },
        { label: "التاريخ", value: "2025-08-11 11:10 (Africa/Cairo)" },
      ],
    },
  },
  {
    id: "evt_003",
    type: "STUDENT_ASSIGNED_TEACHER",
    at: "2025-08-11T09:02:55.000Z",
    actor: { id: "stu_1023", role: "student", name: "Omar Ali" },
    target: { id: "tch_209", role: "teacher", name: "Mariam Fathi" },
    metadata: { subject: "Egyptian Arabic", reason: "Student choice", channel: "in-app" },
    view: {
      title: "تسجيل مع مدرس",
      badge: { text: "إسناد مدرس", color: "violet" },
      details: [
        { label: "الطالب", value: "Omar Ali" },
        { label: "المدرس", value: "Mariam Fathi" },
        { label: "اللهجة/المادة", value: "Arabic (Egyptian)" },
        { label: "التاريخ", value: "2025-08-11 12:02 (Africa/Cairo)" },
      ],
    },
  },
  {
    id: "evt_004",
    type: "COURSE_ENROLLED",
    at: "2025-08-11T09:15:21.000Z",
    actor: { id: "stu_1188", role: "student", name: "Lina Ahmed" },
    metadata: { courseId: "crs_egy_conv", courseTitle: "Egyptian Arabic: Everyday Conversation" },
    view: {
      title: "التحاق بدورة",
      badge: { text: "دورة", color: "teal" },
      details: [
        { label: "الطالب", value: "Lina Ahmed" },
        { label: "الدورة", value: "Egyptian Arabic: Everyday Conversation" },
        { label: "التاريخ", value: "2025-08-11 12:15 (Africa/Cairo)" },
      ],
    },
  },
  {
    id: "evt_005",
    type: "LESSON_COMPLETED",
    at: "2025-08-11T09:55:02.000Z",
    actor: { id: "stu_1188", role: "student", name: "Lina Ahmed" },
    metadata: { courseId: "crs_egy_conv", lessonId: "ls_05", lessonTitle: "Greetings & Small Talk" },
    view: {
      title: "إنهاء درس",
      badge: { text: "تقدم", color: "amber" },
      details: [
        { label: "الطالب", value: "Lina Ahmed" },
        { label: "الدرس", value: "Greetings & Small Talk" },
        { label: "الدورة", value: "Egyptian Arabic: Everyday Conversation" },
        { label: "التاريخ", value: "2025-08-11 12:55 (Africa/Cairo)" },
      ],
    },
  },
  {
    id: "evt_006",
    type: "TEACHER_CREATED_COURSE",
    at: "2025-08-10T18:20:40.000Z",
    actor: { id: "tch_209", role: "teacher", name: "Mariam Fathi" },
    metadata: { courseId: "crs_msa_inter", courseTitle: "MSA Core Grammar & Vocabulary" },
    view: {
      title: "إنشاء دورة جديدة",
      badge: { text: "مدرس", color: "pink" },
      details: [
        { label: "المدرس", value: "Mariam Fathi" },
        { label: "الدورة", value: "MSA Core Grammar & Vocabulary" },
        { label: "التاريخ", value: "2025-08-10 21:20 (Africa/Cairo)" },
      ],
    },
  },
  {
    id: "evt_007",
    type: "TEACHER_UPDATED_LESSON",
    at: "2025-08-10T19:05:12.000Z",
    actor: { id: "tch_311", role: "teacher", name: "Omar Nasser" },
    metadata: {
      courseId: "crs_egy_conv",
      lessonId: "ls_02",
      oldTitle: "Pronunciation Basics",
      newTitle: "Pronunciation & Listening Drills",
    },
    view: {
      title: "تعديل محتوى درس",
      badge: { text: "تحديث", color: "slate" },
      details: [
        { label: "المدرس", value: "Omar Nasser" },
        { label: "الدرس", value: "Pronunciation & Listening Drills" },
        { label: "الدورة", value: "Egyptian Arabic: Everyday Conversation" },
        { label: "التاريخ", value: "2025-08-10 22:05 (Africa/Cairo)" },
      ],
    },
  },
];
