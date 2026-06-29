import { Hospital } from './types';

export const FUNCTION_NAMES = {
  // Fix: Corrected a typo in the constant name from SCHEDULE_APPOINTPOINTMENT to SCHEDULE_APPOINTMENT.
  SCHEDULE_APPOINTMENT: 'scheduleAppointment',
  PROMPT_FOR_DATE_TIME: 'promptForDateTimeSelection',
  // Fix: Corrected a typo in the constant name from RESCHEDULE_APPOINTPOINTMENT to RESCHEDULE_APPOINTMENT.
  RESCHEDULE_APPOINTMENT: 'rescheduleAppointment',
  // Fix: Corrected a typo in the constant name from CANCEL_APPOINTPOINTMENT to CANCEL_APPOINTMENT.
  CANCEL_APPOINTMENT: 'cancelAppointment',
  GET_TREATMENT_SCHEDULE: 'getTreatmentSchedule',
  ANALYZE_PATIENT_HISTORY: 'analyzePatientHistory',
  ANALYZE_PATIENT_HISTORY_TRENDS: 'analyzePatientHistoryTrends',
  FIND_DOCTOR: 'findDoctor',
  GET_HOSPITAL_INFO: 'getHospitalInfo', 
  GET_HOSPITALS: 'getHospitals',
  MAKE_PAYMENT: 'makePayment',
  GET_PAYMENT_HISTORY: 'getPaymentHistory',
  SEND_CONFIRMATION_EMAIL: 'sendConfirmationEmail',
  REGISTER_PATIENT: 'registerPatient',
  MANAGE_PRESCRIPTION: 'managePrescription',
  HANDLE_EMERGENCY: 'handleEmergency',
  SEND_APPOINTMENT_REMINDER: 'sendAppointmentReminder',
  ANALYZE_SYMPTOM_IMAGE: 'analyzeSymptomImage',
  GENERATE_HEALTH_TIPS: 'generateHealthTips',
  SEND_APPOINTMENT_FOLLOW_UP: 'sendAppointmentFollowUp',
  GENERATE_IMAGE: 'generateImage',
};

export const HOSPITALS: Hospital[] = [
    { name: 'Apollo Hospitals, Jubilee Hills', location: 'Jubilee Hills, Hyderabad', contact: '1860-500-1066' },
    { name: 'Yashoda Hospitals, Secunderabad', location: 'Secunderabad, Hyderabad', contact: '040-4567-4567' },
    { name: 'KIMS Hospitals, Secunderabad', location: 'Secunderabad, Hyderabad', contact: '040-4488-5000' },
    { name: 'Continental Hospitals, Gachibowli', location: 'Gachibowli, Hyderabad', contact: '040-6700-0000' },
];

export const SUGGESTION_CHIPS = [
    "I'm having chest pain and difficulty breathing, I need help!",
    "Book an appointment at Apollo Hospitals with Dr. Smith for tomorrow, my number is 999-888-7777 and email is test@example.com.",
    "Draw a picture of a friendly robot doctor.",
    "Reschedule my appointment CONF1234 to tomorrow at 3 PM.",
    "Cancel my appointment CONF5678.",
    "Register a new patient named Jane Doe, born 1992-03-22, female, mobile 555-444-3333, email is jane.d@example.com.",
    "List all available hospitals in Hyderabad.",
    "Tell me more about Apollo Hospitals.",
    "Show payment history for patient ID 12345.",
    "Analyze patient history trends for ID 54321.",
    "Manage prescription for patient ID 54321.",
    "Generate health tips for patient ID 54321.",
    "Get wellness tips for patient 12345.",
    "Pay 500 for appointment APT1234.",
];
