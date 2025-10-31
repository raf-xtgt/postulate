"use client";
import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '../models/chatMsg';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
}

interface StateControllerState {
  sharedData: any;
  setSharedData: (data: any) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  pruneChatMessages: (index: number) => void;
  replayMessage: string;
  setReplayMessage: (message: string) => void;
  replayAltPath: any;
  setReplayAltPath: (payload: any) => void;

  // new
  navItems: NavItem[];
  setNavItems: (items: NavItem[]) => void;
  docText: string;
  addDocText: (docText: string) => void;

}

const StateControllerContext = createContext<StateControllerState | undefined>(undefined);

export const StateControllerProvider = ({ children }: { children: ReactNode }) => {
  const [sharedData, setSharedData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replayMessage, setReplayMessage] = useState<string>("");
  const [replayAltPath, setReplayAltPath] = useState<any>(null);

  //new
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [docText, addDocText] = useState<string>("");

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const pruneChatMessages = (index: number) => {
    setChatMessages(prev => prev.slice(0, index + 1));
  };

  return (
    <StateControllerContext.Provider value={{
      sharedData,
      setSharedData,
      chatMessages,
      addChatMessage,
      pruneChatMessages,
      replayMessage,
      setReplayMessage,
      replayAltPath,
      setReplayAltPath,

      // new
      navItems,
      setNavItems,
      docText,
      addDocText
    }}>
      {children}
    </StateControllerContext.Provider>
  );
};

export const useStateController = () => {
  const context = useContext(StateControllerContext);
  if (context === undefined) {
    throw new Error('useStateController must be used within a StateControllerProvider');
  }
  return context;
};
