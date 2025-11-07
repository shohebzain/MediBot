import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { initializeChat, sendMessageToGemini, startChatWithHistory } from './services/geminiService';
import { getCurrentUser, logoutUser } from './services/authService';
import type { Message, AppointmentReminder, FollowUp, User } from './types';
import { SUGGESTION_CHIPS, FUNCTION_NAMES } from './constants';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SuggestionChip } from './components/SuggestionChip';
import { LogoIcon } from './components/icons/LogoIcon';
import { Dashboard } from './components/Dashboard';
import { VoiceChatModal } from './components/VoiceChatModal';
import { CalendarModal } from './components/CalendarModal';
import { Auth } from './components/Auth';
import { Toast, useToast } from './components/Toast';

const TypingIndicator: React.FC = () => (
  <div role="status" aria-label="Bot is typing" className="flex items-start gap-3 my-4">
    <div aria-hidden="true" className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      <LogoIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
    </div>
    <div aria-hidden="true" className="p-4 rounded-2xl max-w-md lg:max-w-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow flex items-center">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [appointmentContext, setAppointmentContext] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const { toast, showToast } = useToast();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      const chatSession = initializeChat();
      setChat(chatSession);
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: `Hello, ${user.name}! I'm MediBot, your advanced AI health assistant. You can book appointments, analyze symptoms by uploading an image, or start a voice chat. How can I assist you today?`,
        },
      ]);
    }
    setIsAuthLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    const user = getCurrentUser();
    setIsAuthenticated(true);
    setCurrentUser(user);
    const chatSession = initializeChat();
    setChat(chatSession);
    setMessages([
        {
          id: 'init',
          role: 'model',
          text: `Hello, ${user?.name}! I'm MediBot, your advanced AI health assistant. You can book appointments, analyze symptoms by uploading an image, or start a voice chat. How can I assist you today?`,
        },
    ]);
    showToast('Successfully logged in!', 'success');
  };
  
  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setChat(null);
    setMessages([]);
    showToast('You have been logged out.', 'info');
  };

  useEffect(() => {
    if (view === 'chat' && isAuthenticated) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view, isAuthenticated]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSendMessage = async (userMessage: string, imageFile?: File | null) => {
    if (!chat || isLoading) return;

    setIsLoading(true);

    let imageB64: string | undefined = undefined;
    let imageDataUrl: string | undefined = undefined;
    if (imageFile) {
        try {
            imageB64 = await fileToBase64(imageFile);
            imageDataUrl = `data:${imageFile.type};base64,${imageB64}`;
        } catch (error) {
            console.error("Error reading file:", error);
            const errorMessage: Message = {
                id: `${Date.now().toString()}-error`,
                role: 'model',
                text: "Sorry, I couldn't read the image file you uploaded. Please try again with a different file.",
                isError: true,
            };
            setMessages((prev) => [...(prev || []), errorMessage]);
            setIsLoading(false);
            return;
        }
    }
    
    const newUserMessage: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: userMessage,
        image: imageDataUrl,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
        const imagePayload = imageFile ? { b64: imageB64!, mimeType: imageFile.type } : undefined;
        const { text: modelResponseText, image: modelImage, data, functionName } = await sendMessageToGemini(chat, userMessage, imagePayload);
        
        const newModelMessage: Message = { 
          id: `${Date.now().toString()}-bot`, 
          role: 'model', 
          text: modelResponseText,
          image: modelImage,
          data,
          functionName,
        };
        setMessages((prev) => [...prev, newModelMessage]);

        // Handle opening the calendar
        if (functionName === FUNCTION_NAMES.PROMPT_FOR_DATE_TIME) {
            setAppointmentContext(data);
            setIsCalendarOpen(true);
        }


        // Handle automated follow-ups and reminders
        if (functionName === FUNCTION_NAMES.SCHEDULE_APPOINTMENT && data?.status === 'Success') {
            // Immediate reminder
            setTimeout(() => {
                const reminderData: AppointmentReminder = {
                    title: "Appointment Reminder",
                    message: "This is a friendly reminder for your upcoming appointment. Please arrive 15 minutes early.",
                    confirmationId: data.confirmationId,
                    patientName: data.patientName,
                    doctorName: data.doctorName,
                    hospitalName: data.hospitalName,
                    date: data.date,
                    time: data.time,
                };
                const reminderMessage: Message = {
                    id: `${Date.now()}-reminder`,
                    role: 'model',
                    text: "Just a friendly reminder about your upcoming appointment.",
                    functionName: FUNCTION_NAMES.SEND_APPOINTMENT_REMINDER,
                    data: reminderData,
                };
                setMessages((prev) => [...prev, reminderMessage]);
            }, 5000); // 5-second delay

            // Proactive follow-up (simulated for 1 day later)
            setTimeout(() => {
                 const followUpData: FollowUp = {
                    title: "Post-Appointment Check-in",
                    message: `Hi ${data.patientName}, this is a friendly check-in following your appointment. We hope you're feeling well. If you have any questions or concerns, please don't hesitate to reach out.`,
                    patientName: data.patientName,
                    doctorName: data.doctorName,
                    appointmentDate: data.date,
                };
                const followUpMessage: Message = {
                    id: `${Date.now()}-followup`,
                    role: 'model',
                    text: `Checking in about your recent appointment.`,
                    functionName: FUNCTION_NAMES.SEND_APPOINTMENT_FOLLOW_UP,
                    data: followUpData,
                };
                setMessages((prev) => [...prev, followUpMessage]);
            }, 10000); // 10-second delay for demo
        }
    } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
        const errorMessage: Message = {
            id: `${Date.now().toString()}-error`,
            role: 'model',
            text: errorMessageText,
            isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const addMessageFromVoice = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleEditMessage = async (messageId: string, newText: string) => {
    const editIndex = messages.findIndex(m => m.id === messageId);
    if (editIndex === -1) return;

    // History is everything *before* the edited message
    const history = messages.slice(0, editIndex);
    const originalMessage = messages[editIndex];
    
    // The user's edited message. We don't handle image changes on edit for now.
    const editedUserMessage: Message = { 
        ...originalMessage, 
        text: newText,
    };
    
    // Truncate the conversation from the point of edit
    const updatedMessages = [...history, editedUserMessage];
    setMessages(updatedMessages);

    setIsLoading(true);

    try {
        // For simplicity, we assume image doesn't change on edit. If the original message had an image, re-use it.
        const imagePayload = originalMessage.image 
            ? { b64: originalMessage.image.split(',')[1], mimeType: originalMessage.image.split(';')[0].split(':')[1] || 'image/jpeg' } 
            : undefined;

        // Re-run the conversation from this point with a new chat instance that has the correct history
        const { chat: newChat, response } = await startChatWithHistory(history, newText, imagePayload);
        
        setChat(newChat); // Update the main chat instance

        const newModelMessage: Message = { 
            id: `${Date.now().toString()}-bot`, 
            role: 'model', 
            text: response.text,
            image: response.image,
            data: response.data,
            functionName: response.functionName,
        };
        
        // Append the new model response.
        setMessages((prev) => [...prev, newModelMessage]);

        // Handle opening the calendar
        if (response.functionName === FUNCTION_NAMES.PROMPT_FOR_DATE_TIME) {
            setAppointmentContext(response.data);
            setIsCalendarOpen(true);
        }

    } catch (error) {
        console.error("Failed to send message after edit:", error);
        const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
        const errorMessage: Message = {
            id: `${Date.now().toString()}-error`,
            role: 'model',
            text: errorMessageText,
            isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    setMessages(messages.map(m => 
      m.id === messageId 
        ? { ...m, feedback: m.feedback === feedback ? undefined : feedback } 
        : m
    ));
  };
  
  const handleDateSelect = (date: Date, time: string) => {
    setIsCalendarOpen(false);
    if (!appointmentContext) return;
    
    const dateString = date.toISOString().split('T')[0];
    const message = `I'd like to book the appointment for ${appointmentContext.patientName || 'me'} with ${appointmentContext.doctorName || 'any available doctor'} at ${appointmentContext.hospitalName || 'any hospital'} on ${dateString} at ${time}. My number is ${appointmentContext.mobileNo || 'not provided'} and email is ${appointmentContext.emailId || 'not provided'}.`;
    
    handleSendMessage(message);
    setAppointmentContext(null);
  };
  
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
            <LogoIcon className="w-12 h-12 text-blue-500 animate-pulse mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 mt-4">Initializing MediBot...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} />}
            <Auth onAuthSuccess={handleAuthSuccess} showToast={showToast} />
        </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Header view={view} setView={setView} isAuthenticated={isAuthenticated} user={currentUser} onLogout={handleLogout} />
      {toast && <Toast message={toast.message} type={toast.type} />}

      {isVoiceChatOpen && <VoiceChatModal onClose={() => setIsVoiceChatOpen(false)} onNewMessage={addMessageFromVoice} />}
      {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} onDateTimeSelect={handleDateSelect} context={appointmentContext} />}

      {view === 'dashboard' ? (
          <Dashboard />
      ) : (
        <div className="flex-1 flex flex-col pt-20">
          <main className="flex-1 overflow-y-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} isLoading={isLoading} onEditMessage={handleEditMessage} onFeedback={handleFeedback} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          </main>
          <div className="max-w-3xl w-full mx-auto">
            {!isLoading && messages.length <= 1 && (
                <div className="px-4 md:px-6 py-4 overflow-x-auto">
                    <div className="flex items-center space-x-2">
                        {SUGGESTION_CHIPS.map((chip, index) => (
                            <SuggestionChip key={index} text={chip} onClick={handleSendMessage} />
                        ))}
                    </div>
                </div>
            )}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onToggleVoiceChat={() => setIsVoiceChatOpen(true)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
