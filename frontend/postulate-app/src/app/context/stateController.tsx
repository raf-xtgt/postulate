"use client";
import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '../models/chatMsg';
import { CitationModel } from '../models/citation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
}

interface StateControllerState {
  sessionData: any;
  setSessionData: (data: any) => void;

  // new
  navItems: NavItem[];
  setNavItems: (items: NavItem[]) => void;
  docText: string;
  addDocText: (docText: string) => void;
  citations: CitationModel[];
  addCitation: (citation: CitationModel) => void;

  // session guid
  currentSessionGuid: string | null;
  setCurrentSessionGuid: (guid: string | null) => void;

  // pitfalls
  pitfalls: any[];
  setPitfalls: (pitfalls: any[]) => void;
  addPitfall: (pitfall: any) => void;
  pitfallsLoading: boolean;
  setPitfallsLoading: (loading: boolean) => void;

  // citation results
  citationResults: any[];
  setCitationResults: (results: any[]) => void;
  addCitationResults: (results: any[]) => void;
  citationResultsLoading: boolean;
  setCitationResultsLoading: (loading: boolean) => void;

}

const StateControllerContext = createContext<StateControllerState | undefined>(undefined);

export const StateControllerProvider = ({ children }: { children: ReactNode }) => {
  const [sessionData, setSessionData] = useState<any>(null);

  //new
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [docText, addDocText] = useState<string>("");
  const [citations, setCitations] = useState<CitationModel[]>([]);
  const [currentSessionGuid, setCurrentSessionGuid] = useState<string | null>(null);
  const [pitfalls, setPitfalls] = useState<any[]>([]);
  const [pitfallsLoading, setPitfallsLoading] = useState<boolean>(false);
  const [citationResults, setCitationResults] = useState<any[]>([]);
  const [citationResultsLoading, setCitationResultsLoading] = useState<boolean>(false);

  const addCitation = (citation: CitationModel) => {
    setCitations(prev => [...prev, citation]);
  };

  const addPitfall = (pitfall: any) => {
    setPitfalls(prev => [...prev, pitfall]);
  };

  const addCitationResults = (results: any[]) => {
    setCitationResults(prev => [...prev, ...results]);
  };

  return (
    <StateControllerContext.Provider value={{
      sessionData,
      setSessionData,
      // new
      navItems,
      setNavItems,
      docText,
      addDocText,
      citations,
      addCitation,
      currentSessionGuid,
      setCurrentSessionGuid,
      pitfalls,
      setPitfalls,
      addPitfall,
      pitfallsLoading,
      setPitfallsLoading,
      citationResults,
      setCitationResults,
      addCitationResults,
      citationResultsLoading,
      setCitationResultsLoading
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
