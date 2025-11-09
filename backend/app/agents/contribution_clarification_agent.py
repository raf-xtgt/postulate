import asyncio
from google.adk.agents import Agent  
from sqlalchemy.ext.asyncio import AsyncSession
import json
from app.agents.adk_tools import significance_analyzer

class ContributionClarificationAgent(Agent):
    db: AsyncSession
    def __init__(self, db: AsyncSession, **kwargs):
        super().__init__(
            tools=[
                significance_analyzer,
            ],
            db=db,
            **kwargs
        )
  

    async def analyze_draft(self, draft_text: str) :
        tasks = {
            "significance": await significance_analyzer(draft_text=draft_text, db=self.db),
        }
        print("\n significance \n")
        print(tasks)
        return tasks