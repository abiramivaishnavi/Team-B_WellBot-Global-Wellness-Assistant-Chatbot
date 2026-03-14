from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import (
  profiles,
  daily_checkins,
  recommendations,
  stress_logs,
  nutrition,
  feedback,
  wellbot,
  reports,
)


def create_app() -> FastAPI:
  app = FastAPI(
    title="WellBot Backend",
    version="1.0.0",
    description="FastAPI backend for WellBot using Supabase and Google Generative AI.",
  )

  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Can be restricted to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  # Routers
  app.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
  app.include_router(daily_checkins.router, prefix="/daily-checkins", tags=["daily_checkins"])
  app.include_router(stress_logs.router, prefix="/stress-logs", tags=["stress_logs"])
  app.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
  app.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
  app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
  app.include_router(wellbot.router, prefix="/wellbot", tags=["wellbot"])
  app.include_router(reports.router, prefix="/reports", tags=["reports"]) # Added reports router

  return app


app = create_app()
