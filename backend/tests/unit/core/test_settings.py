from __future__ import annotations

from backend.app.core.settings import Settings


def test_env_file_loading(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join([
            "OPENAI_API_KEY=test-key",
            "ALLOW_ORIGINS=http://example.com",
            "LOG_LEVEL=DEBUG",
            "REDIS_URL=redis://localhost:6379/1",
        ])
    )
    monkeypatch.chdir(tmp_path)
    # Clear any existing environment variables that might interfere
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("ALLOW_ORIGINS", raising=False)
    monkeypatch.delenv("LOG_LEVEL", raising=False)
    monkeypatch.delenv("REDIS_URL", raising=False)
    settings = Settings()
    assert settings.openai_api_key == "test-key"
    assert settings.allow_origins == "http://example.com"
    assert settings.log_level == "DEBUG"
    assert settings.redis_url == "redis://localhost:6379/1"


def test_env_variables_override(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "env-key")
    settings = Settings(_env_file=None)
    assert settings.openai_api_key == "env-key"
