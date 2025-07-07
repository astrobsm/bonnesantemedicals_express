from app.db.session import SessionLocal
from app.db.models.settings import Settings

def seed_default_settings():
    db = SessionLocal()
    if not db.query(Settings).filter(Settings.page_name == '/dashboard').first():
        s = Settings(
            page_name='/dashboard',
            background_image=None,
            font_family='Arial, sans-serif',
            theme='light',
        )
        db.add(s)
        db.commit()
        print('Default settings row created.')
    else:
        print('Default settings row already exists.')
    db.close()

if __name__ == '__main__':
    seed_default_settings()
