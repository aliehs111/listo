from app.database import engine
from app import models  # noqa: F401 — imports all models so Base knows about them
from app.database import Base

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
