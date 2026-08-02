import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { sendChatMessage } from '../services/api';

export default function ChatAssistant({ isOpen, setIsOpen, onSearchMovieTitle }) {
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem('flickbotChatHistory')) || [];
  });
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('flickbotChatHistory', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      const data = await sendChatMessage(text);
      const reply = data.reply || 'No response from FlickBot AI.';
      const botMessage = { role: 'bot', content: reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { role: 'bot', content: `Error: ${err.message}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem('flickbotChatHistory');
  };

  // Process bot message markdown and attach click handlers for **Movie Titles**
  const renderBotContent = (content) => {
    let parsedHtml = marked.parse(content || '');
    // Wrap strong tags into clickable movie-link spans
    parsedHtml = parsedHtml.replace(/<strong>(.*?)<\/strong>/g, `<strong class="movie-link" data-title="$1">$1</strong>`);
    return { __html: parsedHtml };
  };

  const handleContainerClick = (e) => {
    const linkEl = e.target.closest('.movie-link');
    if (linkEl) {
      e.stopPropagation();
      const title = linkEl.getAttribute('data-title');
      if (title && onSearchMovieTitle) {
        onSearchMovieTitle(title);
      }
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-container text-on-primary-container shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border border-primary/40 group"
        title="Open FlickBot AI Assistant"
      >
        <span class="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">smart_toy</span>
      </button>

      {/* Floating Chat Window */}
      <div
        class={`fixed bottom-24 right-6 w-[92vw] sm:w-[380px] h-[540px] glass-panel rounded-2xl flex flex-col shadow-2xl z-50 border border-white/15 overflow-hidden transition-all duration-300 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Chat Header */}
        <div class="glass-panel border-b border-white/10 p-3.5 px-4 flex items-center justify-between bg-surface-container/80">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-container/20 border border-primary/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary-container text-[20px]">smart_toy</span>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm leading-tight">FlickBot AI</h3>
              <p class="text-[10px] text-primary flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span> Gemini Powered
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              onClick={handleClear}
              class="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 text-xs transition-colors"
              title="Clear Chat"
            >
              <span class="material-symbols-outlined text-[18px]">delete_sweep</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              class="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 text-xs transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onClick={handleContainerClick}
          class="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar"
        >
          <div class="chatbot-msg bot text-xs">
            👋 Hi! I am <strong>FlickBot</strong>. Ask me for movie recommendations, cast info, or plot summaries!
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              class={`chatbot-msg ${msg.role} text-xs`}
              {...(msg.role === 'bot'
                ? { dangerouslySetInnerHTML: renderBotContent(msg.content) }
                : { children: msg.content })}
            />
          ))}

          {isSending && (
            <div class="chatbot-msg bot text-xs opacity-70 animate-pulse flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Pills */}
        <div class="px-3 py-1.5 flex gap-2 overflow-x-auto custom-scrollbar border-t border-white/5 bg-black/20">
          <button
            onClick={() => handleSend("Top sci-fi movies of all time")}
            class="quick-prompt-chip glass-pill text-[11px] px-3 py-1 rounded-full text-on-surface-variant hover:text-primary hover:border-primary/40 whitespace-nowrap transition-colors"
          >
            🌌 Top Sci-Fi
          </button>
          <button
            onClick={() => handleSend("Best animated movies 2024")}
            class="quick-prompt-chip glass-pill text-[11px] px-3 py-1 rounded-full text-on-surface-variant hover:text-primary hover:border-primary/40 whitespace-nowrap transition-colors"
          >
            🎨 2024 Animation
          </button>
          <button
            onClick={() => handleSend("Recommend action movies with plot twists")}
            class="quick-prompt-chip glass-pill text-[11px] px-3 py-1 rounded-full text-on-surface-variant hover:text-primary hover:border-primary/40 whitespace-nowrap transition-colors"
          >
            💥 Action Twists
          </button>
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          class="p-3 border-t border-white/10 bg-surface-container-high/60 flex items-center gap-2"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            type="text"
            placeholder="Ask about movies..."
            class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSending}
            class="bg-primary-container text-on-primary-container p-2 rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </>
  );
}
