from pydantic import BaseModel

class CityListResponse(BaseModel):
    cities: list[str]