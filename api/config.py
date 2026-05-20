from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://mec:mec@localhost:5432/mec"

    class Config:
        env_file = ".env"


settings = Settings()
