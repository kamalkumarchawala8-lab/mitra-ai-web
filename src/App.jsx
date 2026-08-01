import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles, Mail, ArrowRight } from "lucide-react";

export default function ChatBot() {
  const [step, setStep] = useState("welcome"); // "welcome" | "chat"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const startChat = () => {
    if (!name.trim()) {
      setFormError("Pehle apna naam likhiye");
      return;
    }
    if (!emailValid) {
      setFormError("Sahi email daaliye");
      return;
    }
    setFormError("");
    setMessages([
      {
        role: "assistant",
        content: `Namaste ${name.trim()}! Main Mitra AI hoon, aapka personal assistant. Aap mujhse kuch bhi pooch sakte hain — sawaal ho, ideas ho, ya bas baat karni ho. Bataiye, kaise madad karoon?`,
      },
    ]);
    setStep("chat");
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply =
        data?.content?.map((c) => c.text || "").join("\n") ||
        "Kuch gadbad ho gayi, dobara try karein.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error aa gaya, thodi der baad try karein." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (step === "welcome") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0F1115] text-[#E6E8EC] px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6] flex items-center justify-center mb-4">
              <Sparkles size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Mitra AI – Har Sawaal Ka Dost</h1>
            <p className="text-[13px] text-[#8A9099] mt-1.5">
              Shuru karne ke liye apna naam aur email daaliye
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-[#8A9099] mb-1.5 block">Naam</label>
              <div className="flex items-center gap-2 bg-[#1B1E25] rounded-xl px-3 py-2.5 border border-[#2A2F38] focus-within:border-[#3B82F6] transition-colors">
                <User size={15} className="text-[#6B7280] shrink-0" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apka naam"
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder-[#6B7280]"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] text-[#8A9099] mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 bg-[#1B1E25] rounded-xl px-3 py-2.5 border border-[#2A2F38] focus-within:border-[#3B82F6] transition-colors">
                <Mail size={15} className="text-[#6B7280] shrink-0" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startChat()}
                  placeholder="aapka.email@gmail.com"
                  type="email"
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder-[#6B7280]"
                />
              </div>
            </div>

            {formError && <p className="text-[12px] text-[#F87171]">{formError}</p>}

            <button
              onClick={startChat}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2f6fdb] transition-colors rounded-xl py-2.5 text-[14px] font-medium text-white"
            >
              Chat shuru karein
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0F1115] text-[#E6E8EC]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1F232B]">
        <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Mitra AI</h1>
          <p className="text-[12px] text-[#8A9099]">Namaste, {name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#6B7280] gap-2">
            <Sparkles size={28} className="text-[#3B82F6]" />
            <p className="text-sm">Kuch bhi puchiye, main yahan hoon.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${
                m.role === "user" ? "bg-[#2A2F38]" : "bg-[#3B82F6]"
              }`}
            >
              {m.role === "user" ? (
                <User size={14} className="text-[#C7CBD1]" />
              ) : (
                <Sparkles size={14} className="text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#3B82F6] text-white rounded-tr-sm"
                  : "bg-[#1B1E25] text-[#E6E8EC] rounded-tl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 shrink-0 rounded-full bg-[#3B82F6] flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-[#1B1E25] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1F232B]">
        <div className="flex items-end gap-2 bg-[#1B1E25] rounded-2xl px-3 py-2 border border-[#2A2F38] focus-within:border-[#3B82F6] transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Apna message likhiye..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[14px] placeholder-[#6B7280] py-1.5 max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-8 h-8 shrink-0 rounded-xl bg-[#3B82F6] disabled:bg-[#2A2F38] disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
