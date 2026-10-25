import React, { useState, useRef, useEffect } from "react";
import { chatApi } from "@/api/backendClient";
import { MessageCircle, X, Send, Loader2, User, Bot, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const translations = {
  de: {
    title: "EinStein Support",
    subtitle: "Wie können wir helfen?",
    placeholder: "Schreiben Sie Ihre Nachricht...",
    welcome: "Hallo! 👋 Willkommen bei EinStein Institut. Ich bin Ihr virtueller Assistent. Wie kann ich Ihnen heute helfen?",
    quickQuestions: [
      "Welche Dienstleistungen bieten Sie an?",
      "Wie kann ich buchen?",
      "Was kostet eine Nachhilfestunde?",
      "Sprechen Sie Arabisch?"
    ],
    escalate: "Mit Mitarbeiter sprechen",
    escalateMessage: "Ich verbinde Sie mit unserem Team. Sie können uns erreichen unter:",
    thinking: "Schreibt...",
    errorMessage: "Entschuldigung, es gab ein Problem. Bitte versuchen Sie es erneut."
  },
  ar: {
    title: "دعم آينشتاين",
    subtitle: "كيف يمكننا مساعدتك؟",
    placeholder: "اكتب رسالتك...",
    welcome: "مرحباً! 👋 أهلاً بك في معهد آينشتاين. أنا مساعدك الافتراضي. كيف يمكنني مساعدتك اليوم؟",
    quickQuestions: [
      "ما هي الخدمات التي تقدمونها؟",
      "كيف يمكنني الحجز؟",
      "كم تكلفة الدرس الخصوصي؟",
      "هل تتحدثون العربية؟"
    ],
    escalate: "التحدث مع موظف",
    escalateMessage: "سأوصلك بفريقنا. يمكنك التواصل معنا عبر:",
    thinking: "يكتب...",
    errorMessage: "عذراً، حدثت مشكلة. يرجى المحاولة مرة أخرى."
  },
  en: {
    title: "EinStein Support",
    subtitle: "How can we help?",
    placeholder: "Type your message...",
    welcome: "Hello! 👋 Welcome to EinStein Institut. I'm your virtual assistant. How can I help you today?",
    quickQuestions: [
      "What services do you offer?",
      "How can I book?",
      "How much does tutoring cost?",
      "Do you speak Arabic?"
    ],
    escalate: "Talk to a human",
    escalateMessage: "I'll connect you with our team. You can reach us at:",
    thinking: "Typing...",
    errorMessage: "Sorry, there was a problem. Please try again."
  },
  es: {
    title: "Soporte EinStein",
    subtitle: "¿Cómo podemos ayudarte?",
    placeholder: "Escribe tu mensaje...",
    welcome: "¡Hola! 👋 Bienvenido al Instituto EinStein. Soy tu asistente virtual. ¿Cómo puedo ayudarte hoy?",
    quickQuestions: [
      "¿Qué servicios ofrecen?",
      "¿Cómo puedo reservar?",
      "¿Cuánto cuesta una clase particular?",
      "¿Hablan español?"
    ],
    escalate: "Hablar con una persona",
    escalateMessage: "Te conectaré con nuestro equipo. Puedes contactarnos en:",
    thinking: "Escribiendo...",
    errorMessage: "Lo siento, hubo un problema. Por favor inténtalo de nuevo."
  }
};

export default function ChatBot({ lang = "de" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const messagesEndRef = useRef(null);
  const t = translations[lang] || translations.de;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.welcome }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatApi.respond({ message: text, lang });
      setMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: t.errorMessage }]);
    }

    setIsLoading(false);
  };

  const handleEscalate = () => {
    setShowEscalate(true);
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: t.escalateMessage,
      isEscalate: true 
    }]);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 end-6 z-50 w-14 h-14 bg-[#6B46C1] hover:bg-[#805AD5] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 end-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-[#6B46C1] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-xs text-purple-200">{t.subtitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-[#6B46C1] text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.isEscalate && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
                        <a 
                          href="tel:015731770487" 
                          className="flex items-center gap-2 text-[#6B46C1] hover:underline text-sm"
                        >
                          <Phone className="w-4 h-4" /> 01573 1770487
                        </a>
                        <a 
                          href="mailto:info@einsteindienstleistung.de" 
                          className="flex items-center gap-2 text-[#6B46C1] hover:underline text-sm"
                        >
                          <Mail className="w-4 h-4" /> info@einsteindienstleistung.de
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.thinking}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-white">
                <div className="flex flex-wrap gap-2">
                  {t.quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-purple-50 text-[#6B46C1] px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={t.placeholder}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="bg-[#6B46C1] hover:bg-[#805AD5]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {!showEscalate && messages.length > 2 && (
                <button
                  onClick={handleEscalate}
                  className="w-full mt-2 text-xs text-gray-500 hover:text-[#6B46C1] transition-colors"
                >
                  {t.escalate}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
