from fastapi import  FastAPI, Depends, HTTPException, Path,  status
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from database import SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session
from models import Book, Base, Rental, User
from database import engine
from schemas import *

app = FastAPI()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/", status_code=200)
async def root():
    return FileResponse("static/templates/index.html")


@app.get("/data", status_code=200)
async def about():
    return [
        {
            "name": "nurmuhammad",
            "age": 20,
            "panyatka": "inifinitiy"
        },
        {
            "name": "Ulugbek",
            "age": 18,
            "panyatka": "inifinitiy+"
        },
        {
            "name": "Fariza",
            "age": 18,
            "panyatka": "inifinitiy / 2"
        },
        {
            "name": "Firdavs",
            "age": 18,
            "panyatka": "-infinity"
        },
    ]

@app.get("/read_all_book", status_code=status.HTTP_200_OK)
async def read_all_books(db: db_dependency):
    return db.query(Book).all()

@app.get("/read_by_id/{book_id}", status_code=status.HTTP_200_OK)
async def read_by_id(db: db_dependency, book_id: int = Path(gt=0)):
    book_model = db.query(Book).filter(Book.id == book_id).first()
    if book_model is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book_model

@app.post("/user", status_code=status.HTTP_201_CREATED)
async def create_book(db: db_dependency, user_request: UserRequest):
    user_model = User(**user_request.model_dump())

    db.add(user_model)
    db.commit()

@app.post("/book", status_code=status.HTTP_201_CREATED)
async def create_book(db: db_dependency, book_request: BookRequest):
    book_model = Book(**book_request.model_dump())

    db.add(book_model)
    db.commit()

@app.put("/update_book/{book_id}", status_code=status.HTTP_200_OK)
async def update_book(db: db_dependency, book_request: BookRequest, book_id: int = Path(gt=0)):
    book_model = db.query(Book).filter(Book.id == book_id).first()

    if book_model is None:
        raise HTTPException(status_code=404, detail="Book not found.")

    book_model.title = book_request.title
    book_model.author = book_request.author
    book_model.description = book_request.description

    db.add(book_model)
    db.commit()

@app.delete("/delete_book/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(db: db_dependency, book_id: int = Path(gt=0)):
    book_model = db.query(Book).filter(Book.id == book_id).first()

    if book_model is None:
        raise HTTPException(status_code=404, detail="Todo not found.")

    db.delete(book_model)
    db.commit()


@app.post('/rent_book', status_code=status.HTTP_201_CREATED)
async def rent_book(rental: RentalCreate, db: db_dependency):
    user = db.query(User).get(rental.user_id)
    book = db.query(Book).get(rental.book_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.status == "rented":
        raise HTTPException(status_code=400, detail="Book already rented")
    if rental.rent_date > rental.due_date:
        raise HTTPException(status_code=400, detail="Rent date cannot be after due date.")

    db_rental = Rental(**rental.model_dump())
    book.status = "rented"
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental


@app.post('/return_book', status_code=status.HTTP_201_CREATED)
async def return_book(data: ReturnBook, db: db_dependency):
    rental = db.query(Rental).get(data.rental_id)
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.return_date:
        raise HTTPException(status_code=400, detail="Book already returned")
    if data.return_date < rental.rent_date:
        raise HTTPException(status_code=400, detail="Return date cannot be before rental date")

    rental.return_date = data.return_date
    book = db.query(Book).get(rental.book_id)
    book.status = "available"

    if data.return_date > rental.due_date:
        late_days = (data.return_date - rental.due_date).days
        amount_due = rental.rental_amount
        for _ in range(late_days):
            amount_due += amount_due * 0.001
        late_fee = amount_due - rental.rental_amount
        user = db.query(User).get(rental.user_id)
        user.balance += late_fee
    else:
        late_fee = 0.0

    db.commit()
    return {
        "message": "Book returned",
        "late_fee": round(late_fee, 2),
        "user_balance": round(rental.user.balance, 2)
    }

@app.get("/users", status_code=status.HTTP_200_OK)
async def users(db: db_dependency):
    db_users = db.query(User).all()
    return db_users

