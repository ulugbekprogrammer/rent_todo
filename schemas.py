from pydantic import Field, BaseModel
from datetime import date

class UserRequest(BaseModel):
    name: str = Field(min_length=3)
    surname: str = Field(min_length=3)

class BookRequest(BaseModel):
    title: str = Field(min_length=3)
    author: str = Field(min_length=3)
    description: str = Field(min_length=3, max_length=100)


class RentalCreate(BaseModel):
    user_id: int
    book_id: int
    rent_date: date
    due_date: date
    rental_amount: float

class ReturnBook(BaseModel):
    rental_id: int
    return_date: date