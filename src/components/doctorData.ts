import doctorOne from '../assets/doc1.avif'
import doctorTwo from '../assets/doc2.webp'
import doctorThree from '../assets/doctor-img1.jpeg'
import doctorFocusOne from '../assets/heart img2.png'
import doctorFocusTwo from '../assets/2d echo test (1).webp'
import doctorFocusThree from '../assets/mentalhealth.png'

export type DoctorProfile = {
  slug: string
  fullName: string
  qualification: string
  experience: string
  specialization: string
  about: string
  workingHours: string
  contactNumber: string
  availability: string
  image: string
  focusImage: string
  focusImageAlt: string
}

export const doctorProfiles: DoctorProfile[] = [
  {
    slug: 'nethmi-perera',
    fullName: 'Dr. Nethmi Perera',
    qualification: 'MBBS, MD (General Medicine)',
    experience: '8 years',
    specialization: 'General Physician',
    about:
      'Dr. Nethmi Perera provides complete primary care for students and staff, with a focus on early diagnosis, preventive medicine, and long-term wellness planning.',
    workingHours: 'Monday to Friday: 8:30 AM - 4:30 PM',
    contactNumber: '+94 11 234 5678',
    availability: 'Available Today',
    image: doctorOne,
    focusImage: doctorFocusOne,
    focusImageAlt: 'Cardiac care equipment and heart monitoring graphics',
  },
  {
    slug: 'kavindu-fernando',
    fullName: 'Dr. Kavindu Fernando',
    qualification: 'MBBS, MD (Emergency Medicine)',
    experience: '5 years',
    specialization: 'Emergency Medicine',
    about:
      'Dr. Kavindu Fernando handles urgent and acute medical cases, triage, and emergency stabilization while coordinating rapid response support for campus incidents.',
    workingHours: 'Daily: 24/7 Emergency Coverage',
    contactNumber: '+94 11 334 5678',
    availability: '24/7 Support',
    image: doctorTwo,
    focusImage: doctorFocusTwo,
    focusImageAlt: 'Advanced diagnostic scan equipment in emergency support',
  },
  {
    slug: 'isuri-jayasinghe',
    fullName: 'Dr. Isuri Jayasinghe',
    qualification: 'MBBS, MD (Psychiatry)',
    experience: '7 years',
    specialization: 'Mental Health Specialist',
    about:
      'Dr. Isuri Jayasinghe supports mental wellbeing through confidential consultations, stress management plans, and student-centered counseling interventions.',
    workingHours: 'Monday to Saturday: 9:00 AM - 5:00 PM',
    contactNumber: '+94 11 434 5678',
    availability: 'Counseling Slots Open',
    image: doctorThree,
    focusImage: doctorFocusThree,
    focusImageAlt: 'Mental health counseling and wellness care environment',
  },
  {
    slug: 'amila-senanayake',
    fullName: 'Dr. Amila Senanayake',
    qualification: 'MBBS, MD (Cardiology)',
    experience: '9 years',
    specialization: 'Cardiology Specialist',
    about:
      'Dr. Amila Senanayake focuses on heart health assessments, ECG interpretation, and long-term cardiovascular risk management for students and staff.',
    workingHours: 'Monday to Friday: 9:00 AM - 5:00 PM',
    contactNumber: '+94 11 534 5678',
    availability: 'Next Slot: 11:30 AM',
    image: doctorOne,
    focusImage: doctorFocusOne,
    focusImageAlt: 'Heart care and cardiology diagnostic focus',
  },
  {
    slug: 'tharushi-ranasinghe',
    fullName: 'Dr. Tharushi Ranasinghe',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '6 years',
    specialization: 'Family and Student Health',
    about:
      'Dr. Tharushi Ranasinghe provides preventive care, vaccination guidance, and common illness management with a student-friendly consultation approach.',
    workingHours: 'Monday to Saturday: 8:00 AM - 3:00 PM',
    contactNumber: '+94 11 634 5678',
    availability: 'Available This Afternoon',
    image: doctorTwo,
    focusImage: doctorFocusTwo,
    focusImageAlt: 'Student health diagnostics and preventive screening',
  },
]
