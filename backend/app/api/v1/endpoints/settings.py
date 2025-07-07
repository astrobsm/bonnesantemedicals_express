from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.settings import Settings

router = APIRouter()


from app.schemas.settings import SettingsOut, SettingsCreate
from fastapi import Body

@router.get("", response_model=list[SettingsOut], include_in_schema=False)
@router.get("/", response_model=list[SettingsOut])
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Settings).all()
    if not settings:
        raise HTTPException(status_code=404, detail="No settings found")
    return settings

@router.post("/", response_model=SettingsOut)
def create_or_update_settings(settings: SettingsCreate = Body(...), db: Session = Depends(get_db)):
    # Upsert by page_name
    db_settings = db.query(Settings).filter(Settings.page_name == settings.page_name).first()
    if db_settings:
        db_settings.background_image = settings.background_image
        db_settings.font_family = settings.font_family
        db_settings.theme = settings.theme
    else:
        db_settings = Settings(
            page_name=settings.page_name,
            background_image=settings.background_image,
            font_family=settings.font_family,
            theme=settings.theme
        )
        db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings
