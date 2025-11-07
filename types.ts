
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 encoded image for multimodal input
  data?: any;
  functionName?: string;
  feedback?: 'like' | 'dislike';
  isError?: boolean;
}

export interface Hospital {
    name: string;
    location: string;
    contact: string;
}

export interface AppointmentConfirmation {
    status: string;
    confirmationId: string;
    details: string;
    cost: number;
    patientName: string;
    doctorName: string;
    hospitalName: string;
    date: string;
    time: string;
    mobileNo: string;
    emailId: string;
}

export interface AppointmentReminder {
    title: string;
    message: string;
    confirmationId: string;
    patientName: string;
    doctorName: string;
    hospitalName: string;
    date: string;
    time: string;
}

export interface RescheduleConfirmation {
    status: string;
    confirmationId: string;
    patientName: string;
    doctorName: string;
    hospitalName: string;
    originalDate: string;
    originalTime: string;
    newDate: string;
    newTime: string;
    message: string;
}

export interface CancelConfirmation {
    status: string;
    confirmationId: string;
    message: string;
}

export interface PaymentRecord {
    transactionId: string;
    date: string;
    amount: number;
    appointmentId: string;
    hospitalName: string;
}

export interface PaymentHistory {
    patientId: string;
    payments: PaymentRecord[];
}

export interface MedicalHistory {
    patientId: string;
    summary: string;
    allergies: string[];
    pastConditions: string[];
    medications: { name: string; dosage: string; }[];
}

export interface MedicalEvent {
    year: number;
    event: string;
    type: 'diagnosis' | 'procedure' | 'medication_change';
}

export interface HealthTrend {
    observation: string;
    period: string;
    implication: 'positive' | 'negative' | 'neutral';
}

export interface PatientHistoryInsights {
    patientId: string;
    summary: string;
    keyInsights: string[];
    trends: HealthTrend[];
    timeline: MedicalEvent[];
    discussionPoints: string[];
}


export interface PatientRegistration {
    status: string;
    patientId: string;
    patientName: string;
    dateOfBirth: string;
    gender: string;
    mobileNo: string;
    emailId: string;
}

export interface Prescription {
    status: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    doctorName: string;
    date: string;
    medications: {
        name: string;
        dosage: string;
        instructions: string;
    }[];
}

export interface EmergencyInfo {
    title: string;
    message: string;
    contacts: {
        name: string;
        number: string;
    }[];
}

export interface SymptomAnalysis {
    title: string;
    analysis: string;
    recommendation: string;
    disclaimer: string;
}

export interface HealthTips {
    patientId: string;
    tips: {
        category: string;
        tip: string;
    }[];
}

export interface FollowUp {
    title: string;
    message: string;
    patientName: string;
    doctorName: string;
    appointmentDate: string;
}

export interface Medication {
    name: string;
    dosage: string;
    instructions: string;
    refillsLeft: number;
}

export interface CurrentPrescriptions {
    patientId: string;
    medications: Medication[];
}