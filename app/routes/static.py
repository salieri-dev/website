from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(include_in_schema=False)


@router.get("/")
async def read_root():
    try:
        return FileResponse("static/pages/index/index.html")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mortgage")
async def read_mortgage():
    try:
        return FileResponse("static/pages/mortgage/mortgage.html")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

