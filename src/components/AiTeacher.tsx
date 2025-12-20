import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  GraduationCap, 
  User,
  Loader2,
  MessageCircle,
  Minimize2,
  Maximize2,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiTeacherProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-fortune-consult`;

const QUICK_TOPICS = [
  '什麼是八字？',
  '天干地支怎麼看？',
  '十神代表什麼意義？',
  '五行相生相剋是什麼？',
  '如何看大運流年？',
  '神煞有哪些種類？',
];

export const AiTeacher: React.FC<AiTeacherProps> = ({
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自動滾動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 開啟時聚焦輸入框
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // 初始歡迎訊息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ 
        role: 'assistant', 
        content: '您好！我是八字學堂的虛擬老師「明心」。我可以回答您關於八字命理的各種問題，無論是基礎概念還是進階知識，都歡迎提問！請問您想了解什麼呢？' 
      }]);
    }
  }, [isOpen]);

  const streamChat = async (userMessages: Message[]) => {
    const systemPrompt = `你是「明心」，八字學堂的虛擬 AI 老師。你專門教授八字命理知識，包括：
- 四柱八字基礎概念
- 天干地支的意義
- 十神體系與解讀
- 五行相生相剋
- 神煞的種類與意義
- 大運流年判讀
- 納音六十甲子

請用淺顯易懂的方式講解命理知識，可以舉例說明。回答要有教育性質，幫助學生循序漸進地理解命理。`;

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: [
          { role: 'system', content: systemPrompt },
          ...userMessages
        ],
        baziContext: null
      }),
    });

    if (response.status === 429) {
      toast.error('請求過於頻繁，請稍後再試');
      throw new Error('Rate limited');
    }
    if (response.status === 402) {
      toast.error('服務額度已用完');
      throw new Error('Payment required');
    }
    if (!response.ok || !response.body) {
      throw new Error('Failed to start stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat([...messages, userMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      if (!(error instanceof Error && (error.message === 'Rate limited' || error.message === 'Payment required'))) {
        toast.error('發送失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`
          fixed z-50 shadow-2xl rounded-2xl overflow-hidden
          ${isMinimized 
            ? 'bottom-4 right-4 w-72' 
            : 'bottom-4 right-4 w-[90vw] max-w-md h-[70vh] max-h-[600px]'
          }
          ${theme === 'dark' 
            ? 'bg-card border border-purple-500/30' 
            : 'bg-white border border-purple-200'
          }
        `}
      >
        {/* 標題欄 */}
        <div className={`
          flex items-center justify-between px-4 py-3
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 border-b border-purple-500/20' 
            : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-b border-purple-200'
          }
        `}>
          <div className="flex items-center gap-2">
            <GraduationCap className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-bold ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
              AI 老師 · 明心
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className={theme === 'dark' ? 'text-paper/60 hover:text-paper' : 'text-void/60 hover:text-void'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={theme === 'dark' ? 'text-paper/60 hover:text-paper' : 'text-void/60 hover:text-void'}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* 訊息區域 */}
            <div className={`
              flex-1 overflow-y-auto p-4 space-y-4
              ${theme === 'dark' ? 'bg-void/50' : 'bg-purple-50/30'}
            `} style={{ height: 'calc(100% - 140px)' }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : theme === 'dark' 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' 
                        : 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white'
                    }
                  `}>
                    {msg.role === 'user' 
                      ? <User className="w-4 h-4" /> 
                      : <GraduationCap className="w-4 h-4" />
                    }
                  </div>
                  <div className={`
                    max-w-[80%] px-4 py-2.5 rounded-2xl
                    ${msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : theme === 'dark'
                        ? 'bg-card border border-purple-500/20 text-paper rounded-bl-md'
                        : 'bg-white border border-purple-200 text-void rounded-bl-md'
                    }
                  `}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${theme === 'dark' 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' 
                      : 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white'
                    }
                  `}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className={`
                    px-4 py-3 rounded-2xl rounded-bl-md
                    ${theme === 'dark' ? 'bg-card border border-purple-500/20' : 'bg-white border border-purple-200'}
                  `}>
                    <Loader2 className={`w-5 h-5 animate-spin ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 快速主題 */}
            {messages.length <= 1 && (
              <div className={`
                px-4 py-2
                ${theme === 'dark' ? 'bg-void/30' : 'bg-purple-50'}
              `}>
                <div className="flex items-center gap-1 mb-2">
                  <Lightbulb className={`w-3 h-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-xs ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
                    常見問題
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {QUICK_TOPICS.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                      className={`
                        whitespace-nowrap text-xs shrink-0
                        ${theme === 'dark' 
                          ? 'border-purple-500/30 text-paper/80 hover:bg-purple-500/10' 
                          : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                        }
                      `}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 輸入區域 */}
            <div className={`
              flex items-center gap-2 p-3 border-t
              ${theme === 'dark' ? 'bg-card border-purple-500/20' : 'bg-white border-purple-200'}
            `}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="請輸入您的問題..."
                disabled={isLoading}
                className={`
                  flex-1 px-4 py-2 rounded-full text-sm
                  focus:outline-none focus:ring-2
                  ${theme === 'dark' 
                    ? 'bg-void border border-purple-500/20 text-paper placeholder:text-paper/40 focus:ring-purple-500/30' 
                    : 'bg-purple-50 border border-purple-200 text-void placeholder:text-void/40 focus:ring-purple-300'
                  }
                `}
              />
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`
                  rounded-full w-10 h-10 p-0
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400'
                  }
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </>
        )}

        {/* 最小化狀態 */}
        {isMinimized && (
          <div 
            className={`
              px-4 py-3 cursor-pointer
              ${theme === 'dark' ? 'hover:bg-purple-500/10' : 'hover:bg-purple-50'}
            `}
            onClick={() => setIsMinimized(false)}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-paper/70' : 'text-void/70'}`}>
                點擊展開對話
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
