// Check if user is authenticated and redirect if not
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  // Display user role
  document.getElementById("userRole").textContent =
    username + " (" + role + ")";

  if (role === "LIBRARIAN") {
    document.getElementById("librarianFeatures").classList.remove("d-none");
    loadBooksForLibrarian();
    loadMembersForLibrarian();
    loadAllMembersHistory();
  } else if (role === "MEMBER") {
    document.getElementById("memberFeatures").classList.remove("d-none");
    loadAvailableBooks();
    loadMemberBorrowedHistory();
  }
});

// Librarian - Load all books
async function loadBooksForLibrarian() {
  const response = await fetch("http://your-api-url/books", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const books = await response.json();

  const booksList = document.getElementById("booksList");
  booksList.innerHTML = ""; // Clear list before adding
  books.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.status}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editBook(${book.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
      </td>
    `;
    booksList.appendChild(row);
  });
}

// Librarian - Load all members
async function loadMembersForLibrarian() {
  const response = await fetch("http://your-api-url/members", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const members = await response.json();

  const membersList = document.getElementById("membersList");
  membersList.innerHTML = ""; // Clear list before adding
  members.forEach((member) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${member.username}</td>
      <td>${member.role}</td>
      <td>${member.active ? "Active" : "Deleted"}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editMember(${
          member.id
        })">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMember(${
          member.id
        })">Delete</button>
      </td>
    `;
    membersList.appendChild(row);
  });
}

// Librarian - Load all members' borrowing history
async function loadAllMembersHistory() {
  const response = await fetch("http://your-api-url/members/history/all", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const history = await response.json();

  const allMembersHistoryList = document.getElementById(
    "allMembersHistoryList"
  );
  allMembersHistoryList.innerHTML = ""; // Clear list before adding
  history.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.username}</td>
      <td>${record.bookTitle}</td>
      <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
      <td>${
        record.returnDate
          ? new Date(record.returnDate).toLocaleDateString()
          : "Not Returned"
      }</td>
    `;
    allMembersHistoryList.appendChild(row);
  });
}

// Librarian - Add new book
document
  .getElementById("bookForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;

    await fetch("http://your-api-url/books", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, author }),
    });

    // Refresh book list
    loadBooksForLibrarian();
    document.getElementById("bookForm").reset();
    new bootstrap.Modal(document.getElementById("bookModal")).hide();
  });

// Librarian - Edit book (to be implemented)
function editBook(bookId) {
  // Implement edit book functionality here
}

// Librarian - Delete book
async function deleteBook(bookId) {
  await fetch(`http://your-api-url/books/${bookId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  loadBooksForLibrarian();
}

// Member - Load available books for borrowing
async function loadAvailableBooks() {
  const response = await fetch("http://your-api-url/books/available", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const books = await response.json();

  const availableBooksList = document.getElementById("availableBooksList");
  availableBooksList.innerHTML = ""; // Clear list before adding
  books.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.status}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="borrowBook(${book.id})">Borrow</button>
      </td>
    `;
    availableBooksList.appendChild(row);
  });
}

// Member - Borrow book
async function borrowBook(bookId) {
  await fetch(`http://your-api-url/books/borrow/${bookId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  loadAvailableBooks();
  loadMemberBorrowedHistory();
}

// Member - Return book
async function returnBook(bookId) {
  await fetch(`http://your-api-url/books/return/${bookId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  loadMemberBorrowedHistory();
}

// Member - Load borrowed books history
async function loadMemberBorrowedHistory() {
  const response = await fetch("http://your-api-url/members/history", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const history = await response.json();

  const borrowedHistoryList = document.getElementById("borrowedHistoryList");
  borrowedHistoryList.innerHTML = ""; // Clear list before adding
  history.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.bookTitle}</td>
      <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
      <td>${
        record.returnDate
          ? new Date(record.returnDate).toLocaleDateString()
          : "Not Returned"
      }</td>
      <td>
        ${
          record.returnDate
            ? ""
            : `<button class="btn btn-primary btn-sm" onclick="returnBook(${record.bookId})">Return</button>`
        }
      </td>
    `;
    borrowedHistoryList.appendChild(row);
  });
}

// Member - Delete account
document
  .getElementById("deleteAccount")
  .addEventListener("click", async function () {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      await fetch("http://your-api-url/members/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Log out and redirect to login page
      localStorage.clear();
      window.location.href = "login.html";
    }
  });
