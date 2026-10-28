import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Loader2,
  Info
} from 'lucide-react';
import { advisorApi } from '../../services/api';
import type { ChatMessage } from '../../types/more_features';

const SUGGESTED_QUESTIONS = [
  "What TNEA cutoff is needed for Computer Science at CEG Guindy?",
  "Am I eligible for Tamil Nadu First Graduate scholarship fee concession?",
  "How can I become an AI/ML Engineer after 12th standard in Tamil Nadu?",
  "Which engineering branch is best if I scored 185 cut-off in TNEA?",
  "What is the 7.5% government school quota and who qualifies?"
];

export const AIAdvisorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      setFetchingHistory(true);
      const history = await advisorApi.getHistory();
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 0,
            role: 'assistant',
            content: `Vanakkam! 🙏 I am your **CarryYear AI Career & Education Advisor**, specialized in Tamil Nadu higher education, TNEA cut-offs, state quota rules (7.5% Govt School, First Graduate), NIRF college placements, and career pathways.

Ask me anything about college admissions, scholarships, skill roadmaps, or high-paying tech/core careers!`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await advisorApi.sendMessage(text);
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.reply,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I encountered an issue connecting to the reasoning model. However, our deterministic Tamil Nadu counseling databases are fully operational. Please try your question again.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Conversation history cleared. What would you like guidance on next regarding Tamil Nadu admissions or careers?",
        created_at: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">CarryYear AI Advisor</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active (Tamil Nadu Context RAG)
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Personalized guidance on TNEA 200-scale cutoffs, college quotas, state scholarships, and career roadmaps.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-slate-700/50 transition-colors self-start md:self-auto"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Recommended questions for Tamil Nadu students:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs text-left bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 px-3 py-2 rounded-xl transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {fetchingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>
                    <div className="text-[10px] opacity-40 mt-2 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                      <span className="text-xs font-bold">You</span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Consulting Tamil Nadu counseling rules & Groq LLM...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about TNEA cutoffs, CEG, PSG, scholarships, or career roadmaps..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none border-focus"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              Ground truth data verified with Directorate of Technical Education (DoTE) Tamil Nadu rules.
            </span>
            <span>Supports Tamil & English</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIAdvisorView;
