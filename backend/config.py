from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    google_api_key: str

    # This tells Pydantic to load the variables from a .env file
    model_config = SettingsConfigDict(env_file=".env")

# Create an instance of the settings
settings = Settings()