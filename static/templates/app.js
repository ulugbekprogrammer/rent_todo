function createInput(labelText, id, type= "text") {
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = id;
    input.type = type;
    return [label, input];
}

function createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
}

function createSection(title) {
    const section = document.createElement("div");
    section.className = "section";
    const h2 = document.createElement("h2");
    h2.textContent = title;
    section.appendChild(h2);
    return section;
}

function buildUI() {
    const app = document.getElementById("app");

    // Add User
    const userSection = createSection("Add User");
    const [nameLabel, nameInput] = createInput("Name:", "userName");
    const [surnameLabel, surnameInput] = createInput("Surname:", "userSurname");
    const addUserBtn = createButton("Add User", addUser);
    userSection.append(nameLabel, nameInput, surnameLabel, surnameInput, addUserBtn);
    app.appendChild(userSection);

    // Add Book
    const bookSection = createSection("Add Book");
    const [titleLabel, titleInput] = createInput("Title:", "bookTitle");
    const [authorLabel, authorInput] = createInput("Author:", "bookAuthor");
    const [descLabel, descInput] = createInput("Description:", "bookDescription");
    const addBookBtn = createButton("Add Book", addBook);
    bookSection.append(titleLabel, titleInput, authorLabel, authorInput, descLabel, descInput, addBookBtn);
    app.appendChild(bookSection);

    // Update Book
    const updateSection = createSection("Update Book");
    const [updateIdLabel, updateIdInput] = createInput("Book ID:", "updateBookId");
    const [updateTitleLabel, updateTitleInput] = createInput("New Title:", "updateTitle");
    const [updateAuthorLabel, updateAuthorInput] = createInput("New Author:", "updateAuthor");
    const [updateDescLabel, updateDescInput] = createInput("New Description:", "updateDescription");
    const updateBookBtn = createButton("Update Book", async () => {
        await updateBook();
        listBooks();
    });
    updateSection.append(updateIdLabel, updateIdInput, updateTitleLabel, updateTitleInput,
        updateAuthorLabel, updateAuthorInput, updateDescLabel, updateDescInput, updateBookBtn);
    app.appendChild(updateSection);

    // Show Books (no load button!)
    const listSection = createSection("All Books");
    const bookList = document.createElement("ul");
    bookList.id = "bookList";
    listSection.append(bookList);
    app.appendChild(listSection);

    // Delete Book
    const deleteSection = createSection("Delete Book");
    const [delLabel, delInput] = createInput("Book ID:", "deleteBookId");
    const delBtn = createButton("Delete Book", deleteBook);
    deleteSection.append(delLabel, delInput, delBtn);
    app.appendChild(deleteSection);

    // Rent Book
    const rentSection = createSection("Rent Book");
    const [userIdLabel, userIdInput] = createInput("User ID:", "rentUserId");
    const [bookIdLabel, bookIdInput] = createInput("Book ID:", "rentBookId");
    const [rentalDateLabel, rentalDateInput] = createInput("Rental Date:", "rentalDate", "date");
    console.log("Rental input type is:", rentalDateInput.type);
    const [dueDateLabel, dueDateInput] = createInput("Due Date:", "dueDate", "date");
    const [amountLabel, amountInput] = createInput("Rental Amount:", "rentalAmount");
    const rentBtn = createButton("Rent Book", rentBook);
    rentSection.append(
        userIdLabel, userIdInput,
        bookIdLabel, bookIdInput,
        rentalDateLabel, rentalDateInput,
        dueDateLabel, dueDateInput,
        amountLabel, amountInput,
        rentBtn
    );
    app.appendChild(rentSection);

    // Return Book
    const returnSection = createSection("Return Book");
    const [rentalIdLabel, rentalIdInput] = createInput("Rental ID:", "rentalId");
    const [returnDateLabel, returnDateInput] = createInput("Return Date:", "returnDate", "date");
    const returnBtn = createButton("Return Book", returnBook);
    returnSection.append(rentalIdLabel, rentalIdInput, returnDateLabel, returnDateInput, returnBtn);
    app.appendChild(returnSection);

    // Initial load
    listBooks();
}

async function addUser() {
    const user = {
        name: document.getElementById("userName").value,
        surname: document.getElementById("userSurname").value
    };

    const response = await fetch("/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });

    alert(response.ok ? "User added!" : "Failed to add user.");
}

async function addBook() {
    const book = {
        title: document.getElementById("bookTitle").value,
        author: document.getElementById("bookAuthor").value,
        description: document.getElementById("bookDescription").value
    };

    const response = await fetch("/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book)
    });

    alert(response.ok ? "Book added!" : "Failed to add book.");
    listBooks();
}

async function listBooks() {
    const response = await fetch("/read_all_book");
    const books = await response.json();

    const list = document.getElementById("bookList");
    list.innerHTML = "";

    books.forEach(book => {
        const li = document.createElement("li");
        li.textContent = `${book.id}. ${book.title} by ${book.author} (${book.status})`;
        list.appendChild(li);
    });
}

async function deleteBook() {
    const bookId = document.getElementById("deleteBookId").value;

    const response = await fetch(`/delete_book/${bookId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        alert("Book deleted!");
    } else {
        const result = await response.json();
        alert(result.detail || "Failed to delete book.");
    }
    listBooks();
}

async function updateBook() {
    const bookId = document.getElementById("updateBookId").value;
    const updated = {
        title: document.getElementById("updateTitle").value,
        author: document.getElementById("updateAuthor").value,
        description: document.getElementById("updateDescription").value
    };

    const response = await fetch(`/update_book/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });


    const result = await response.json();
    alert(response.ok ? "Book updated!" : result.detail || "Update failed.");
}

async function rentBook() {
    const rental = {
        user_id: parseInt(document.getElementById("rentUserId").value),
        book_id: parseInt(document.getElementById("rentBookId").value),
        rent_date: document.getElementById("rentalDate").value,
        due_date: document.getElementById("dueDate").value,
        rental_amount: parseFloat(document.getElementById("rentalAmount").value)
    };

    console.log(rental);

    const response = await fetch("/rent_book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rental)
    });

    const result = await response.json();
    alert(response.ok ? `Book rented!\nRental ID: ${result.id}` : result.detail || "Rent failed.");
    listBooks();
}

async function returnBook() {
    const returnData = {
        rental_id: parseInt(document.getElementById("rentalId").value),
        return_date: document.getElementById("returnDate").value
    };

    const response = await fetch("/return_book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnData)
    });

    const result = await response.json();
    if (response.ok) {
        alert(`Returned!\nLate Fee: $${result.late_fee}\nBalance: $${result.user_balance}`);
    } else {
        alert(result.detail || "Return failed.");
    }
    listBooks();
}

buildUI();