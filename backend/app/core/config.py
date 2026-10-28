from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CarryYear - TN Career & Education Decision Intelligence"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "sqlite:///./carryyear.db"

    # Security
    JWT_SECRET: str = "carryyear_super_secret_jwt_key_2026_production_change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Groq AI (leave empty by default; fallback logic is used when key is not configured)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:80",
    ]

    # RAG / Knowledge
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = "./knowledge/faiss_index"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )

    def validate_production_configuration(self) -> None:
        """Validate security settings when running in production."""
        if self.ENVIRONMENT.lower() == "production":
            insecure_defaults = [
                "carryyear_super_secret_jwt_key_2026_production_change_me",
                "secret",
                "changeme",
                "password"
            ]
            if not self.JWT_SECRET or self.JWT_SECRET in insecure_defaults or len(self.JWT_SECRET) < 32:
                raise ValueError(
                    "CRITICAL SECURITY ERROR: Insecure or default JWT_SECRET detected in production. "
                    "You must provide a strong, cryptographically generated secret (min 32 chars) via the JWT_SECRET environment variable."
                )
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError(
                    "CRITICAL CONFIGURATION ERROR: SQLite database is not permitted in production. "
                    "Please configure a production-ready PostgreSQL connection via DATABASE_URL."
                )

settings = Settings()
settings.validate_production_configuration()

