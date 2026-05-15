from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "listo-audio"
    elevenlabs_api_key: str = ""
    openai_api_key: str = ""
    jwt_secret_key: str = "dev-secret-change-in-production"
    app_env: str = "development"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
