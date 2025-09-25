import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  User,
  Bot,
  HelpCircle,
  FileText,
  Map,
  Users
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'data';
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your FRA Atlas assistant. I can help you with Forest Rights Act processes, data queries, and scheme recommendations. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { icon: HelpCircle, text: 'FRA Process Help', action: 'fra-help' },
    { icon: FileText, text: 'Check Claim Status', action: 'claim-status' },
    { icon: Map, text: 'Find Village Data', action: 'village-data' },
    { icon: Users, text: 'Scheme Recommendations', action: 'schemes' },
  ];

  const mockResponses: { [key: string]: string } = {
    'fra-help': 'The Forest Rights Act (FRA) 2006 process involves:\n\n1. **Application Submission**: Submit individual or community claims\n2. **Document Verification**: Provide supporting documents\n3. **Field Investigation**: Officials verify claims on ground\n4. **Committee Review**: Village and Sub-divisional committees review\n5. **Title Distribution**: Approved claims receive titles\n\nWould you like details about any specific step?',
    'claim-status': 'I can help you check your FRA claim status. Please provide:\n• Claim Number (e.g., IFR/OD/KPT/2023/001)\n• Village Name\n• District\n\nOr you can search by applicant name if you don\'t have the claim number.',
    'village-data': 'I can provide data for any village in our database:\n• Total FRA claims (IFR, CFR, CR)\n• Verification status\n• Land area covered\n• Linked government schemes\n• Contact details of local officials\n\nWhich village would you like information about?',
    'schemes': 'Based on FRA data, I can recommend relevant government schemes:\n\n**For Forest Communities:**\n• Jal Jeevan Mission (water access)\n• PM-KISAN (farmer support)\n• MGNREGA (employment guarantee)\n• Forest Conservation schemes\n\nShare your village name for personalized recommendations!'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action: string) => {
    const actionText = quickActions.find(qa => qa.action === action)?.text || action;
    handleSendMessage(actionText, action);
  };

  const handleSendMessage = async (text?: string, action?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      let botResponse = '';
      
      if (action && mockResponses[action]) {
        botResponse = mockResponses[action];
      } else {
        // Simple keyword matching for demo
        const lowerText = messageText.toLowerCase();
        if (lowerText.includes('claim') || lowerText.includes('status')) {
          botResponse = mockResponses['claim-status'];
        } else if (lowerText.includes('village') || lowerText.includes('data')) {
          botResponse = mockResponses['village-data'];
        } else if (lowerText.includes('scheme') || lowerText.includes('benefit')) {
          botResponse = mockResponses['schemes'];
        } else if (lowerText.includes('help') || lowerText.includes('process')) {
          botResponse = mockResponses['fra-help'];
        } else {
          botResponse = `I understand you're asking about "${messageText}". I can help you with:\n\n• FRA claim processes and procedures\n• Checking claim status and verification\n• Village-wise FRA data and statistics\n• Government scheme recommendations\n• Document requirements and guidelines\n\nCould you please be more specific about what you need help with?`;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-interactive animate-pulse-glow"
          variant="hero"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 shadow-elevated transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        {/* Header */}
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">FRA Assistant</CardTitle>
                <CardDescription className="text-xs">Always here to help</CardDescription>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Quick Actions:</p>
                <div className="grid grid-cols-2 gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.action)}
                      className="justify-start text-xs h-8"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask about FRA processes, claims, or schemes..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleInputKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Chatbot;