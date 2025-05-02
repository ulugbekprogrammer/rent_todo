from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    surname = Column(String)
    balance = Column(Float, default=100.0)
    rentals = relationship("Rental", back_populates="user")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    author = Column(String)
    status = Column(String, default="available")
    description = Column(String)
    rentals = relationship("Rental", back_populates="book")


class Rental(Base):
    __tablename__ = "rentals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    rent_date = Column(Date)
    due_date = Column(Date)
    rental_amount = Column(Float)
    return_date = Column(Date, nullable=True)
    user = relationship("User", back_populates="rentals")
    book = relationship("Book", back_populates="rentals")