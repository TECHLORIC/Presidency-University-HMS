import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  'My room tap is broken',
  'What is today\'s mess menu?',
  'How do I apply for leave?',
  'WiFi is not working in my room',
];

async function getAIResponse(message: string, user: any): Promise<string> {
  const lower = message.toLowerCase();
  
  if (lower.includes('tap') || lower.includes('plumb') || lower.includes('water leak')) {
    return `🔧 **Issue Detected: Plumbing/Water**\n\nI've analyzed your complaint and here's what I can do:\n\n1. **Category:** Plumbing & Water\n2. **Priority:** High\n3. **Suggested Ticket:** "Water tap issue in room"\n\n💡 **Quick Fix:** Try turning off the main valve under the sink and then back on.\n\nWould you like me to **create a maintenance ticket** automatically? Just say "create ticket" and I'll handle it!`;
  }
  if (lower.includes('mess') || lower.includes('menu') || lower.includes('food')) {
    return `🍽️ **Today's Mess Menu**\n\n- **Breakfast:** Idli Sambar, Bread & Butter\n- **Lunch:** Rice & Dal, Chicken Curry\n- **Snacks:** Tea & Biscuits\n- **Dinner:** Chapati & Paneer, Egg Curry\n\nYou can also check the full weekly menu in the **Mess** section.\n\n💬 Have feedback about the food? I can help you submit it!`;
  }
  if (lower.includes('leave') || lower.includes('holiday')) {
    return `📋 **Leave Application Guide**\n\n1. Go to **Leave Management** section\n2. Click **"Apply Leave"**\n3. Fill in dates and reason\n4. Submit for warden approval\n\nNeed help applying right now? Just tell me your dates and reason!`;
  }
  if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network')) {
    return `📶 **WiFi Troubleshooting**\n\n1. **Restart** your device's WiFi\n2. **Forget** the network and reconnect\n3. Try connecting to **PU_Hostel_5G** instead\n\nStill not working? I can raise a **WiFi ticket** for your room. Just type "create ticket".`;
  }
  if (lower.includes('timing') || lower.includes('rules') || lower.includes('hours')) {
    return `⏰ **Hostel Timings**\n\n- **Gate Closing:** 10:00 PM\n- **Mess:** Breakfast 7:30AM, Lunch 12:30PM, Dinner 7:30PM\n- **Gym:** 5:30 AM - 9:00 PM\n\n📌 Late entry requires warden permission.`;
  }
  if (lower.includes('yes') || lower.includes('create') || lower.includes('ticket')) {
    if (!user) return `I need you to be securely logged in to create a ticket on your behalf!`;

    const { data: ticket, error } = await supabase.from('tickets').insert({
      created_by: user.id,
      room_number: user.room_number || 'N/A',
      title: 'AI Auto-Generated Request',
      description: `User requested via AI: "${message}"`,
      category: 'maintenance',
      status: 'open',
      priority: 'high'
    }).select().single();

    if (error) {
      console.error(error);
      return `❌ **Error:** I couldn't create the ticket: ${error.message}`;
    }

    return `✅ **Ticket Created Successfully!**\n\n- **ID:** #${ticket.id.substring(0, 8)}\n- **Status:** Open\n- **Assigned:** Auto-routing to maintenance team\n\nTrack it in the **Tickets** section. Anything else I can help with?`;
  }
  return `I'm your HMS AI Assistant! I can help you with:\n\n- 🔧 **Raise complaints**\n- 📋 **Leave applications**\n- 🍽️ **Mess menu**\n- ❓ **Any other queries**\n\nTry saying something like *"My room WiFi is broken then create a ticket"* and I'll handle it!`;
}

export function FloatingAIAssistant() {
  const { user } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: '👋 Hi! I\'m your **HMS AI Assistant**. I can automatically raise tickets, check menus, and answer hostel-related questions for you.\n\nTry asking me anything!' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const response = await getAIResponse(text, user);
      setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 400 + Math.random() * 400); // slightly faster simulated think time since network request will take time
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-[360px] h-[550px] max-h-[80vh] flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold">AI Assistant</h2>
                  <p className="text-[10px] text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md shadow-sm'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted-foreground flex items-center">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border">
              {messages.length <= 2 && (
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="px-3 py-1.5 rounded-full bg-secondary/80 text-xs font-medium text-secondary-foreground hover:bg-secondary transition-colors shrink-0 whitespace-nowrap">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && send(input)} 
                  placeholder="Ask me anything..." 
                  className="flex-1 rounded-full bg-secondary border-transparent focus-visible:ring-primary h-10" 
                />
                <Button 
                  onClick={() => send(input)} 
                  disabled={!input.trim() || isTyping} 
                  className="h-10 w-10 rounded-full p-0 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-all"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
