"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

  // significance analyses
  significanceAnalyses: any[];
  setSignificanceAnalyses: (analyses: any[]) => void;
  addSignificanceAnalysis: (analysis: any) => void;
  significanceAnalysesLoading: boolean;
  setSignificanceAnalysesLoading: (loading: boolean) => void;

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
  const [significanceAnalyses, setSignificanceAnalyses] = useState<any[]>([]);
  const [significanceAnalysesLoading, setSignificanceAnalysesLoading] = useState<boolean>(false);

  const addCitation = (citation: CitationModel) => {
    setCitations(prev => [...prev, citation]);
  };

  const addPitfall = (pitfall: any) => {
    setPitfalls(prev => [...prev, pitfall]);
  };

  const addCitationResults = (results: any[]) => {
    setCitationResults(prev => [...prev, ...results]);
  };

  const addSignificanceAnalysis = (analysis: any) => {
    setSignificanceAnalyses(prev => [...prev, analysis]);
  };

  // Load session data when currentSessionGuid changes
  useEffect(() => {
    const loadSessionData = async () => {
      if (!currentSessionGuid) {
        // Clear all data when no session is selected
        setPitfalls([]);
        setCitationResults([]);
        setSignificanceAnalyses([]);
        return;
      }

      try {
        // Load pitfalls
        const pitfallsResponse = await fetch(`http://localhost:8000/ps/pitfall/session/${currentSessionGuid}`);
        if (pitfallsResponse.ok) {
          const pitfallsData = await pitfallsResponse.json();
          setPitfalls(pitfallsData);
        }

        // Load citation results
        const citationsResponse = await fetch(`http://localhost:8000/ps/citation/session/${currentSessionGuid}`);
        if (citationsResponse.ok) {
          const citationsData = await citationsResponse.json();
          setCitationResults(citationsData);
        }

        // Load significance analyses
        const significanceResponse = await fetch(`http://localhost:8000/ps/significance-analysis/session/${currentSessionGuid}`);
        if (significanceResponse.ok) {
          const significanceData = await significanceResponse.json();
          setSignificanceAnalyses(significanceData);
        }
      } catch (error) {
        console.error('Error loading session data:', error);
      }
    };

    loadSessionData();
  }, [currentSessionGuid]);

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
      setCitationResultsLoading,
      significanceAnalyses,
      setSignificanceAnalyses,
      addSignificanceAnalysis,
      significanceAnalysesLoading,
      setSignificanceAnalysesLoading
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
